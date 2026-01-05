/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const { setGlobalOptions } = functions;
const { onCall, onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const logger = require("firebase-functions/logger");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const SibApiV3Sdk = require("sib-api-v3-sdk");
const axios = require("axios");

// Initialisation de Firebase Admin (si pas déjà fait)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Définition des secrets modernes (Firebase Functions v7+)
// Commandes à faire une seule fois :
// firebase functions:secrets:set STRIPE_SECRET_KEY
// firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
// firebase functions:secrets:set SITE_URL
// firebase functions:secrets:set BOXTAL_ACCESS_KEY
// firebase functions:secrets:set BOXTAL_SECRET_KEY
// firebase functions:secrets:set BOXTAL_API_BASE_URL
const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
const SITE_URL = defineSecret("SITE_URL");
const BREVO_API_KEY = defineSecret("BREVO_API_KEY");
const BOXTAL_API_BASE_URL = defineSecret("BOXTAL_API_BASE_URL");
const BOXTAL_ACCESS_KEY   = defineSecret("BOXTAL_ACCESS_KEY");
const BOXTAL_SECRET_KEY   = defineSecret("BOXTAL_SECRET_KEY");
const BOXTAL_MAP_ACCESS_KEY = defineSecret("BOXTAL_MAP_ACCESS_KEY");
const BOXTAL_MAP_SECRET_KEY = defineSecret("BOXTAL_MAP_SECRET_KEY");
const BOXTAL_WEBHOOK_SECRET = defineSecret("BOXTAL_WEBHOOK_SECRET");

// ===== Helpers Brevo (Sendinblue) pour les emails transactionnels =====

// Initialisation de l'API transactionnelle Brevo
function getBrevoTransactionalApi() {
  const brevoClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = brevoClient.authentications["api-key"];

  // On lit la clé API depuis le secret Firebase
  apiKey.apiKey = BREVO_API_KEY.value();

  return new SibApiV3Sdk.TransactionalEmailsApi();
}

// Template HTML - Email de confirmation de commande
function buildOrderConfirmationEmailHtml({
  client,
  items,
  total,
  orderId,
  baseUrl,
  shippingMethod,
  shippingLabel,
  shippingPrice,
  relayPoint,
}) {
  const firstName = client.prenom || client.nom || "client";
  const fullName =
    `${client.prenom || ""} ${client.nom || ""}`.trim() || "Client Vertyno";
  const safeBaseUrl = baseUrl || "https://vertyno.com";

  // --- Adresse du client ---
  const adresseRue = (client.adresse || "").trim();
  const adresseCodePostal = (client.codePostal || "").trim();
  const adresseVille = (client.ville || "").trim();
  const adresseComplete = [adresseRue, adresseCodePostal, adresseVille]
    .filter(Boolean)
    .join(", ") || "Non renseignée";

  // --- Infos point relais (beaucoup plus tolérant) ---
  const hasRelayPoint = !!relayPoint; // on considère qu'il y a un relais dès que l'objet existe

  const relayName = hasRelayPoint
    ? (relayPoint.name || relayPoint.label || "Point relais")
    : null;

  // Rue du point relais : on essaie plusieurs sources
  const relayStreet = hasRelayPoint
    ? (
        relayPoint.street ||
        relayPoint.address ||
        relayPoint.raw?.address?.street ||
        relayPoint.raw?.addressLine1 ||
        // 🔥 Nouveau : on va aussi chercher dans raw.location.street
        relayPoint.raw?.location?.street ||
        ""
      ).trim()
    : "";

  // Code postal : on gère postalCode, postal_code et les champs dans raw
  const relayPostalCode = hasRelayPoint
    ? (
        relayPoint.postalCode ||
        relayPoint.postal_code ||
        relayPoint.raw?.address?.zipCode ||
        relayPoint.raw?.zipCode ||
        // 🔥 Nouveau : code postal dans raw.location.zipCode
        relayPoint.raw?.location?.zipCode ||
        ""
      ).trim()
    : "";

  // Ville : idem, on va la chercher dans plusieurs endroits possibles
  const relayCity = hasRelayPoint
    ? (
        relayPoint.city ||
        relayPoint.locality ||
        relayPoint.raw?.address?.city ||
        relayPoint.raw?.city ||
        // 🔥 Nouveau : ville dans raw.location.city
        relayPoint.raw?.location?.city ||
        ""
      ).trim()
    : "";

  const relayFullAddress = hasRelayPoint
    ? [relayStreet, relayPostalCode, relayCity].filter(Boolean).join(", ")
    : null;

  // --- Libellés de livraison ---
  const shippingModeFromMethod =
    shippingMethod === "relay"
      ? "Livraison en point relais"
      : shippingMethod === "home"
      ? "Livraison à domicile"
      : "Livraison";

  const shippingModeLabel = shippingLabel || shippingModeFromMethod;

  const shippingPriceText =
    typeof shippingPrice === "number"
      ? `${shippingPrice.toFixed(2)}€`
      : null;

  // --- Items ---
  const itemsHtml = (items || [])
    .map((item) => {
      const getImageUrl = (imagePath) => {
        if (!imagePath) return `${safeBaseUrl}/images/default-product.webp`;
        if (
          imagePath.startsWith("http://") ||
          imagePath.startsWith("https://")
        ) {
          return imagePath;
        }
        if (imagePath.startsWith("/")) {
          return `${safeBaseUrl}${imagePath}`;
        }
        const slug = imagePath.includes("/")
          ? imagePath
          : `${imagePath}_1.webp`;
        return `${safeBaseUrl}/images/${slug}`;
      };

      let itemImage;
      if (item.image) {
        itemImage = getImageUrl(item.image);
      } else if (item.slug) {
        itemImage = `${safeBaseUrl}/images/${item.slug}_1.webp`;
      } else if (item.id) {
        itemImage = `${safeBaseUrl}/images/${item.id}_1.webp`;
      } else {
        itemImage = `${safeBaseUrl}/images/default-product.webp`;
      }

      const linePrice = (item.price * item.quantity).toFixed(2);

      return `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #f0e0d8;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="width: 80px; vertical-align: top; padding-right: 16px;">
                  <img src="${itemImage}" alt="${item.name ||
        "Produit"}" width="80" height="80" style="width: 80px; height: 80px; display: block; border-radius: 8px; border: 1px solid #f0e0d8;" />
                </td>
                <td style="vertical-align: top;">
                  <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #4b3b36;">${item.name ||
        "Produit"}</p>
                  <p style="margin: 0 0 4px 0; font-size: 14px; color: #6d5a52;">× ${item.quantity || 1}</p>
                  <p style="margin: 0; font-size: 14px; color: #4b3b36; font-weight: 600;">Prix : ${linePrice}€</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join("");

  return `
   <div style="background-color:#f9f4f1;padding:20px 0;font-family:'Lexend Giga',Arial,Helvetica,sans-serif;">
     <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
       <!-- Header -->
       <tr>
         <td style="background:linear-gradient(135deg,#EAD9CE,#fbe9e7);padding:32px 24px 24px 24px;text-align:center;">
           <img src="${safeBaseUrl}/logo-entier.png" alt="Vertyno" style="height:56px;margin-bottom:16px;" />
           <h1 style="margin:0;font-size:28px;color:#4b3b36;font-weight:700;">🎉 Votre commande VERTYNO est confirmée !</h1>
           <p style="margin:12px 0 0 0;font-size:16px;color:#5f4c44;font-weight:400;">Merci pour votre confiance 🤍</p>
           <p style="margin:8px 0 0 0;font-size:15px;color:#6d5a52;">Votre commande est désormais enregistrée et notre équipe la prépare avec le plus grand soin.</p>
         </td>
       </tr>

       <!-- Salutation -->
       <tr>
         <td style="padding:24px 24px 16px 24px;">
           <p style="font-size:16px;color:#4b3b36;margin:0 0 16px 0;font-weight:400;">Bonjour ${firstName},</p>
           <p style="font-size:15px;color:#6d5a52;margin:0;line-height:1.6;font-weight:400;">
             Nous avons bien reçu votre paiement.
           </p>
           <p style="font-size:15px;color:#6d5a52;margin:8px 0 0 0;line-height:1.6;font-weight:400;">
             Voici le récapitulatif complet de votre commande :
           </p>
         </td>
       </tr>

       <!-- Détails de commande -->
       <tr>
         <td style="padding:0 24px 16px 24px;">
           <h2 style="font-size:18px;color:#4b3b36;margin:0 0 12px 0;font-weight:600;">🧾 Détails de commande</h2>
           <div style="background:#fdf7f3;border-radius:12px;padding:16px;border:1px solid #f0e0d8;">
             <p style="margin:0 0 8px 0;font-size:14px;color:#7b5a4a;line-height:1.6;">
               <strong style="color:#4b3b36;">Numéro de commande :</strong> ${orderId}
             </p>
             <p style="margin:0 0 8px 0;font-size:14px;color:#7b5a4a;line-height:1.6;">
               <strong style="color:#4b3b36;">Client :</strong> ${fullName}
             </p>
             <p style="margin:0 0 8px 0;font-size:14px;color:#7b5a4a;line-height:1.6;">
               <strong style="color:#4b3b36;">Email :</strong> ${client.email}
             </p>
             <p style="margin:0 0 8px 0;font-size:14px;color:#7b5a4a;line-height:1.6;">
               <strong style="color:#4b3b36;">Adresse :</strong> ${adresseComplete}
             </p>
             <p style="margin:0 0 8px 0;font-size:14px;color:#7b5a4a;line-height:1.6;">
               <strong style="color:#4b3b36;">Mode de livraison :</strong> ${shippingModeLabel}
             </p>
             ${
               hasRelayPoint && (relayName || relayFullAddress)
                 ? `
                   <p style="margin:0 0 4px 0;font-size:14px;color:#7b5a4a;line-height:1.6;">
                     <strong style="color:#4b3b36;">Point relais :</strong> ${relayName || ""}
                   </p>
                   <p style="margin:0 0 4px 0;font-size:14px;color:#7b5a4a;line-height:1.6;">
                     <strong style="color:#4b3b36;">Adresse du point relais :</strong> ${relayFullAddress || ""}
                   </p>
                 `
                 : ""
             }
             ${
               shippingPriceText
                 ? `
                   <p style="margin:0;font-size:14px;color:#7b5a4a;line-height:1.6;">
                     <strong style="color:#4b3b36;">Frais de livraison :</strong> ${shippingPriceText}
                   </p>
                 `
                 : ""
             }
           </div>
         </td>
       </tr>

       <!-- Vos articles -->
       <tr>
         <td style="padding:0 24px 16px 24px;">
           <h2 style="font-size:18px;color:#4b3b36;margin:0 0 12px 0;font-weight:600;">📦 Vos articles</h2>
           <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
             ${itemsHtml}
             <tr>
               <td style="padding:16px 0 0 0;border-top:2px solid #f0e0d8;">
                 <table width="100%" cellpadding="0" cellspacing="0">
                   <tr>
                     <td style="font-size:18px;font-weight:700;color:#4b3b36;">Total :</td>
                     <td style="text-align:right;font-size:18px;font-weight:700;color:#4b3b36;">${Number(total || 0).toFixed(2)}€</td>
                   </tr>
                 </table>
               </td>
             </tr>
           </table>
         </td>
       </tr>

       <!-- Livraison & suivi -->
       <tr>
         <td style="padding:0 24px 24px 24px;">
           <h2 style="font-size:18px;color:#4b3b36;margin:0 0 12px 0;font-weight:600;">🚚 Livraison & suivi</h2>
           <div style="background:#fdf7f3;border-radius:12px;padding:16px;border:1px solid #f0e0d8;margin-bottom:16px;">
             <p style="margin:0 0 8px 0;font-size:14px;color:#7b5a4a;line-height:1.6;">
               <strong style="color:#4b3b36;">Mode de livraison :</strong> ${shippingModeLabel}
             </p>
             ${
               shippingLabel
                 ? `
                   <p style="margin:0 0 8px 0;font-size:14px;color:#7b5a4a;line-height:1.6;">
                     <strong style="color:#4b3b36;">Détails :</strong> ${shippingLabel}
                   </p>
                 `
                 : ""
             }
             ${
               hasRelayPoint && (relayName || relayFullAddress)
                 ? `
                   <p style="margin:0 0 4px 0;font-size:14px;color:#7b5a4a;line-height:1.6;">
                     <strong style="color:#4b3b36;">Point relais :</strong> ${relayName || ""}
                   </p>
                   <p style="margin:0;font-size:14px;color:#7b5a4a;line-height:1.6;">
                     <strong style="color:#4b3b36;">Adresse :</strong> ${relayFullAddress || ""}
                   </p>
                 `
                 : ""
             }
           </div>

           <p style="font-size:15px;color:#6d5a52;margin:0 0 12px 0;line-height:1.6;font-weight:400;">
             Votre colis sera expédié sous 24 h ouvrées.
           </p>
           <p style="font-size:15px;color:#6d5a52;margin:0;line-height:1.6;font-weight:400;">
             Dès qu'il sera remis au transporteur, vous recevrez automatiquement :
           </p>
           <ul style="margin:8px 0 0 0;padding-left:20px;font-size:15px;color:#6d5a52;line-height:1.8;font-weight:400;">
             <li>un email de confirmation d'expédition</li>
             <li>votre numéro de suivi</li>
             <li>un lien pour suivre votre veilleuse en temps réel ✨</li>
           </ul>
         </td>
       </tr>

       <!-- (le reste du template "Vous aimerez peut-être aussi…" reste inchangé) -->
     </table>
   </div>
  `;
}

// Template HTML - Email de remerciement / fidélisation
function buildThankYouEmailHtml({ client, baseUrl }) {
  const firstName = client.prenom || client.nom || "client";
  const safeBaseUrl = baseUrl || "https://vertyno.com";

  return `
  <div style="background-color:#f9f4f1;padding:20px 0;font-family:Arial,Helvetica,sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.06);">
      <tr>
        <td style="background:linear-gradient(135deg,#fbe9e7,#EAD9CE);padding:24px 24px 18px 24px;text-align:center;">
          <img src="${safeBaseUrl}/logo-entier.png" alt="Vertyno" style="height:48px;margin-bottom:12px;border-radius:12px;" />
          <h1 style="margin:0;font-size:22px;color:#4b3b36;">Merci pour votre achat 🧡</h1>
          <p style="margin:8px 0 0 0;font-size:14px;color:#5f4c44;">Nous espérons que votre enfant adorera sa nouvelle veilleuse.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 24px 12px 24px;">
          <p style="font-size:15px;color:#4b3b36;margin:0 0 12px 0;">Bonjour ${firstName},</p>
          <p style="font-size:14px;color:#6d5a52;margin:0 0 16px 0;">
            Toute l'équipe Vertyno vous remercie chaleureusement pour votre confiance. Pour vous inspirer, voici quelques idées qui
            pourraient compléter joliment votre commande :
          </p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 16px 8px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td style="width:33.33%;padding:8px;">
                <a href="${safeBaseUrl}/LiliLlaLicorne" style="text-decoration:none;color:inherit;">
                  <div style="background:#fdf7f3;border-radius:14px;overflow:hidden;border:1px solid #f0e0d8;">
                    <img src="${safeBaseUrl}/images/lili-produits.jpg" alt="Lili la Licorne" width="100%" height="90" style="width:100%;height:90px;display:block;object-fit:cover;" />
                    <div style="padding:8px 8px 10px 8px;">
                      <p style="margin:0;font-size:12px;color:#4b3b36;font-weight:bold;">Veilleuse Lili la Licorne</p>
                    </div>
                  </div>
                </a>
              </td>
              <td style="width:33.33%;padding:8px;">
                <a href="${safeBaseUrl}/Dinoledinosaure" style="text-decoration:none;color:inherit;">
                  <div style="background:#fdf7f3;border-radius:14px;overflow:hidden;border:1px solid #f0e0d8;">
                    <img src="${safeBaseUrl}/images/dino-produits.jpg" alt="Dino le Dinosaure" width="100%" height="90" style="width:100%;height:90px;display:block;object-fit:cover;" />
                    <div style="padding:8px 8px 10px 8px;">
                      <p style="margin:0;font-size:12px;color:#4b3b36;font-weight:bold;">Veilleuse Dino le Dinosaure</p>
                    </div>
                  </div>
                </a>
              </td>
              <td style="width:33.33%;padding:8px;">
                <a href="${safeBaseUrl}/Mochilepanda" style="text-decoration:none;color:inherit;">
                  <div style="background:#fdf7f3;border-radius:14px;overflow:hidden;border:1px solid #f0e0d8;">
                    <img src="${safeBaseUrl}/images/mochi-produits.jpg" alt="Mochi le Panda" width="100%" height="90" style="width:100%;height:90px;display:block;object-fit:cover;" />
                    <div style="padding:8px 8px 10px 8px;">
                      <p style="margin:0;font-size:12px;color:#4b3b36;font-weight:bold;">Veilleuse Mochi le Panda</p>
                    </div>
                  </div>
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 24px 24px 24px;">
          <p style="font-size:13px;color:#6d5a52;margin:0 0 16px 0;">
            En cas de question ou de besoin d'aide, notre équipe est là pour vous accompagner.
          </p>
          <a href="${safeBaseUrl}" style="display:inline-block;padding:10px 22px;border-radius:999px;background:#ffffff;color:#4b3b36;text-decoration:none;font-size:14px;font-weight:bold;border:2px solid #e9a0a8;">
            Retourner sur la boutique
          </a>
        </td>
      </tr>
      <tr>
        <td style="background:#f7eee9;padding:14px 24px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#8c6f63;">
            Vertyno • Merci de faire partie de notre univers doux et rassurant
          </p>
        </td>
      </tr>
    </table>
  </div>
  `;
}

// Template HTML - Email administrateur (notification interne)
function buildAdminOrderEmailHtml({
  client,
  items,
  total,
  orderId,
  baseUrl,
  shippingMethod,
  shippingLabel,
  shippingPrice,
  relayPoint,
}) {
  const safeBaseUrl = baseUrl || "https://vertyno.com";

  const fullName =
    `${client.prenom || ""} ${client.nom || ""}`.trim() || "Client Vertyno";
  const clientEmail = client.email || "";
  const clientPhone = client.telephone || client.phone || "";

  const adresseRue = (client.adresse || "").trim();
  const adresseCodePostal = (client.codePostal || "").trim();
  const adresseVille = (client.ville || "").trim();
  const adresseComplete = [adresseRue, adresseCodePostal, adresseVille]
    .filter(Boolean)
    .join(", ") || "Non renseignée";

  // --- Livraison ---
  const shippingModeFromMethod =
    shippingMethod === "relay"
      ? "Livraison en point relais"
      : shippingMethod === "home"
      ? "Livraison à domicile"
      : "Livraison";

  const shippingModeLabel = shippingLabel || shippingModeFromMethod;

  const shippingPriceText =
    typeof shippingPrice === "number"
      ? `${shippingPrice.toFixed(2)}€`
      : null;

  // --- Point relais (on récupère au mieux les infos) ---
  const hasRelayPoint = !!relayPoint;

  const relayName = hasRelayPoint
    ? (relayPoint.name || relayPoint.raw?.name || "Point relais")
    : null;

  const relayStreet = hasRelayPoint
    ? (
        relayPoint.street ||
        relayPoint.address ||
        relayPoint.raw?.address?.street ||
        relayPoint.raw?.addressLine1 ||
        relayPoint.raw?.location?.street ||
        ""
      ).toString().trim()
    : "";

  const relayPostalCode = hasRelayPoint
    ? (
        relayPoint.postalCode ||
        relayPoint.postal_code ||
        relayPoint.raw?.address?.zipCode ||
        relayPoint.raw?.zipCode ||
        relayPoint.raw?.location?.zipCode ||
        ""
      ).toString().trim()
    : "";

  const relayCity = hasRelayPoint
    ? (
        relayPoint.city ||
        relayPoint.locality ||
        relayPoint.raw?.address?.city ||
        relayPoint.raw?.city ||
        relayPoint.raw?.location?.city ||
        ""
      ).toString().trim()
    : "";

  const relayFullAddress = hasRelayPoint
    ? [relayStreet, relayPostalCode, relayCity].filter(Boolean).join(", ")
    : "";

  // --- Articles ---
  const itemsRows = (items || [])
    .map((item) => {
      const qty = item.quantity || 1;
      const unitPrice = Number(item.price || 0);
      const lineTotal = unitPrice * qty;

      return `
        <tr>
          <td style="padding:8px;border:1px solid #e0e0e0;">${item.name || "Produit"}</td>
          <td style="padding:8px;border:1px solid #e0e0e0;text-align:center;">${qty}</td>
          <td style="padding:8px;border:1px solid #e0e0e0;text-align:right;">${unitPrice.toFixed(2)}€</td>
          <td style="padding:8px;border:1px solid #e0e0e0;text-align:right;">${lineTotal.toFixed(2)}€</td>
        </tr>
      `;
    })
    .join("");

  const totalNumber = Number(total || 0);
  const formattedTotal = totalNumber.toFixed(2);

  return `
  <div style="background-color:#f5f5f5;padding:20px 0;font-family:Arial,Helvetica,sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:720px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e0e0e0;">
      <tr>
        <td style="padding:20px 24px;border-bottom:1px solid #e0e0e0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td style="vertical-align:middle;">
                <h1 style="margin:0;font-size:18px;color:#333333;font-weight:600;">
                  Nouvelle commande reçue
                </h1>
                <p style="margin:4px 0 0 0;font-size:13px;color:#666666;">
                  Référence commande : <strong>#${orderId}</strong>
                </p>
              </td>
              <td style="text-align:right;vertical-align:middle;">
                <img src="${safeBaseUrl}/logo-entier.png" alt="Vertyno" style="height:40px;" />
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:20px 24px;">
          <h2 style="margin:0 0 8px 0;font-size:15px;color:#333333;">Informations client</h2>
          <p style="margin:4px 0;font-size:13px;color:#444444;">
            <strong>Nom :</strong> ${fullName}
          </p>
          <p style="margin:4px 0;font-size:13px;color:#444444;">
            <strong>Email :</strong> ${clientEmail}
          </p>
          <p style="margin:4px 0;font-size:13px;color:#444444;">
            <strong>Téléphone :</strong> ${clientPhone || "Non renseigné"}
          </p>
          <p style="margin:4px 0;font-size:13px;color:#444444;">
            <strong>Adresse :</strong> ${adresseComplete}
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:0 24px 16px 24px;">
          <h2 style="margin:0 0 8px 0;font-size:15px;color:#333333;">Livraison</h2>
          <p style="margin:4px 0;font-size:13px;color:#444444;">
            <strong>Mode :</strong> ${shippingModeLabel}
          </p>
          ${
            shippingPriceText
              ? `<p style="margin:4px 0;font-size:13px;color:#444444;">
                  <strong>Frais de livraison :</strong> ${shippingPriceText}
                </p>`
              : ""
          }
          ${
            hasRelayPoint
              ? `
                <p style="margin:4px 0;font-size:13px;color:#444444;">
                  <strong>Point relais :</strong> ${relayName}
                </p>
                <p style="margin:4px 0;font-size:13px;color:#444444;">
                  <strong>Adresse point relais :</strong> ${relayFullAddress || "Non renseignée"}
                </p>
              `
              : ""
          }
          ${
            shippingLabel
              ? `<p style="margin:4px 0;font-size:13px;color:#777777;">
                  <strong>Détails transporteur :</strong> ${shippingLabel}
                </p>`
              : ""
          }
        </td>
      </tr>

      <tr>
        <td style="padding:0 24px 20px 24px;">
          <h2 style="margin:0 0 8px 0;font-size:15px;color:#333333;">Détail des articles</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;color:#333333;">
            <thead>
              <tr>
                <th align="left" style="padding:8px;border:1px solid #e0e0e0;">Article</th>
                <th align="center" style="padding:8px;border:1px solid #e0e0e0;">Qté</th>
                <th align="right" style="padding:8px;border:1px solid #e0e0e0;">Prix unitaire</th>
                <th align="right" style="padding:8px;border:1px solid #e0e0e0;">Total ligne</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
              <tr>
                <td colspan="3" style="padding:8px;border:1px solid #e0e0e0;text-align:right;font-weight:600;">
                  Total commande
                </td>
                <td style="padding:8px;border:1px solid #e0e0e0;text-align:right;font-weight:600;">
                  ${formattedTotal}€
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>

      <tr>
        <td style="padding:12px 24px 20px 24px;font-size:11px;color:#888888;border-top:1px solid #e0e0e0;">
          <p style="margin:0 0 4px 0;">
            Cet email est destiné à l'équipe Vertyno. Le client reçoit une confirmation séparée.
          </p>
        </td>
      </tr>
    </table>
  </div>
  `;
}

// Envoi de l'email de confirmation de commande
async function sendOrderConfirmationEmail({ 
  client, 
  items, 
  total, 
  orderId, 
  baseUrl,
  shippingMethod,
  shippingLabel,
  shippingPrice,
  relayPoint,
}) {
  const transactionalApi = getBrevoTransactionalApi();
  const htmlContent = buildOrderConfirmationEmailHtml({
    client,
    items,
    total,
    orderId,
    baseUrl,
    shippingMethod,
    shippingLabel,
    shippingPrice,
    relayPoint,
  });

  await transactionalApi.sendTransacEmail({
    sender: {
      name: "Vertyno",
      email: "no-reply@vertyno.com",
    },
    to: [
      {
        email: client.email,
        name: `${client.prenom || ""} ${client.nom || ""}`.trim(),
      },
    ],
    subject: "Votre commande Vertyno a bien été confirmée 🎉",
    htmlContent,
  });
}

// Envoi de l'email de remerciement / fidélisation
async function sendThankYouEmail({ client, baseUrl }) {
  const transactionalApi = getBrevoTransactionalApi();
  const htmlContent = buildThankYouEmailHtml({
    client,
    baseUrl,
  });

  await transactionalApi.sendTransacEmail({
    sender: {
      name: "Vertyno",
      email: "no-reply@vertyno.com",
    },
    to: [
      {
        email: client.email,
        name: `${client.prenom || ""} ${client.nom || ""}`.trim(),
      },
    ],
    subject: "Merci pour votre achat 🧡",
    htmlContent,
  });
}

// Envoi de l'email de notification administrateur
async function sendAdminOrderEmail({
  client,
  items,
  total,
  orderId,
  baseUrl,
  shippingMethod,
  shippingLabel,
  shippingPrice,
  relayPoint,
}) {
  const transactionalApi = getBrevoTransactionalApi();
  const htmlContent = buildAdminOrderEmailHtml({
    client,
    items,
    total,
    orderId,
    baseUrl,
    shippingMethod,
    shippingLabel,
    shippingPrice,
    relayPoint,
  });

  const totalNumber = Number(total || 0);
  const formattedTotal = totalNumber.toFixed(2);

  await transactionalApi.sendTransacEmail({
    sender: {
      name: "Vertyno - Commandes",
      email: "no-reply@vertyno.com",
    },
    to: [
      {
        email: "abesse.bel@vertyno.com",
        name: "Vertyno - Administration",
      },
      {
        email: "mickaelouis03@gmail.com",
        name: "Mickael - Copie commande",
      },
    ],
    subject: `Nouvelle commande Vertyno reçue (#${orderId}) - ${formattedTotal}€`,
    htmlContent,
  });
}

// Options globales (sans accès aux secrets ici)
setGlobalOptions({
  maxInstances: 10,
});

/**
 * Fonction pour créer une session Stripe Checkout
 * Reçoit les articles du panier et retourne l'URL de la session Stripe
 * 
 * @param {Object} data - Les données envoyées depuis le client
 * @param {Array} data.items - Tableau des articles du panier
 *   Format: [{ stripePriceId: "price_xxx", quantity: 2, name?: "..." }]
 * @param {string} data.checkoutSessionId - ID Firestore du document checkout_sessions (OBLIGATOIRE)
 * @param {string} data.successUrl - URL de redirection en cas de succès (optionnel)
 * @param {string} data.cancelUrl - URL de redirection en cas d'annulation (optionnel)
 * @returns {Object} { url: string, sessionId: string } - URL de la session Stripe Checkout et son ID
 */
exports.createCheckoutSession = onCall(
  {
    // On déclare ici les secrets utilisés par CETTE fonction
    secrets: [STRIPE_SECRET_KEY, SITE_URL],
  },
  async (request) => {
    try {
      const { items, successUrl, cancelUrl, checkoutSessionId, shipping } = request.data;
      
      // Extraction des informations de livraison
      const shippingMethod = shipping?.method || "relay";
      const shippingLabel = shipping?.label || "Livraison";
      const shippingPrice = shipping?.price || 0; // Prix en euros, on convertira en cents pour Stripe

      // ⚠️ IMPORTANT : on initialise Stripe ICI, à l'intérieur de la fonction
      const stripe = require("stripe")(STRIPE_SECRET_KEY.value());

      // Vérification que les items sont présents
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error("Les articles du panier sont requis");
      }

      // Vérification que checkoutSessionId est présent (obligatoire pour lier Stripe à Firestore)
      if (!checkoutSessionId) {
        throw new Error("checkoutSessionId est requis pour créer une session Stripe");
      }

      // Conversion des articles du panier en line_items Stripe
      const lineItems = items.map((item) => {
        if (!item.stripePriceId) {
          throw new Error(
            `stripePriceId manquant pour : ${item.name || "inconnu"}`
          );
        }

        if (!item.quantity || item.quantity < 1) {
          throw new Error(
            `Quantité invalide pour : ${item.name || "inconnu"}`
          );
        }

        return {
          price: item.stripePriceId, // Price ID Stripe (ex: price_1ABC...)
          quantity: item.quantity,
        };
      });

      // Si des frais de livraison sont à ajouter (> 0), on ajoute une ligne "Livraison" dans line_items
      if (shippingPrice > 0) {
        lineItems.push({
          price_data: {
            currency: "eur",
            product_data: {
              name: shippingLabel || "Livraison à domicile",
            },
            unit_amount: Math.round(shippingPrice * 100), // Conversion en centimes
          },
          quantity: 1,
        });
        
        logger.info("Frais de livraison ajoutés aux line_items Stripe", {
          label: shippingLabel,
          price: shippingPrice,
        });
      }

      // Récupération de l'URL de base depuis le secret SITE_URL
      const baseUrl = SITE_URL.value() || "https://votresite.com";
      const success = successUrl || `${baseUrl}/Panier?success=true`;
      const cancel = cancelUrl || `${baseUrl}/Panier?canceled=true`;

      // Création de la session Stripe Checkout
      // IMPORTANT : On ajoute firestoreCheckoutSessionId dans les métadonnées
      // pour que le webhook puisse retrouver le document Firestore correspondant
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: lineItems,
        success_url: success,
        cancel_url: cancel,
        locale: "fr",
        metadata: {
          items_count: items.length.toString(),
          // 🔗 Lien entre Stripe et Firestore : le webhook utilisera cette valeur
          firestoreCheckoutSessionId: checkoutSessionId,
          shipping_method: shippingMethod,
          shipping_label: shippingLabel,
          shipping_price: shippingPrice.toString(),
        },
      });

      logger.info("Session Stripe créée", {
        sessionId: session.id,
        checkoutSessionId: checkoutSessionId,
        itemsCount: items.length,
        shippingMethod: shippingMethod,
        shippingPrice: shippingPrice,
      });

      // Retour de l'URL de la session et de l'ID de session
      return { 
        url: session.url,
        sessionId: session.id 
      };
    } catch (error) {
      logger.error("Erreur lors de la création de la session Stripe", {
        error: error.message,
        stack: error.stack,
      });
      throw new Error(`Erreur lors de la création de la session : ${error.message}`);
    }
  }
);

/**
 * === GET POINTS RELAIS BOXTAL (API v3) ===
 * Utilise l'endpoint GET /v3.2/parcel-point-by-shipping-offer
 * pour trouver des points relais autour d'un code postal + ville.
 */
exports.getBoxtalRelays = onCall(
  {
    secrets: [BOXTAL_ACCESS_KEY, BOXTAL_SECRET_KEY, BOXTAL_API_BASE_URL],
  },
  async (request) => {
    try {
      logger.info("getBoxtalRelays appelé", { data: request.data });

      const { postalCode, city, country = "FR" } = request.data || {};

      logger.info("Paramètres reçus", { postalCode, city, country });

      if (!postalCode || !city) {
        logger.warn("postalCode ou city manquant");
        throw new functions.https.HttpsError(
          "invalid-argument",
          "postalCode et city sont obligatoires"
        );
      }

      const accessKey = BOXTAL_ACCESS_KEY.value();
      const secretKey = BOXTAL_SECRET_KEY.value();
      const baseUrl = BOXTAL_API_BASE_URL.value();

      logger.info("Secrets récupérés", {
        hasAccessKey: !!accessKey,
        hasSecretKey: !!secretKey,
        hasBaseUrl: !!baseUrl,
        // baseUrl non loggé pour sécurité (peut contenir des infos sensibles)
      });

      if (!accessKey || !secretKey || !baseUrl) {
        logger.error("Secrets Boxtal manquants");
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Clés Boxtal ou URL API non configurées"
        );
      }

      const credentials = Buffer.from(`${accessKey}:${secretKey}`).toString("base64");

      const url = `${baseUrl}/v3.2/parcel-point-by-shipping-offer`;

      logger.info("URL Boxtal construite", { url });

      const params = {
        country,                // FR
        zipcode: postalCode,    // code postal client
        city,                   // ville client
        shippingOfferCode: "MONR-CpourToi", // Mondial Relay point relais
        type: "ARRIVAL",
      };

      logger.info("Paramètres de la requête", { params });

      const response = await axios.get(url, {
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: "application/json",
        },
        params,
      });

      logger.info("Réponse Boxtal reçue", {
        status: response.status,
        statusText: response.statusText,
        dataType: typeof response.data,
        hasParcelPoints: !!response.data?.parcelPoints,
        dataKeys: response.data ? Object.keys(response.data) : null,
      });

      const points = response.data?.parcelPoints || response.data || [];

      logger.info("Points extraits", {
        count: points.length,
        // Premier point non loggé en entier pour éviter les logs volumineux
        firstPointId: points[0]?.id || null,
        firstPointName: points[0]?.name || null,
      });

      return { relays: points };
    } catch (error) {
      logger.error("Erreur Boxtal getBoxtalRelays", {
        error: error.message,
        stack: error.stack,
        responseStatus: error.response?.status,
        responseStatusText: error.response?.statusText,
        // responseData et responseHeaders non loggés pour éviter les logs volumineux
        // Seulement les infos essentielles pour le debug
        errorMessage: error.response?.data?.message || error.response?.data?.error || null,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          // params non loggé (peut contenir des infos sensibles)
        } : null,
      });

      throw new functions.https.HttpsError(
        "internal",
        "Erreur lors de la récupération des points relais: " + error.message
      );
    }
  }
);

/**
 * ===== TOKEN POUR LE COMPOSANT CARTE BOXTAL =====
 * Renvoie un accessToken temporaire pour afficher la carte des points relais
 *
 * Utilise l'endpoint :
 * POST https://api.boxtal.com/iam/account-app/token
 * Authentification : Basic base64(accessKey:secretKey)
 */
exports.getBoxtalMapToken = onCall(
  {
    secrets: [BOXTAL_MAP_ACCESS_KEY, BOXTAL_MAP_SECRET_KEY],
  },
  async (request) => {
    try {
      const apiKey = BOXTAL_MAP_ACCESS_KEY.value();
      const apiSecret = BOXTAL_MAP_SECRET_KEY.value();

      if (!apiKey || !apiSecret) {
        throw new functions.https.HttpsError(
          "failed-precondition",
          "Clés Boxtal MAP manquantes"
        );
      }

      const response = await axios.post(
        "https://api.boxtal.com/iam/account-app/token",
        {},
        {
          auth: {
            username: apiKey,
            password: apiSecret,
          },
        }
      );

      const data = response.data || {};

      // On retourne directement l'objet { accessToken, expiresIn, tokenType }
      return data;
    } catch (error) {
      logger.error("Erreur Boxtal getBoxtalMapToken", {
        error: error.message,
        stack: error.stack,
        responseStatus: error.response?.status,
        // responseData non loggé pour éviter les logs volumineux
        errorMessage: error.response?.data?.message || error.response?.data?.error || null,
      });

      throw new functions.https.HttpsError(
        "internal",
        "Impossible de récupérer le token Boxtal : " +
          (error.response?.status || "") +
          " " +
          (error.response?.data?.messages?.[0]?.text || error.message)
      );
    }
  }
);

/**
 * === HELPER : CREER UN COLIS BOXTAL POUR UNE COMMANDE ===
 * Appelé depuis stripeWebhook quand la commande est payée.
 * 
 * ⚠️ TODO FUTUR : Migrer vers l'API v3 Boxtal
 * - URL base test : https://api.boxtal.build/shipping
 * - Endpoint : POST /v3.1/shipping-order
 * - Auth : avec les clés v3 (c'est une autre appli côté Boxtal)
 * - Stocker dans Firestore :
 *   - l'id de la commande Boxtal
 *   - les URLs des documents (étiquette PDF, etc.)
 *   - le statut
 * 
 * À faire une fois que :
 * - la carte affiche les points relais ✅
 * - tu peux sélectionner un relais ✅
 * - ça s'enregistre bien dans checkout_sessions ✅
 */
async function createBoxtalShipmentForOrder(commandeId, commandeData) {
  try {
    const accessKey = BOXTAL_ACCESS_KEY.value();
    const secretKey = BOXTAL_SECRET_KEY.value();
    const baseUrl = BOXTAL_API_BASE_URL.value();

    if (!accessKey || !secretKey || !baseUrl) {
      logger.warn("Boxtal non configuré, pas de création de colis", { commandeId });
      return null;
    }

    const axios = require("axios");
    const credentials = Buffer.from(`${accessKey}:${secretKey}`).toString("base64");

    const client = commandeData.client || {};
    const relayPoint = commandeData.relayPoint || null;
    const items = commandeData.items || [];
    
    // Calcul du poids total (par défaut 0.5kg par article si non spécifié)
    const totalWeightKg = items.reduce(
      (sum, it) => sum + (it.weight || 0.5) * (it.quantity || 1),
      0
    );

    // Endpoint Boxtal v3.1
    const url = `${baseUrl}/v3.1/shipping-order`;

    // ===== EXPÉDITEUR (sender) =====
    // TODO: adapter ces champs aux noms attendus par l'API v3 selon la doc officielle Boxtal
    const sender = {
      // TODO: confirmer les noms exacts des propriétés (name, companyName, etc.)
      name: "Vertyno",
      email: "abesse.bel@vertyno.com",
      phone: "+33634141451",
      address: {
        // TODO: adapter les noms de champs (street, streetLine1, addressLine1, etc.)
        street: "ADRESSE_RUE_BOUTIQUE_A_COMPLETER",
        postalCode: "CODE_POSTAL_BOUTIQUE",
        city: "VILLE_BOUTIQUE",
        country: "FR",
      },
    };

    // ===== DESTINATAIRE (receiver) =====
    let receiver;
    if (relayPoint) {
      // Livraison en point relais
      // TODO: adapter les noms de champs selon la doc Boxtal v3
      receiver = {
        // TODO: confirmer la structure exacte pour un point relais
        name: `${client.prenom || ""} ${client.nom || ""}`.trim(),
        email: client.email || "",
        phone: client.telephone || "",
        address: {
          // TODO: adapter selon la doc (street, streetLine1, etc.)
          street: relayPoint.street || relayPoint.address || "",
          postalCode: relayPoint.postalCode || relayPoint.postal_code || "",
          city: relayPoint.city || "",
          country: relayPoint.country || "FR",
        },
        // TODO: confirmer le nom exact du champ pour l'ID du point relais (relayId, parcelPointId, etc.)
        relayId: relayPoint.id || null,
      };
    } else {
      // Livraison à domicile
      // TODO: adapter les noms de champs selon la doc Boxtal v3
      receiver = {
        name: `${client.prenom || ""} ${client.nom || ""}`.trim(),
        email: client.email || "",
        phone: client.telephone || "",
        address: {
          // TODO: adapter selon la doc (street, streetLine1, etc.)
          street: client.adresse || "",
          postalCode: client.codePostal || "",
          city: client.ville || "",
          country: "FR",
        },
      };
    }

    // ===== PAYLOAD =====
    // ⚠️ IMPORTANT :
    // La structure exacte du body pour /v3.1/shipping-order doit être alignée avec la doc officielle Boxtal.
    // Ce bloc est un SQUELETTE que l'utilisateur devra adapter :
    // - renommer les champs si nécessaire
    // - ajouter les champs obligatoires manquants
    const payload = {
      shippingOrder: {
        // TODO: confirmer la structure shippingOrder.* dans la doc Boxtal
        sender,          // expéditeur
        recipient: receiver, // destinataire
        parcels: [
          {
            // TODO: adapter les noms des propriétés (weight, unit, weightUnit, etc.) selon la doc
            weight: totalWeightKg,
            // TODO: unité de poids (kg, g, etc.) - à confirmer dans la doc
            // weightUnit: "kg",
            // TODO: contentCategoryCode - à récupérer depuis GET /v3.1/content-category
            // contentCategoryCode: "A_COMPLETER",
          },
        ],
        // TODO: shippingOfferCode - à brancher plus tard depuis la commande
        // shippingOfferCode: commandeData.boxtalShippingOfferCode || undefined,
      },
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const data = response.data;

    logger.info("Boxtal v3 - shipping-order response", {
      commandeId,
      boxtalResponse: data,
    });

    // Construction de l'objet shipmentInfo basique
    // TODO: adapter selon la structure exacte de la réponse Boxtal v3
    const shipmentInfo = {
      shippingOrderId: data?.shippingOrder?.id || data.id || null,
      raw: data,
    };

    // Enregistrement dans Firestore sous le champ boxtal_v3
    // (sans supprimer boxtal existant si présent)
    await db.collection("commandes").doc(commandeId).update({
      boxtal_v3: shipmentInfo,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    logger.info("Colis Boxtal v3 créé avec succès", {
      commandeId,
      shippingOrderId: shipmentInfo.shippingOrderId,
    });

    return shipmentInfo;
  } catch (error) {
    logger.error("Erreur création colis Boxtal v3", {
      error: error.message,
      stack: error.stack,
      commandeId,
      responseStatus: error.response?.status,
      responseData: error.response?.data,
    });
    // on ne bloque pas le paiement
    return null;
  }
}

/**
 * Webhook Stripe pour gérer les événements de paiement
 * Quand un paiement est confirmé, on déplace la session de checkout_sessions vers commandes
 * 
 * IMPORTANT : Pour configurer le webhook dans Stripe Dashboard :
 * 1. Allez dans Stripe Dashboard > Developers > Webhooks
 * 2. Ajoutez l'URL de votre fonction : https://[region]-[project-id].cloudfunctions.net/stripeWebhook
 * 3. Sélectionnez l'événement : checkout.session.completed
 * 4. Copiez le "Signing secret" et configurez-le avec : firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
 * 
 * NOTE : Firebase Functions v2 parse automatiquement le body, donc on utilise req.body
 * Pour la vérification de signature, on reconstruit le body en JSON string
 */
exports.stripeWebhook = onRequest(
  {
    // STRIPE_SECRET_KEY : Stripe
    // STRIPE_WEBHOOK_SECRET : signature webhook Stripe
    // SITE_URL : ton site
    // BREVO_API_KEY : clé API Brevo
    // BOXTAL_ACCESS_KEY, BOXTAL_SECRET_KEY, BOXTAL_API_BASE_URL : Boxtal
    secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SITE_URL, BREVO_API_KEY, BOXTAL_ACCESS_KEY, BOXTAL_SECRET_KEY, BOXTAL_API_BASE_URL],
    cors: true,
  },
  async (req, res) => {
    const stripe = require("stripe")(STRIPE_SECRET_KEY.value());

    // On récupère la valeur du secret du webhook à l'exécution
    const webhookSecret = STRIPE_WEBHOOK_SECRET.value();

    if (!webhookSecret) {
      logger.error("STRIPE_WEBHOOK_SECRET non configuré");
      return res.status(500).send("Webhook secret non configuré");
    }

    const sig = req.headers["stripe-signature"];
    if (!sig) {
      logger.error("Signature Stripe manquante dans les headers");
      return res.status(400).send("Missing stripe-signature header");
    }

    // Dans Firebase v2, on utilise req.rawBody (buffer brut) pour la vérification de signature Stripe
    // C'est le payload exact signé par Stripe
    const rawBody = req.rawBody;

    let event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
    } catch (err) {
      logger.error("Erreur de signature Stripe", { error: err.message });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // ===== GESTION DE L'ÉVÉNEMENT checkout.session.completed =====
    // Quand un paiement est confirmé, on déplace la session de checkout_sessions
    // vers commandes et on crée une entrée dans clients_archive
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const stripeSessionId = session.id;

      try {
        // 🔗 Récupération du firestoreCheckoutSessionId depuis les métadonnées Stripe
        // C'est le lien entre Stripe et Firestore créé lors de la création de la session
        const firestoreCheckoutSessionId = session.metadata?.firestoreCheckoutSessionId;

        if (!firestoreCheckoutSessionId) {
          logger.error("firestoreCheckoutSessionId manquant dans les métadonnées Stripe", {
            stripeSessionId: stripeSessionId,
            metadata: session.metadata,
          });
          return res.status(200).json({ received: true }); // On répond 200 pour éviter les retries
        }

        // Chargement du document checkout_sessions depuis Firestore
        const checkoutSessionRef = db.collection("checkout_sessions").doc(firestoreCheckoutSessionId);
        const checkoutSessionDoc = await checkoutSessionRef.get();

        if (!checkoutSessionDoc.exists) {
          logger.warn("Document checkout_sessions non trouvé", {
            firestoreCheckoutSessionId: firestoreCheckoutSessionId,
            stripeSessionId: stripeSessionId,
          });
          return res.status(200).json({ received: true });
        }

        const checkoutSessionData = checkoutSessionDoc.data();

        // Log pour déboguer les données récupérées (sans logger l'objet client complet)
        logger.info("Données checkoutSessionData récupérées", {
          clientEmail: checkoutSessionData.client?.email || null,
          clientAdresse: checkoutSessionData.client?.adresse || null,
          clientVille: checkoutSessionData.client?.ville || null,
          clientCodePostal: checkoutSessionData.client?.codePostal || null,
          itemsCount: checkoutSessionData.items?.length || 0,
          total: checkoutSessionData.total || 0,
          shippingMethod: checkoutSessionData.shippingMethod || null,
          hasRelayPoint: !!checkoutSessionData.relayPoint,
        });

        // Vérification que la session n'a pas déjà été traitée
        if (checkoutSessionData.status === "paid") {
          logger.warn("Session déjà traitée", {
            firestoreCheckoutSessionId: firestoreCheckoutSessionId,
            stripeSessionId: stripeSessionId,
          });
          return res.status(200).json({ received: true });
        }

        // 🔗 Récupération du clientId depuis checkout_sessions
        const clientId = checkoutSessionData.clientId;

        if (!clientId) {
          logger.error("clientId manquant dans checkout_sessions", {
            firestoreCheckoutSessionId: firestoreCheckoutSessionId,
            stripeSessionId: stripeSessionId,
          });
          // On continue quand même, mais on log l'erreur
        }

        // ===== ÉTAPE 1 : Création de la commande dans la collection commandes =====
        const commandeData = {
          // 🔗 Lien vers le document client
          clientId: clientId || null,
          // Copie de toutes les données de la session checkout
          client: checkoutSessionData.client,
          items: checkoutSessionData.items,
          total: checkoutSessionData.total,
          paymentMethod: checkoutSessionData.paymentMethod,
          // Informations de livraison (récupérées depuis checkout_sessions)
          // Ces champs sont créés côté frontend dans Panier.jsx lors de handleCheckout
          shippingMethod: checkoutSessionData.shippingMethod || null, // "relay" ou "home"
          shippingPrice: checkoutSessionData.shippingPrice || 0, // Frais de livraison en euros
          shippingLabel: checkoutSessionData.shippingLabel || null, // Libellé de la livraison
          // Point relais sélectionné (si mode relay)
          // Structure : { id, name, street, postalCode, postal_code, city, country, provider }
          relayPoint: checkoutSessionData.relayPoint || null,
          // Informations de paiement Stripe
          stripeSessionId: stripeSessionId,
          stripePaymentIntentId: session.payment_intent || null,
          // Statut et dates
          status: "paid", // Paiement confirmé
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          createdAt: checkoutSessionData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
          // Référence à la session checkout originale
          originalCheckoutSessionId: firestoreCheckoutSessionId,
        };

        const commandeRef = await db.collection("commandes").add(commandeData);
        const commandeId = commandeRef.id;
        logger.info("Commande créée dans commandes", {
          commandeId: commandeId,
          clientId: clientId,
          firestoreCheckoutSessionId: firestoreCheckoutSessionId,
          stripeSessionId: stripeSessionId,
          shippingMethod: commandeData.shippingMethod,
          shippingPrice: commandeData.shippingPrice,
          hasRelayPoint: !!commandeData.relayPoint,
          relayPointId: commandeData.relayPoint?.id || null,
        });

        // ===== ÉTAPE 1.5 : Création du colis Boxtal =====
        // On crée le colis Boxtal après la création de la commande
        try {
          await createBoxtalShipmentForOrder(commandeId, commandeData);
        } catch (boxtalError) {
          // On log l'erreur mais on ne bloque pas le processus de paiement
          logger.error("Erreur lors de la création du colis Boxtal (non bloquant)", {
            commandeId: commandeId,
            error: boxtalError.message,
          });
        }

        // ===== ÉTAPE 2 : Création de l'archive client dans clients_archive =====
        // Cette collection sert de fichier client pour les personnes ayant réellement payé
        const clientArchiveData = {
          // 🔗 Lien vers le document client
          clientId: clientId || null,
          // Informations client
          client: {
            nom: checkoutSessionData.client.nom,
            prenom: checkoutSessionData.client.prenom,
            email: checkoutSessionData.client.email,
            telephone: checkoutSessionData.client.telephone,
            adresse: checkoutSessionData.client.adresse,
            complementAdresse: checkoutSessionData.client.complementAdresse || null,
            ville: checkoutSessionData.client.ville,
            codePostal: checkoutSessionData.client.codePostal,
          },
          // Panier commandé
          panier: checkoutSessionData.items.map((item) => ({
            id: item.id,
            slug: item.slug,
            name: item.name,
            category: item.category,
            price: item.price,
            quantity: item.quantity,
          })),
          // Informations de transaction
          total: checkoutSessionData.total,
          stripeSessionId: stripeSessionId,
          stripePaymentIntentId: session.payment_intent || null,
          // Références
          commandeId: commandeRef.id,
          originalCheckoutSessionId: firestoreCheckoutSessionId,
          // Dates
          paidAt: admin.firestore.FieldValue.serverTimestamp(),
          archivedAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection("clients_archive").add(clientArchiveData);
        logger.info("Client archivé dans clients_archive", {
          clientId: clientId,
          email: checkoutSessionData.client.email,
          commandeId: commandeRef.id,
        });

        // ===== ÉTAPE 3 : Mise à jour du document client dans clients =====
        if (clientId) {
          const clientRef = db.collection("clients").doc(clientId);
          const clientDoc = await clientRef.get();

          if (clientDoc.exists) {
            const clientData = clientDoc.data();
            const currentNbCommandes = clientData.nbCommandes || 0;

            // Mise à jour du client
            await clientRef.update({
              aDejaPaye: true, // Le client a maintenant payé au moins une commande
              derniereCommandeId: commandeRef.id, // ID de la dernière commande
              derniereActiviteAt: admin.firestore.FieldValue.serverTimestamp(), // Date de paiement
              nbCommandes: currentNbCommandes + 1, // Incrémentation du nombre de commandes
            });

            logger.info("Client mis à jour dans clients", {
              clientId: clientId,
              email: checkoutSessionData.client.email,
              nbCommandes: currentNbCommandes + 1,
            });
          } else {
            logger.warn("Document client non trouvé pour mise à jour", {
              clientId: clientId,
            });
          }
        }

        // ===== ÉTAPE 4 : Suppression des items du panier Firestore =====
        // Après paiement réussi, on supprime les items commandés du panier
        // On utilise les IDs des items dans checkout_sessions pour identifier les items à supprimer
        try {
          const panierRef = db.collection("panier");
          const panierSnapshot = await panierRef.get();

          if (!panierSnapshot.empty) {
            const itemsToDelete = checkoutSessionData.items || [];
            const itemIdsFromCheckout = new Set(itemsToDelete.map((item) => item.id));

            const batch = db.batch();
            let deletedCount = 0;

            // Parcourir tous les items du panier et supprimer ceux qui correspondent aux items commandés
            panierSnapshot.docs.forEach((panierDoc) => {
              const panierData = panierDoc.data();
              const panierItemId = panierData.id || panierDoc.id;

              // Si l'ID de l'item du panier correspond à un item commandé, on le supprime
              if (itemIdsFromCheckout.has(panierItemId)) {
                batch.delete(panierDoc.ref);
                deletedCount++;
              }
            });

            // Exécution du batch de suppression
            if (deletedCount > 0) {
              await batch.commit();
              logger.info("Items du panier supprimés après paiement réussi", {
                itemsDeleted: deletedCount,
                clientId: clientId,
                email: checkoutSessionData.client.email,
              });
            } else {
              logger.info("Aucun item du panier à supprimer", {
                clientId: clientId,
                email: checkoutSessionData.client.email,
              });
            }
          }
        } catch (panierError) {
          // On log l'erreur mais on ne bloque pas le processus de paiement
          logger.error("Erreur lors de la suppression des items du panier", {
            error: panierError.message,
            clientId: clientId,
            email: checkoutSessionData.client.email,
          });
        }

        // ===== ÉTAPE 5 : Suppression de la session checkout_sessions =====
        // La session n'est plus "en attente", elle est traitée
        await checkoutSessionRef.delete();
        logger.info("Session checkout_sessions supprimée", {
          firestoreCheckoutSessionId: firestoreCheckoutSessionId,
        });

        // ===== ÉTAPE 6 : Envoi des emails post-achat via Brevo =====
        try {
          const clientInfo = checkoutSessionData.client || {};
          const items = checkoutSessionData.items || [];
          const total = checkoutSessionData.total || 0;
          const baseUrl = SITE_URL.value() || "https://vertyno.com";
          const shippingMethod = checkoutSessionData.shippingMethod || null;
          const shippingLabel = checkoutSessionData.shippingLabel || null;
          const shippingPrice = checkoutSessionData.shippingPrice || 0;
          const relayPoint = checkoutSessionData.relayPoint || null;

          // Log pour déboguer les données client (sans logger l'objet complet)
          logger.info("Données client pour email", {
            email: clientInfo.email || null,
            adresse: clientInfo.adresse || null,
            ville: clientInfo.ville || null,
            codePostal: clientInfo.codePostal || null,
            itemsCount: items.length,
            total: total,
          });

          // Protection anti double-envoi : on vérifie les flags sur la commande
          const commandeSnapshot = await commandeRef.get();
          const commandeDataExisting = commandeSnapshot.data() || {};

          if (commandeDataExisting.emailConfirmationSent || commandeDataExisting.emailThankYouSent) {
            logger.info("Emails post-achat déjà envoyés, on ne renvoie pas", {
              commandeId: commandeRef.id,
              clientEmail: clientInfo.email,
            });
          } else {
            // Email 1 : Confirmation de commande (client)
            await sendOrderConfirmationEmail({
              client: clientInfo,
              items,
              total,
              orderId: commandeRef.id,
              baseUrl,
              shippingMethod,
              shippingLabel,
              shippingPrice,
              relayPoint,
            });

            // Email 2 : Remerciement / fidélisation (client)
            await sendThankYouEmail({
              client: clientInfo,
              baseUrl,
            });

            // Email 3 : Notification interne (admins)
            await sendAdminOrderEmail({
              client: clientInfo,
              items,
              total,
              orderId: commandeRef.id,
              baseUrl,
              shippingMethod,
              shippingLabel,
              shippingPrice,
              relayPoint,
            });

            // Mise à jour de la commande pour tracer les emails envoyés
            await commandeRef.update({
              emailConfirmationSent: true,
              emailThankYouSent: true,
            });

            logger.info("Emails post-achat envoyés avec succès via Brevo (client + admin)", {
              commandeId: commandeRef.id,
              clientEmail: clientInfo.email,
            });
          }
        } catch (emailError) {
          // On log l'erreur mais on ne bloque pas le processus de paiement
          logger.error("Erreur lors de l'envoi des emails post-achat Brevo", {
            error: emailError.message,
            stack: emailError.stack,
            commandeId: commandeRef.id,
          });
        }

        return res.status(200).json({ received: true });
      } catch (error) {
        logger.error("Erreur lors du traitement du webhook", {
          error: error.message,
          stack: error.stack,
          stripeSessionId: stripeSessionId,
        });
        // On répond 200 pour éviter que Stripe ne réessaie indéfiniment
        // Mais on log l'erreur pour investigation
        return res.status(200).json({ received: true, error: error.message });
      }
    }

    // Retourner un statut 200 pour les autres événements
    res.status(200).json({ received: true });
  }
);

/**
 * Fonction scheduled pour nettoyer les sessions checkout_sessions de plus de 25 jours
 * Déplace les sessions abandonnées (non payées) vers la collection abandons_panier
 * 
 * Logique :
 * - Les sessions payées sont déjà supprimées de checkout_sessions par le webhook
 * - Donc toutes les sessions restantes dans checkout_sessions sont des abandons de panier
 * - Après 25 jours, on les archive dans abandons_panier pour analyse marketing/CRM
 * 
 * Exécutée quotidiennement à 2h du matin (Europe/Paris)
 */
exports.cleanupCheckoutSessions = onSchedule(
  {
    schedule: "0 2 * * *", // Tous les jours à 2h UTC
    timeZone: "Europe/Paris",
  },
  async (event) => {
    try {
      const now = admin.firestore.Timestamp.now();
      const twentyFiveDaysAgo = new Date(now.toDate().getTime() - 25 * 24 * 60 * 60 * 1000);
      const cutoffTimestamp = admin.firestore.Timestamp.fromDate(twentyFiveDaysAgo);

      logger.info("Début du nettoyage des sessions checkout_sessions", {
        cutoffDate: cutoffTimestamp.toDate().toISOString(),
      });

      // Recherche des sessions de plus de 25 jours avec statut "pending"
      // Note : Les sessions payées sont déjà supprimées par le webhook,
      // donc toutes les sessions restantes sont des abandons de panier
      const checkoutSessionsRef = db.collection("checkout_sessions");
      const expiredSessions = await checkoutSessionsRef
        .where("createdAt", "<", cutoffTimestamp)
        .where("status", "==", "pending")
        .get();

      if (expiredSessions.empty) {
        logger.info("Aucune session expirée à nettoyer");
        return;
      }

      const batch = db.batch();
      let movedCount = 0;

      // Déplacer chaque session expirée vers abandons_panier
      for (const docSnap of expiredSessions.docs) {
        const sessionData = docSnap.data();

        // 🔗 Récupération du clientId depuis checkout_sessions
        const clientId = sessionData.clientId;

        // Création du document dans abandons_panier
        // Cette collection sert d'historique des abandons de panier pour analyse marketing
        const abandonData = {
          // 🔗 Lien vers le document client
          clientId: clientId || null,
          // Informations client (si disponibles, conservées pour référence rapide)
          client: {
            nom: sessionData.client?.nom || null,
            prenom: sessionData.client?.prenom || null,
            email: sessionData.client?.email || null,
            telephone: sessionData.client?.telephone || null,
            adresse: sessionData.client?.adresse || null,
            complementAdresse: sessionData.client?.complementAdresse || null,
            ville: sessionData.client?.ville || null,
            codePostal: sessionData.client?.codePostal || null,
          },
          // Panier abandonné
          panier: sessionData.items || [],
          // Informations de la session
          total: sessionData.total || 0,
          paymentMethod: sessionData.paymentMethod || null,
          // Raison de l'abandon
          reason: "timeout_25_days", // Session non payée après 25 jours
          // Dates
          createdAt: sessionData.createdAt || admin.firestore.FieldValue.serverTimestamp(), // Date d'origine
          archivedAt: admin.firestore.FieldValue.serverTimestamp(), // Date d'archivage
          // Référence à la session originale
          originalCheckoutSessionId: docSnap.id,
        };

        const abandonRef = db.collection("abandons_panier").doc();
        batch.set(abandonRef, abandonData);

        // Suppression de checkout_sessions
        batch.delete(docSnap.ref);

        // ===== Mise à jour du document client dans clients =====
        if (clientId) {
          const clientRef = db.collection("clients").doc(clientId);
          const clientDoc = await clientRef.get();

          if (clientDoc.exists) {
            const clientData = clientDoc.data();
            const currentNbAbandons = clientData.nbAbandons || 0;

            // Mise à jour du client (hors batch car on doit lire d'abord)
            await clientRef.update({
              derniereActiviteAt: admin.firestore.FieldValue.serverTimestamp(), // Date d'archivage de l'abandon
              nbAbandons: currentNbAbandons + 1, // Incrémentation du nombre d'abandons
              // aDejaPaye reste inchangé (false si aucune commande payée)
            });

            logger.info("Client mis à jour après abandon", {
              clientId: clientId,
              nbAbandons: currentNbAbandons + 1,
            });
          } else {
            logger.warn("Document client non trouvé pour mise à jour après abandon", {
              clientId: clientId,
            });
          }
        }

        movedCount++;
      }

      // Exécution du batch
      await batch.commit();

      logger.info("Nettoyage terminé - Sessions déplacées vers abandons_panier", {
        sessionsMoved: movedCount,
      });
    } catch (error) {
      logger.error("Erreur lors du nettoyage des sessions", {
        error: error.message,
        stack: error.stack,
      });
      throw error;
    }
  }
);

/**
 * Webhook Boxtal v3 pour recevoir les événements de suivi et documents
 * Reçoit les événements DOCUMENT_CREATED et TRACKING_CHANGED de Boxtal
 * et met à jour les commandes Firestore avec les informations de tracking et documents
 * 
 * IMPORTANT : Pour configurer le webhook dans Boxtal Dashboard :
 * 1. Allez dans votre compte Boxtal > Webhooks
 * 2. Ajoutez l'URL de votre fonction : https://[region]-[project-id].cloudfunctions.net/boxtalWebhookV3
 * 3. Sélectionnez les événements : DOCUMENT_CREATED, TRACKING_CHANGED
 * 4. Copiez le "Webhook Secret" et configurez-le avec : firebase functions:secrets:set BOXTAL_WEBHOOK_SECRET
 * 
 * NOTE : La signature est vérifiée via HMAC SHA256 avec le header x-bxt-signature
 */
exports.boxtalWebhookV3 = onRequest(
  {
    secrets: [BOXTAL_WEBHOOK_SECRET],
    cors: true,
  },
  async (req, res) => {
    try {
      const secret = BOXTAL_WEBHOOK_SECRET.value();

      if (!secret) {
        logger.error("BOXTAL_WEBHOOK_SECRET non configuré");
        return res.status(500).send("Boxtal webhook secret non configuré");
      }

      const signature = req.headers["x-bxt-signature"];
      if (!signature) {
        logger.error("Signature Boxtal manquante (x-bxt-signature)");
        return res.status(401).send("Missing x-bxt-signature");
      }

      const rawBody = req.rawBody;
      if (!rawBody) {
        logger.error("rawBody manquant pour le webhook Boxtal");
        return res.status(400).send("Missing raw body");
      }

      const crypto = require("crypto");
      const computed = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

      if (computed !== signature) {
        logger.error("Signature Boxtal invalide", {
          signature,
          computed,
        });
        return res.status(401).send("Invalid signature");
      }

      // À ce stade la signature est valide : on peut parser le JSON
      let payload;
      try {
        payload = JSON.parse(rawBody.toString("utf8"));
      } catch (parseError) {
        logger.error("Impossible de parser le JSON du webhook Boxtal", {
          error: parseError.message,
        });
        return res.status(400).send("Invalid JSON payload");
      }

      // Extraction du type d'événement (le nom exact dépend de la doc Boxtal)
      // ⚠️ TODO : adapter selon le schéma exact (eventType, type, event, etc.)
      const eventType =
        payload.eventType ||
        payload.type ||
        payload.event ||
        null;

      // Extraction de l'id de shipping order Boxtal
      // ⚠️ TODO : adapter selon le schéma exact (shippingOrder.id, data.shippingOrder.id, etc.)
      const shippingOrderId =
        payload?.shippingOrder?.id ||
        payload?.shippingOrderId ||
        payload?.data?.shippingOrder?.id ||
        null;

      if (!shippingOrderId) {
        logger.warn("shippingOrderId introuvable dans le webhook Boxtal", {
          payload,
        });
        return res.status(200).send("OK");
      }

      logger.info("Webhook Boxtal v3 reçu", {
        eventType,
        shippingOrderId,
      });

      // On recherche la commande qui contient ce shippingOrderId dans boxtal_v3.shippingOrderId
      const commandesSnap = await db
        .collection("commandes")
        .where("boxtal_v3.shippingOrderId", "==", shippingOrderId)
        .limit(1)
        .get();

      if (commandesSnap.empty) {
        logger.warn("Aucune commande trouvée pour ce shippingOrderId", {
          shippingOrderId,
        });
        return res.status(200).send("OK");
      }

      const commandeDoc = commandesSnap.docs[0];
      const commandeRef = commandeDoc.ref;

      // Préparation des mises à jour
      const updates = {
        "boxtal_v3.lastWebhookAt": admin.firestore.FieldValue.serverTimestamp(),
        "boxtal_v3.lastWebhookPayload": payload,
      };

      // Détection des types d'événements Boxtal
      const upperType = (eventType || "").toString().toUpperCase();
      const isDocumentEvent = upperType.includes("DOCUMENT");
      const isTrackingEvent = upperType.includes("TRACK");

      // Mise à jour des documents d'expédition si présents
      if (isDocumentEvent) {
        // ⚠️ TODO : adapter les noms en fonction de la vraie structure envoyée par Boxtal
        updates["boxtal_v3.documents"] =
          payload.documents ||
          payload.data?.documents ||
          null;
      }

      // Mise à jour du tracking si présent
      if (isTrackingEvent) {
        // ⚠️ TODO : adapter les noms (trackingNumber, trackingUrl, status, etc.)
        if (payload.trackingNumber || payload.data?.trackingNumber) {
          updates["boxtal_v3.trackingNumber"] =
            payload.trackingNumber || payload.data?.trackingNumber;
        }
        if (payload.trackingUrl || payload.data?.trackingUrl) {
          updates["boxtal_v3.trackingUrl"] =
            payload.trackingUrl || payload.data?.trackingUrl;
        }
        if (payload.status || payload.data?.status) {
          updates["boxtal_v3.trackingStatus"] =
            payload.status || payload.data?.status;
        }
      }

      await commandeRef.update(updates);

      logger.info("Commande mise à jour depuis webhook Boxtal v3", {
        commandeId: commandeRef.id,
        shippingOrderId,
        eventType,
      });

      return res.status(200).send("OK");
    } catch (error) {
      logger.error("Erreur lors du traitement du webhook Boxtal v3", {
        error: error.message,
        stack: error.stack,
      });
      // On retourne quand même 200 pour éviter les retries infinis si l'erreur est côté notre code
      return res.status(200).send("OK");
    }
  }
);
