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

const SHIPPING_OFFER_CODE = "MONR-CpourToi"; // Mondial Relay - Points Relais
const CONTENT_CATEGORY_CODE = "content:v1:80400"; // Puériculture, jouets, objets pour enfants

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
  boxtal,
}) {
  const fullName =
    `${client?.prenom || ""} ${client?.nom || ""}`.trim() || "Client Vertyno";
  const safeBaseUrl = baseUrl || "https://vertyno.com";

  const shippingModeLabel = shippingLabel || (
    shippingMethod === "relay"
      ? "Livraison en point relais"
      : shippingMethod === "home"
      ? "Livraison à domicile"
      : "Livraison"
  );

  const shippingPriceText =
    typeof shippingPrice === "number" ? `${shippingPrice.toFixed(2)}€` : "—";

  const relayName = relayPoint?.name || null;

  // Extraction des infos Boxtal
  const shippingOrderId = boxtal?.shippingOrderId || boxtal?.shippingOrder?.id || null;
  const trackingNumber = boxtal?.trackingNumber || null;
  const trackingUrl = boxtal?.trackingUrl || null;
  const labelUrl = boxtal?.labelUrl || null;

  // On n'affiche la section Boxtal que si on a au moins une info exploitable
  const hasBoxtalInfos =
    boxtal &&
    (shippingOrderId || trackingNumber || trackingUrl || labelUrl);

  // On essaie de construire une adresse propre à partir des champs disponibles
  const relayStreet =
    relayPoint?.street ||
    relayPoint?.raw?.location?.street ||
    "";
  const relayZip =
    relayPoint?.postalCode ||
    relayPoint?.postal_code ||
    relayPoint?.raw?.location?.zipCode ||
    "";
  const relayCity =
    relayPoint?.city ||
    relayPoint?.raw?.location?.city ||
    "";
  const relayAddressParts = [relayStreet, relayZip, relayCity]
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter(Boolean);
  const relayFullAddress =
    relayAddressParts.length > 0 ? relayAddressParts.join(", ") : null;

  const itemsHtml = (items || [])
    .map((item) => {
      const getImageUrl = (imagePath) => {
        if (!imagePath) return `${safeBaseUrl}/images/default-product.webp`;
        if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
          return imagePath;
        }
        if (imagePath.startsWith("/")) {
          return `${safeBaseUrl}${imagePath}`;
        }
        return `${safeBaseUrl}/images/${imagePath}`;
      };

      const linePrice =
        typeof item.price === "number" && typeof item.quantity === "number"
          ? (item.price * item.quantity).toFixed(2)
          : "";

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #f0e0d8;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="width: 70px; padding-right: 12px; vertical-align: top;">
                  <img src="${getImageUrl(item.image || item.slug || item.id)}"
                       alt="${item.name || "Produit"}"
                       width="70" height="70"
                       style="display:block;width:70px;height:70px;border-radius:8px;border:1px solid #f0e0d8;object-fit:cover;" />
                </td>
                <td style="vertical-align: top;">
                  <p style="margin:0 0 4px 0;font-size:14px;font-weight:600;color:#4b3b36;">
                    ${item.name || "Produit"}
                  </p>
                  <p style="margin:0 0 4px 0;font-size:13px;color:#6d5a52;">
                    Qty : ${item.quantity || 1}
                  </p>
                  <p style="margin:0;font-size:13px;color:#4b3b36;font-weight:600;">
                    Ligne : ${linePrice}€
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      `;
    })
    .join("");

  return `
  <div style="background-color:#f5f0eb;padding:20px 0;font-family:Arial,Helvetica,sans-serif;">
    <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #f0e0d8;">
      <tr>
        <td style="background:#fbe9e7;padding:20px 24px;">
          <h1 style="margin:0;font-size:20px;color:#4b3b36;">Nouvelle commande reçue</h1>
          <p style="margin:6px 0 0 0;font-size:13px;color:#6d5a52;">
            Merci de traiter cette commande dès que possible.
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:20px 24px 10px 24px;">
          <h2 style="margin:0 0 10px 0;font-size:16px;color:#4b3b36;">Détails de commande</h2>
          <div style="background:#fdf7f3;border-radius:12px;padding:14px;border:1px solid #f0e0d8;">
            <p style="margin:0 0 6px 0;font-size:13px;color:#4b3b36;">
              <strong>Numéro de commande :</strong> ${orderId}
            </p>
            <p style="margin:0 0 6px 0;font-size:13px;color:#4b3b36;">
              <strong>Client :</strong> ${fullName}
            </p>
            <p style="margin:0 0 6px 0;font-size:13px;color:#4b3b36;">
              <strong>Email :</strong> ${client.email || "-"}
            </p>
            <p style="margin:0 0 6px 0;font-size:13px;color:#4b3b36;">
              <strong>Téléphone :</strong> ${client.telephone || "-"}
            </p>
            <p style="margin:0 0 6px 0;font-size:13px;color:#4b3b36;">
              <strong>Adresse client :</strong>
              ${client.adresse || ""}${client.codePostal ? ", " + client.codePostal : ""}${client.ville ? ", " + client.ville : ""}
            </p>
            <p style="margin:0 0 6px 0;font-size:13px;color:#4b3b36;">
              <strong>Mode de livraison :</strong> ${shippingModeLabel}
            </p>
            ${
              relayName
                ? `<p style="margin:0 0 4px 0;font-size:13px;color:#4b3b36;">
                     <strong>Point relais :</strong> ${relayName}
                   </p>`
                : ""
            }
            ${
              relayFullAddress
                ? `<p style="margin:0 0 4px 0;font-size:13px;color:#4b3b36;">
                     <strong>Adresse point relais :</strong> ${relayFullAddress}
                   </p>`
                : ""
            }
            <p style="margin:0;font-size:13px;color:#4b3b36;">
              <strong>Frais de livraison :</strong> ${shippingPriceText}
            </p>
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding:10px 24px 16px 24px;">
          <h2 style="margin:0 0 10px 0;font-size:16px;color:#4b3b36;">Articles</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${itemsHtml}
            <tr>
              <td style="padding-top:12px;border-top:1px solid #f0e0d8;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:15px;font-weight:700;color:#4b3b36;">Total TTC :</td>
                    <td style="font-size:15px;font-weight:700;color:#4b3b36;text-align:right;">
                      ${Number(total || 0).toFixed(2)}€
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      ${
        hasBoxtalInfos
          ? `
      <tr>
        <td style="padding:0 24px 20px 24px;">
          <h2 style="margin:0 0 10px 0;font-size:16px;color:#4b3b36;">Expédition (Boxtal)</h2>
          <div style="background:#fdf7f3;border-radius:12px;padding:14px;border:1px solid #f0e0d8;">
            <p style="margin:0 0 6px 0;font-size:13px;color:#4b3b36;">
              <strong>Transporteur :</strong> Mondial Relay – Point Relais
            </p>
            ${
              shippingOrderId
                ? `<p style="margin:0 0 6px 0;font-size:13px;color:#4b3b36;">
                     <strong>ID Shipping Order :</strong> ${shippingOrderId}
                   </p>`
                : ""
            }
            ${
              trackingNumber
                ? `<p style="margin:0 0 6px 0;font-size:13px;color:#4b3b36;">
                     <strong>Numéro de suivi :</strong> ${trackingNumber}
                   </p>`
                : ""
            }
            ${
              trackingUrl
                ? `<p style="margin:0 0 6px 0;font-size:13px;color:#4b3b36;">
                     <strong>Lien de suivi :</strong>
                     <a href="${trackingUrl}" target="_blank" style="color:#4b3b36;text-decoration:underline;">Suivre le colis</a>
                   </p>`
                : ""
            }
            ${
              labelUrl
                ? `<p style="margin:0;font-size:13px;color:#4b3b36;">
                     <strong>Étiquette colis :</strong>
                     <a href="${labelUrl}" target="_blank" style="color:#4b3b36;text-decoration:underline;">Télécharger l'étiquette</a>
                   </p>`
                : ""
            }
          </div>
        </td>
      </tr>
      `
          : ""
      }
      <tr>
        <td style="padding:0 24px 20px 24px;">
          <p style="margin:0 0 6px 0;font-size:12px;color:#8c6f63;">
            Cette notification est destinée à l'équipe Vertyno (interne).
          </p>
          ${
            !hasBoxtalInfos
              ? `<p style="margin:0;font-size:12px;color:#8c6f63;">
                   Pensez à imprimer l'étiquette d'expédition dès qu'elle est disponible dans Boxtal.
                 </p>`
              : ""
          }
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
  boxtal,
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
    boxtal,
  });

  const to = [
    { email: "abesse.bel@vertyno.com", name: "Service client Vertyno" },
    { email: "mickaelouis03@gmail.com", name: "Mickael Vertyno" },
  ];

  await transactionalApi.sendTransacEmail({
    sender: {
      name: "Vertyno – Notifications internes",
      email: "no-reply@vertyno.com",
    },
    to,
    subject: `Vertyno – Nouvelle commande #${orderId}`,
    htmlContent,
  });
}

function buildAdminShippingUpdateEmailHtml({
  client,
  orderId,
  shippingOrderId,
  eventType,
  trackingNumber,
  trackingUrl,
  labelUrl,
}) {
  const fullName =
    `${client?.prenom || ""} ${client?.nom || ""}`.trim() || "Client Vertyno";

  const detailsList = [];

  if (shippingOrderId) {
    detailsList.push(`<li><strong>ID Boxtal :</strong> ${shippingOrderId}</li>`);
  }
  if (trackingNumber) {
    detailsList.push(`<li><strong>N° de suivi :</strong> ${trackingNumber}</li>`);
  }
  if (trackingUrl) {
    detailsList.push(
      `<li><strong>Suivi transporteur :</strong> <a href="${trackingUrl}" target="_blank">${trackingUrl}</a></li>`
    );
  }
  if (labelUrl) {
    detailsList.push(
      `<li><strong>Étiquette d'expédition :</strong> <a href="${labelUrl}" target="_blank">${labelUrl}</a></li>`
    );
  }

  const detailsHtml =
    detailsList.length > 0
      ? `<ul style="margin:8px 0 0 18px;padding:0;font-size:13px;color:#4b3b36;line-height:1.6;">
           ${detailsList.join("")}
         </ul>`
      : `<p style="margin:8px 0 0 0;font-size:13px;color:#6d5a52;">
           Le webhook a été reçu mais aucune info de suivi / document exploitable n'a été trouvée dans le payload. Voir Firestore (champ <code>boxtal_v3.lastWebhookPayload</code>).
         </p>`;

  return `
  <div style="background-color:#f5f0eb;padding:20px 0;font-family:Arial,Helvetica,sans-serif;">
    <table align="center" cellpadding="0" cellspacing="0" width="100%" style="max-width:700px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #f0e0d8;">
      <tr>
        <td style="background:#e3f2fd;padding:18px 24px;">
          <h1 style="margin:0;font-size:18px;color:#1e3a5f;">
            Mise à jour Boxtal – ${eventType || "Événement"}
          </h1>
          <p style="margin:6px 0 0 0;font-size:13px;color:#40556f;">
            Une nouvelle notification d'expédition vient d'être reçue.
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:18px 24px 10px 24px;">
          <p style="margin:0 0 6px 0;font-size:13px;color:#4b3b36;">
            <strong>Commande Vertyno :</strong> ${orderId}
          </p>
          <p style="margin:0 0 6px 0;font-size:13px;color:#4b3b36;">
            <strong>Client :</strong> ${fullName} (${client?.email || "-"})
          </p>
          ${detailsHtml}
        </td>
      </tr>

      <tr>
        <td style="padding:0 24px 18px 24px;">
          <p style="margin:0;font-size:12px;color:#8c6f63;">
            Pour plus de détails, consultez la commande dans Firestore (collection <code>commandes</code>).
          </p>
        </td>
      </tr>
    </table>
  </div>
  `;
}

async function sendAdminShippingUpdateEmail({
  client,
  orderId,
  shippingOrderId,
  eventType,
  trackingNumber,
  trackingUrl,
  labelUrl,
}) {
  const transactionalApi = getBrevoTransactionalApi();
  const htmlContent = buildAdminShippingUpdateEmailHtml({
    client,
    orderId,
    shippingOrderId,
    eventType,
    trackingNumber,
    trackingUrl,
    labelUrl,
  });

  const to = [
    { email: "abesse.bel@vertyno.com", name: "Service client Vertyno" },
    { email: "mickaelouis03@gmail.com", name: "Mickael Vertyno" },
  ];

  await transactionalApi.sendTransacEmail({
    sender: {
      name: "Vertyno – Notifications Boxtal",
      email: "no-reply@vertyno.com",
    },
    to,
    subject: `Vertyno – Mise à jour Boxtal (commande #${orderId})`,
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
// Création d'une shipping-order Boxtal v3 à partir d'une commande Firestore
async function createBoxtalShipmentForOrder(commandeId, commandeData) {
  const db = admin.firestore();
  const commandeRef = db.collection("commandes").doc(commandeId);

  // Récupération des secrets Boxtal
  const BOXTAL_ACCESS_KEY = process.env.BOXTAL_ACCESS_KEY;
  const BOXTAL_SECRET_KEY = process.env.BOXTAL_SECRET_KEY;
  const BOXTAL_API_BASE_URL =
    process.env.BOXTAL_API_BASE_URL || "https://api.boxtal.build/shipping";
  const SHIPPING_OFFER_CODE =
    process.env.BOXTAL_SHIPPING_OFFER_CODE || "MONR-CpourToi";
  const DROPOFF_POINT_CODE = process.env.BOXTAL_DROPOFF_POINT_CODE || null;
  const CONTENT_CATEGORY_CODE =
    process.env.BOXTAL_CONTENT_CATEGORY_CODE || "content:v1:80400";

  // Constantes adresse expéditeur Vertyno
  const VERTYNO_EMAIL = "abesse.bel@vertyno.com";
  const VERTYNO_PHONE = "0600000000";
  const VERTYNO_STREET = "Adresse Vertyno";
  const VERTYNO_CITY = "Drancy";
  const VERTYNO_POSTAL_CODE = "93700";

  try {
    const client = commandeData.client || {};
    const items = Array.isArray(commandeData.items) ? commandeData.items : [];
    const total = Number(commandeData.total || 0);

    const relayPoint = commandeData.relayPoint || null;
    const hasRelayPoint = !!relayPoint;
    const provider = relayPoint?.provider || null;

    // ATTENTION : shippingMethod est au niveau racine de la commande,
    // pas dans relayPoint
    const shippingMethod =
      commandeData.shippingMethod || relayPoint?.shippingMethod || null;

    if (!relayPoint || provider !== "boxtal" || shippingMethod !== "relay") {
      functions.logger.warn(
        "Boxtal v3 – point relais absent ou non Boxtal, on ne crée pas de shipping-order",
        {
          commandeId,
          provider,
          hasRelayPoint,
          shippingMethod,
        }
      );
      return;
    }

    if (!items.length) {
      logger.warn(
        "Boxtal v3 – commande sans items, on ne crée pas de shipping-order",
        { commandeId }
      );
      return;
    }

    // Extraction du pickupPointCode
    const pickupPointCode =
      relayPoint?.raw?.code ||
      relayPoint?.raw?.parcelPointCode ||
      relayPoint?.raw?.id ||
      null;

    if (!pickupPointCode) {
      logger.error("Boxtal v3 – pickupPointCode manquant", {
        commandeId,
        relayPointRaw: relayPoint?.raw,
      });
      await commandeRef.set(
        {
          boxtal_v3: {
            lastError: {
              at: admin.firestore.FieldValue.serverTimestamp(),
              message: "pickupPointCode manquant pour Boxtal v3",
              status: null,
              data: null,
            },
          },
        },
        { merge: true }
      );
      return;
    }

    // Construction des adresses Boxtal
    const fromAddress = {
      type: "BUSINESS",
      contact: {
        firstName: "Vertyno",
        lastName: "Boutique",
        company: "Vertyno",
        email: VERTYNO_EMAIL,
        phone: VERTYNO_PHONE,
      },
      location: {
        street: VERTYNO_STREET,
        city: VERTYNO_CITY,
        postalCode: VERTYNO_POSTAL_CODE,
        countryIsoCode: "FR",
      },
    };

    const toAddress = {
      type: "RESIDENTIAL",
      contact: {
        firstName: client.prenom || "",
        lastName: client.nom || "",
        email: client.email || "",
        phone: client.telephone || client.phone || "",
      },
      location: {
        street: client.adresse || "",
        city: client.ville || "",
        postalCode: client.codePostal || "",
        countryIsoCode: "FR",
      },
    };

    const returnAddress = fromAddress;

    // Construction de la description des articles
    const itemsDescription = items
      .map(
        (item) =>
          `${item.name || item.slug || "Article"} x${item.quantity || 1}`
      )
      .join(", ");

    // Construction du tableau packages
    const packages = [
      {
        type: "PARCEL",
        weight: 0.5,
        length: 18,
        width: 14,
        height: 8,
        value: {
          value: total || 0,
          currency: "EUR",
        },
        content: {
          id: CONTENT_CATEGORY_CODE,
          description: itemsDescription || "Commande Vertyno",
        },
      },
    ];

    // Construction du payload Boxtal v3
    const payload = {
      insured: false,
      labelType: "PDF_A4",
      shippingOfferCode: SHIPPING_OFFER_CODE,
      shipment: {
        fromAddress,
        toAddress,
        returnAddress,
        packages,
        ...(DROPOFF_POINT_CODE ? { dropOffPointCode: DROPOFF_POINT_CODE } : {}),
        ...(pickupPointCode ? { pickupPointCode } : {}),
      },
    };

    // Sauvegarde du payload avant l'appel
    await commandeRef.set(
      {
        boxtal_v3: {
          lastRequestPayload: payload,
          lastRequestAt: admin.firestore.FieldValue.serverTimestamp(),
        },
      },
      { merge: true }
    );

    // Appel à l'API Boxtal
    const url = `${BOXTAL_API_BASE_URL.replace(/\/$/, "")}/v3.1/shipping-order`;

    let boxtalResponse;
    try {
      boxtalResponse = await axios.post(url, payload, {
        auth: {
          username: BOXTAL_ACCESS_KEY,
          password: BOXTAL_SECRET_KEY,
        },
        timeout: 15000,
      });
    } catch (error) {
      const status = error.response?.status || null;
      const data = error.response?.data || null;

      logger.error("Erreur Boxtal v3 lors de la création de shipping-order", {
        commandeId,
        status,
        data,
        message: error.message,
      });

      await commandeRef.set(
        {
          boxtal_v3: {
            lastError: {
              at: admin.firestore.FieldValue.serverTimestamp(),
              message: error.message,
              status,
              data,
            },
          },
        },
        { merge: true }
      );

      return; // Ne pas throw, c'est non bloquant
    }

    // Extraction des données de la réponse Boxtal
    const data = boxtalResponse?.data || {};
    const content = data?.content || {};
    const shippingOrderId = content?.id || null;
    const shipmentId = content?.shipmentId || null;
    const shippingPriceExclTax =
      typeof content?.deliveryPriceExclTax?.value === "number"
        ? content.deliveryPriceExclTax.value
        : null;
    const shippingStatus = content?.status || null;

    // Sauvegarde du résultat dans Firestore
    await commandeRef.set(
      {
        boxtal_v3: {
          lastRequestAt: admin.firestore.FieldValue.serverTimestamp(),
          lastRequestPayload: payload,
          lastResponse: {
            status: boxtalResponse.status,
            timestamp: new Date().toISOString(),
            content: data,
          },
          shippingOrder: shippingOrderId
            ? {
                id: shippingOrderId,
                status: shippingStatus,
              }
            : null,
          shippingOrderId: shippingOrderId || null,
          shippingPriceExclTax: shippingPriceExclTax,
        },
      },
      { merge: true }
    );

    logger.info("Boxtal v3 – shipping-order créé avec succès", {
      commandeId,
      shippingOrderId,
      shipmentId,
      shippingPriceExclTax,
      shippingStatus,
    });
  } catch (error) {
    logger.error("Erreur lors de la création du colis Boxtal (non bloquant)", {
      commandeId,
      error: error.message || String(error),
    });
    // On ne bloque pas Stripe si Boxtal échoue
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
    secrets: [
      STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET,
      BREVO_API_KEY,
      BOXTAL_ACCESS_KEY,
      BOXTAL_SECRET_KEY,
      BOXTAL_API_BASE_URL,
      SITE_URL,
    ],
    region: "us-central1",
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

            // Email 3 : Notification interne (admins) - 1er email sans infos Boxtal
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
              boxtal: null, // À ce moment-là on n'a pas encore les infos Boxtal
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
    secrets: [BOXTAL_WEBHOOK_SECRET, BREVO_API_KEY, SITE_URL],
    cors: true,
  },
  async (req, res) => {
    try {
      // 1. Vérification de la méthode HTTP
      if (req.method !== "POST") {
        logger.warn("Boxtal webhook : méthode HTTP non autorisée", {
          method: req.method,
        });
        return res.status(405).json({ error: "Method not allowed" });
      }

      // 2. Récupération des headers et du body
      const headers = { ...req.headers };
      const body = req.body || {};
      const rawEvent = { headers, body };

      // 3. Détermination de l'eventType de façon robuste
      const eventTypeHeader =
        req.header("x-bxt-event-type") || req.header("X-Bxt-Event-Type");
      const bodyEventType =
        body.eventType || body.type || body.event?.type || null;
      const eventType = eventTypeHeader || bodyEventType || "UNKNOWN";

      logger.info("Boxtal webhook reçu", {
        eventType,
        hasHeader: !!eventTypeHeader,
        hasBodyEventType: !!bodyEventType,
      });

      // 4. Extraction défensive des identifiants depuis le payload Boxtal
      const payload = body?.payload || body;
      
      // À partir de payload.shippingOrder
      const shippingOrderId =
        payload?.shippingOrder?.id ||
        body?.shippingOrder?.id ||
        payload?.shippingOrderId ||
        body?.shippingOrderId ||
        body?.content?.shippingOrderId ||
        null;

      const shippingStatus =
        payload?.shippingOrder?.status ||
        body?.shippingOrder?.status ||
        null;

      const shippingPriceExclTax =
        payload?.shippingOrder?.shippingPriceExclTax ||
        payload?.shippingOrder?.deliveryPriceExclTax?.value ||
        body?.shippingOrder?.shippingPriceExclTax ||
        body?.shippingOrder?.deliveryPriceExclTax?.value ||
        null;

      const shipmentId =
        payload?.shipment?.id ||
        body?.shipment?.id ||
        body?.content?.shipmentId ||
        null;

      // À partir de payload.trackings[0]
      const firstTracking = Array.isArray(payload?.trackings) && payload.trackings.length > 0
        ? payload.trackings[0]
        : null;
      
      const trackingNumber =
        firstTracking?.trackingNumber ||
        payload?.tracking?.trackingNumber ||
        body?.tracking?.trackingNumber ||
        body?.trackingNumber ||
        body?.shipment?.trackingNumber ||
        null;

      const trackingUrl =
        firstTracking?.packageTrackingUrl ||
        payload?.tracking?.packageTrackingUrl ||
        body?.tracking?.packageTrackingUrl ||
        body?.trackingUrl ||
        null;

      // À partir de payload.documents (premier document avec type === "LABEL")
      let labelUrl = null;
      if (Array.isArray(payload?.documents)) {
        const labelDoc = payload.documents.find((doc) => {
          const docType = (doc.type || doc.documentType || "").toString().toUpperCase();
          return docType === "LABEL" || docType.includes("LABEL");
        });
        if (labelDoc) {
          labelUrl = labelDoc.url || labelDoc.href || labelDoc.downloadUrl || null;
        }
      }
      
      // Fallback si pas trouvé dans documents
      if (!labelUrl) {
        labelUrl =
          body?.document?.url ||
          (Array.isArray(body?.documents) ? body.documents[0]?.url : null) ||
          body?.labelUrl ||
          null;
      }

      // 5. Stratégie pour retrouver la commande Firestore
      let commandeDoc = null;
      let commandeId = null;
      let commandeData = null;

      if (shippingOrderId) {
        const commandesRef = db.collection("commandes");
        // Recherche d'abord via boxtal_v3.shippingOrderId (le plus direct)
        let commandeSnap = await commandesRef
          .where("boxtal_v3.shippingOrderId", "==", shippingOrderId)
          .limit(1)
          .get();

        // Si pas trouvé, recherche via lastResponse.content.content.id (fallback)
        if (commandeSnap.empty) {
          commandeSnap = await commandesRef
            .where(
              "boxtal_v3.lastResponse.content.content.id",
              "==",
              shippingOrderId
            )
            .limit(1)
            .get();
        }

        if (!commandeSnap.empty) {
          commandeDoc = commandeSnap.docs[0];
          commandeId = commandeDoc.id;
          commandeData = commandeDoc.data() || {};
        }
      }

      if (!commandeDoc && shipmentId) {
        const commandesRef = db.collection("commandes");
        const commandeSnap = await commandesRef
          .where(
            "boxtal_v3.lastResponse.content.content.shipmentId",
            "==",
            shipmentId
          )
          .limit(1)
          .get();

        if (!commandeSnap.empty) {
          commandeDoc = commandeSnap.docs[0];
          commandeId = commandeDoc.id;
          commandeData = commandeDoc.data() || {};
        }
      }

      // 6. Si une commande est trouvée, mise à jour
      if (commandeDoc && commandeId) {
        // Construction des nouvelles données Boxtal à partir du payload
        const newBoxtalData = {};
        
        if (shippingOrderId) {
          newBoxtalData.shippingOrderId = shippingOrderId;
        }
        if (shippingStatus) {
          newBoxtalData.shippingOrder = {
            id: shippingOrderId || commandeData.boxtal_v3?.shippingOrder?.id || null,
            status: shippingStatus,
          };
        }
        if (shippingPriceExclTax !== null && shippingPriceExclTax !== undefined) {
          newBoxtalData.shippingPriceExclTax = shippingPriceExclTax;
        }
        if (trackingNumber) {
          newBoxtalData.trackingNumber = trackingNumber;
        }
        if (trackingUrl) {
          newBoxtalData.trackingUrl = trackingUrl;
        }
        if (labelUrl) {
          newBoxtalData.labelUrl = labelUrl;
        }

        // Merge avec les données existantes
        const previousBoxtal = commandeData.boxtal_v3 || {};
        const mergedBoxtal = {
          ...previousBoxtal,
          ...newBoxtalData,
          lastWebhookAt: admin.firestore.FieldValue.serverTimestamp(),
          lastWebhookEventType: eventType,
          lastWebhookPayload: payload || body,
        };

        // Mise à jour dans Firestore
        await commandeDoc.ref.set(
          {
            boxtal_v3: mergedBoxtal,
          },
          { merge: true }
        );

        logger.info("Commande mise à jour avec données Boxtal v3", {
          commandeId,
          shippingOrderId,
          shipmentId,
          eventType,
          hasTrackingNumber: !!trackingNumber,
          hasTrackingUrl: !!trackingUrl,
          hasLabelUrl: !!labelUrl,
        });

        // 7. Envoi d'un 2ème email admin complet avec les infos Boxtal
        const boxtalForEmail = {
          shippingOrderId: mergedBoxtal.shippingOrderId || mergedBoxtal.shippingOrder?.id || null,
          shippingPriceExclTax: mergedBoxtal.shippingPriceExclTax || null,
          trackingNumber: mergedBoxtal.trackingNumber || null,
          trackingUrl: mergedBoxtal.trackingUrl || null,
          labelUrl: mergedBoxtal.labelUrl || null,
        };

        const client = commandeData.client || {};
        const items = commandeData.items || [];
        const total = commandeData.total || 0;
        const baseUrl = SITE_URL.value() || "https://vertyno.com";
        const shippingMethod = commandeData.shippingMethod || null;
        const shippingLabel = commandeData.shippingLabel || null;
        const shippingPrice = commandeData.shippingPrice || 0;
        const relayPoint = commandeData.relayPoint || null;

        await sendAdminOrderEmail({
          client,
          items,
          total,
          orderId: commandeId,
          baseUrl,
          shippingMethod,
          shippingLabel,
          shippingPrice,
          relayPoint,
          boxtal: boxtalForEmail,
        });

        return res.status(200).json({ ok: true });
      }

      // 8. Si aucune commande n'est trouvée, sauvegarder dans boxtal_webhooks
      logger.warn("Impossible d'identifier la commande à partir du webhook", {
        shippingOrderId,
        shipmentId,
        eventType,
      });

      await db.collection("boxtal_webhooks").add({
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        eventType,
        shippingOrderId: shippingOrderId || null,
        shipmentId: shipmentId || null,
        trackingNumber: trackingNumber || null,
        labelUrl: labelUrl || null,
        raw: rawEvent,
      });

      return res.status(200).json({ received: true, storedOnly: true });
    } catch (error) {
      logger.error("Erreur dans boxtalWebhookV3", {
        error: error.message,
        stack: error.stack,
      });
      // Toujours répondre 200 pour éviter que le webhook soit désactivé
      return res.status(200).json({ ok: true, error: error.message });
    }
  }
);
