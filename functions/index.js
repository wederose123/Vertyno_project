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
// MODIFIÉ : Ajout des paramètres relayPoint et boxtal pour afficher les infos de livraison
function buildOrderConfirmationEmailHtml({ client, items, total, orderId, baseUrl, relayPoint, boxtal }) {
  const firstName = client.prenom || client.nom || "client";
  const safeBaseUrl = baseUrl || "https://vertyno.com";
  
  // Construction de l'adresse complète pour l'affichage
  // Les données viennent de checkoutSessionData.client qui a la structure :
  // { adresse: "rue", ville: "ville", codePostal: "code" }
  const adresseRue = (client.adresse || "").trim();
  const adresseCodePostal = (client.codePostal || "").trim();
  const adresseVille = (client.ville || "").trim();
  const adresseComplete = [adresseRue, adresseCodePostal, adresseVille].filter(Boolean).join(", ") || "Non renseignée";

  // Construction des items avec images
  // Fonction helper pour convertir un chemin d'image en URL absolue
  const getImageUrl = (imagePath) => {
    if (!imagePath) return `${safeBaseUrl}/images/default-product.webp`;
    // Si c'est déjà une URL complète (http:// ou https://), on la retourne telle quelle
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    // Si c'est un chemin relatif commençant par /, on l'ajoute au baseUrl
    if (imagePath.startsWith('/')) {
      return `${safeBaseUrl}${imagePath}`;
    }
    // Sinon, on essaie de construire le chemin depuis le slug/id
    const slug = imagePath.includes('/') ? imagePath : `${imagePath}_1.webp`;
    return `${safeBaseUrl}/images/${slug}`;
  };

  const itemsHtml = (items || [])
    .map((item) => {
      // Construction de l'URL de l'image : on essaie item.image, sinon on construit depuis slug/id
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
                  <img src="${itemImage}" alt="${item.name || 'Produit'}" width="80" height="80" style="width: 80px; height: 80px; display: block; border-radius: 8px; border: 1px solid #f0e0d8;" />
                </td>
                <td style="vertical-align: top;">
                  <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #4b3b36;">${item.name || 'Produit'}</p>
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
              <strong style="color:#4b3b36;">Email :</strong> ${client.email}
            </p>
            <p style="margin:0;font-size:14px;color:#7b5a4a;line-height:1.6;">
              <strong style="color:#4b3b36;">Adresse :</strong> ${adresseComplete}
            </p>
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
          
          ${relayPoint ? `
          <!-- Point relais sélectionné -->
          <div style="background:#fdf7f3;border-radius:12px;padding:16px;border:1px solid #f0e0d8;margin-bottom:16px;">
            <p style="margin:0 0 8px 0;font-size:14px;color:#7b5a4a;line-height:1.6;">
              <strong style="color:#4b3b36;">📍 Point relais :</strong> ${relayPoint.name || "Point relais"}
            </p>
            <p style="margin:0 0 4px 0;font-size:14px;color:#7b5a4a;line-height:1.6;">
              ${relayPoint.street || ""}
            </p>
            <p style="margin:0;font-size:14px;color:#7b5a4a;line-height:1.6;">
              ${relayPoint.postal_code || ""} ${relayPoint.city || ""}
            </p>
          </div>
          ` : ""}
          
          ${boxtal && boxtal.trackingNumber ? `
          <!-- Numéro de suivi -->
          <div style="background:#e8f5e9;border-radius:12px;padding:16px;border:1px solid #c8e6c9;margin-bottom:16px;">
            <p style="margin:0 0 8px 0;font-size:14px;color:#2e7d32;line-height:1.6;">
              <strong style="color:#1b5e20;">📦 Numéro de suivi :</strong> ${boxtal.trackingNumber}
            </p>
            ${boxtal.labelUrl ? `
            <p style="margin:8px 0 0 0;font-size:14px;color:#2e7d32;line-height:1.6;">
              <a href="${boxtal.labelUrl}" target="_blank" style="color:#1b5e20;text-decoration:underline;font-weight:600;">Télécharger votre étiquette de suivi</a>
            </p>
            ` : ""}
          </div>
          ` : ""}
          
          <p style="font-size:15px;color:#6d5a52;margin:0 0 12px 0;line-height:1.6;font-weight:400;">
            Votre colis sera expédié sous 24 h ouvrées.
          </p>
          ${!boxtal || !boxtal.trackingNumber ? `
          <p style="font-size:15px;color:#6d5a52;margin:0;line-height:1.6;font-weight:400;">
            Dès qu'il sera remis au transporteur, vous recevrez automatiquement :
          </p>
          <ul style="margin:8px 0 0 0;padding-left:20px;font-size:15px;color:#6d5a52;line-height:1.8;font-weight:400;">
            <li>un email de confirmation d'expédition</li>
            <li>votre numéro de suivi</li>
            <li>un lien pour suivre votre veilleuse en temps réel ✨</li>
          </ul>
          ` : ""}
        </td>
      </tr>
      
      <!-- Vous aimerez peut-être aussi -->
      <tr>
        <td style="padding:0 24px 24px 24px;">
          <h2 style="font-size:18px;color:#4b3b36;margin:0 0 16px 0;font-weight:600;">💡 Vous aimerez peut-être aussi…</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <td style="width:33.33%;padding:8px;vertical-align:top;">
                <a href="${safeBaseUrl}/LiliLlaLicorne" style="text-decoration:none;color:inherit;display:block;">
                  <div style="background:#fdf7f3;border-radius:12px;overflow:hidden;border:1px solid #f0e0d8;">
                    <img src="${safeBaseUrl}/images/lili-produits.jpg" alt="Lili la Licorne" width="100%" height="120" style="width:100%;height:120px;display:block;object-fit:cover;" />
                    <div style="padding:12px;">
                      <p style="margin:0;font-size:13px;color:#4b3b36;font-weight:600;text-align:center;">Lili la Licorne</p>
                    </div>
                  </div>
                </a>
              </td>
              <td style="width:33.33%;padding:8px;vertical-align:top;">
                <a href="${safeBaseUrl}/Dinoledinosaure" style="text-decoration:none;color:inherit;display:block;">
                  <div style="background:#fdf7f3;border-radius:12px;overflow:hidden;border:1px solid #f0e0d8;">
                    <img src="${safeBaseUrl}/images/dino-produits.jpg" alt="Dino le Dinosaure" width="100%" height="120" style="width:100%;height:120px;display:block;object-fit:cover;" />
                    <div style="padding:12px;">
                      <p style="margin:0;font-size:13px;color:#4b3b36;font-weight:600;text-align:center;">Dino le Dinosaure</p>
                    </div>
                  </div>
                </a>
              </td>
              <td style="width:33.33%;padding:8px;vertical-align:top;">
                <a href="${safeBaseUrl}/Mochilepanda" style="text-decoration:none;color:inherit;display:block;">
                  <div style="background:#fdf7f3;border-radius:12px;overflow:hidden;border:1px solid #f0e0d8;">
                    <img src="${safeBaseUrl}/images/mochi-produits.jpg" alt="Mochi le Panda" width="100%" height="120" style="width:100%;height:120px;display:block;object-fit:cover;" />
                    <div style="padding:12px;">
                      <p style="margin:0;font-size:13px;color:#4b3b36;font-weight:600;text-align:center;">Mochi le Panda</p>
                    </div>
                  </div>
                </a>
              </td>
            </tr>
          </table>
          <div style="text-align:center;margin-top:16px;">
            <a href="${safeBaseUrl}" style="display:inline-block;padding:12px 24px;border-radius:999px;background:#ffffff;color:#4b3b36;text-decoration:none;font-size:15px;font-weight:600;border:2px solid #e9a0a8;">
              👉 Découvrir toutes les veilleuses VERTYNO
            </a>
          </div>
        </td>
      </tr>
      
      <!-- Besoin d'aide -->
      <tr>
        <td style="padding:0 24px 24px 24px;">
          <p style="font-size:15px;color:#6d5a52;margin:0 0 12px 0;font-weight:600;">Besoin d'aide ? Nous répondons rapidement.</p>
          <p style="font-size:14px;color:#6d5a52;margin:0 0 4px 0;font-weight:400;">
            📩 <a href="mailto:contact@vertyno.com" style="color:#4b3b36;text-decoration:none;">contact@vertyno.com</a>
          </p>
          <p style="font-size:14px;color:#6d5a52;margin:0;font-weight:400;">
            📱 <a href="https://wa.me/33667561329" style="color:#4b3b36;text-decoration:none;">WhatsApp : https://wa.me/33667561329</a>
          </p>
        </td>
      </tr>
      
      <!-- Footer -->
      <tr>
        <td style="background:#f7eee9;padding:20px 24px;text-align:center;">
          <p style="margin:0 0 8px 0;font-size:16px;color:#4b3b36;font-weight:700;">VERTYNO</p>
          <p style="margin:0;font-size:13px;color:#8c6f63;line-height:1.6;font-weight:400;">
            Un univers doux, rassurant et pensé pour accompagner les nuits des enfants 🤍
          </p>
        </td>
      </tr>
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

// Envoi de l'email de confirmation de commande
// MODIFIÉ : Ajout des paramètres relayPoint et boxtal pour afficher les infos de livraison
async function sendOrderConfirmationEmail({ client, items, total, orderId, baseUrl, relayPoint, boxtal }) {
  const transactionalApi = getBrevoTransactionalApi();
  const htmlContent = buildOrderConfirmationEmailHtml({
    client,
    items,
    total,
    orderId,
    baseUrl,
    relayPoint,
    boxtal,
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

// NOUVEAU : Template HTML - Email de notification ADMIN
function buildAdminOrderEmailHtml({ client, items, total, orderId, relayPoint, boxtal, baseUrl }) {
  const safeBaseUrl = baseUrl || "https://vertyno.com";
  
  // Construction de l'adresse complète
  const adresseRue = (client.adresse || "").trim();
  const adresseCodePostal = (client.codePostal || "").trim();
  const adresseVille = (client.ville || "").trim();
  const adresseComplete = [adresseRue, adresseCodePostal, adresseVille].filter(Boolean).join(", ") || "Non renseignée";
  
  // Liste des articles
  const itemsHtml = (items || [])
    .map((item) => {
      const linePrice = (item.price * item.quantity).toFixed(2);
      return `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #e0e0e0;">
            <strong>${item.name || 'Produit'}</strong> × ${item.quantity || 1} - ${linePrice}€
          </td>
        </tr>
      `;
    })
    .join("");

  return `
  <div style="background-color:#f5f5f5;padding:20px 0;font-family:Arial,Helvetica,sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <!-- Header -->
      <tr>
        <td style="background:#4b3b36;padding:24px;text-align:center;">
          <h1 style="margin:0;font-size:24px;color:#ffffff;font-weight:700;">📦 Nouvelle commande VERTYNO</h1>
          <p style="margin:8px 0 0 0;font-size:16px;color:#f0e0d8;">Commande #${orderId}</p>
        </td>
      </tr>
      
      <!-- Informations client -->
      <tr>
        <td style="padding:24px;">
          <h2 style="font-size:18px;color:#4b3b36;margin:0 0 16px 0;font-weight:600;">👤 Informations client</h2>
          <div style="background:#f9f9f9;border-radius:8px;padding:16px;border:1px solid #e0e0e0;">
            <p style="margin:0 0 8px 0;font-size:14px;color:#333;line-height:1.6;">
              <strong>Nom :</strong> ${client.prenom || ""} ${client.nom || ""}
            </p>
            <p style="margin:0 0 8px 0;font-size:14px;color:#333;line-height:1.6;">
              <strong>Email :</strong> <a href="mailto:${client.email}" style="color:#4b3b36;">${client.email}</a>
            </p>
            <p style="margin:0 0 8px 0;font-size:14px;color:#333;line-height:1.6;">
              <strong>Téléphone :</strong> ${client.telephone || "Non renseigné"}
            </p>
            <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">
              <strong>Adresse :</strong> ${adresseComplete}
            </p>
          </div>
        </td>
      </tr>
      
      ${relayPoint ? `
      <!-- Point relais -->
      <tr>
        <td style="padding:0 24px 24px 24px;">
          <h2 style="font-size:18px;color:#4b3b36;margin:0 0 16px 0;font-weight:600;">📍 Point relais</h2>
          <div style="background:#fff3e0;border-radius:8px;padding:16px;border:1px solid #ffcc80;">
            <p style="margin:0 0 8px 0;font-size:14px;color:#333;line-height:1.6;">
              <strong>${relayPoint.name || "Point relais"}</strong>
            </p>
            <p style="margin:0 0 4px 0;font-size:14px;color:#333;line-height:1.6;">
              ${relayPoint.street || ""}
            </p>
            <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">
              ${relayPoint.postal_code || ""} ${relayPoint.city || ""}
            </p>
            ${relayPoint.id ? `<p style="margin:8px 0 0 0;font-size:12px;color:#666;">ID relais : ${relayPoint.id}</p>` : ""}
          </div>
        </td>
      </tr>
      ` : ""}
      
      <!-- Articles commandés -->
      <tr>
        <td style="padding:0 24px 24px 24px;">
          <h2 style="font-size:18px;color:#4b3b36;margin:0 0 16px 0;font-weight:600;">🛍️ Articles commandés</h2>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            ${itemsHtml}
            <tr>
              <td style="padding:16px 0 0 0;border-top:2px solid #e0e0e0;">
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
      
      ${boxtal && (boxtal.trackingNumber || boxtal.labelUrl) ? `
      <!-- Informations Boxtal -->
      <tr>
        <td style="padding:0 24px 24px 24px;">
          <h2 style="font-size:18px;color:#4b3b36;margin:0 0 16px 0;font-weight:600;">📦 Informations de livraison</h2>
          <div style="background:#e8f5e9;border-radius:8px;padding:16px;border:1px solid #c8e6c9;">
            ${boxtal.trackingNumber ? `
            <p style="margin:0 0 8px 0;font-size:14px;color:#2e7d32;line-height:1.6;">
              <strong>Numéro de suivi :</strong> ${boxtal.trackingNumber}
            </p>
            ` : ""}
            ${boxtal.labelUrl ? `
            <p style="margin:${boxtal.trackingNumber ? "8px" : "0"} 0 0 0;font-size:14px;color:#2e7d32;line-height:1.6;">
              <strong>Étiquette :</strong> <a href="${boxtal.labelUrl}" target="_blank" style="color:#1b5e20;text-decoration:underline;font-weight:600;">Télécharger l'étiquette</a>
            </p>
            ` : ""}
            ${boxtal.boxtalOrderId ? `
            <p style="margin:8px 0 0 0;font-size:12px;color:#666;">
              ID commande Boxtal : ${boxtal.boxtalOrderId}
            </p>
            ` : ""}
          </div>
        </td>
      </tr>
      ` : ""}
      
      <!-- Footer -->
      <tr>
        <td style="background:#f5f5f5;padding:16px 24px;text-align:center;border-top:1px solid #e0e0e0;">
          <p style="margin:0;font-size:12px;color:#666;">
            Cette notification a été envoyée automatiquement depuis le système de commande Vertyno.
          </p>
        </td>
      </tr>
    </table>
  </div>
  `;
}

// NOUVEAU : Envoi de l'email de notification ADMIN
async function sendAdminOrderNotification({ client, items, total, orderId, relayPoint, boxtal, baseUrl, adminEmail }) {
  const transactionalApi = getBrevoTransactionalApi();
  const htmlContent = buildAdminOrderEmailHtml({
    client,
    items,
    total,
    orderId,
    relayPoint,
    boxtal,
    baseUrl,
  });

  await transactionalApi.sendTransacEmail({
    sender: {
      name: "Vertyno",
      email: "no-reply@vertyno.com",
    },
    to: [
      {
        email: adminEmail || "contact@vertyno.com",
        name: "Équipe Vertyno",
      },
    ],
    subject: `📦 Nouvelle commande #${orderId} - ${client.prenom || ""} ${client.nom || ""}`,
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
        baseUrl: baseUrl,
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
        firstPoint: points[0] || null,
      });

      return { relays: points };
    } catch (error) {
      logger.error("Erreur Boxtal getBoxtalRelays", {
        error: error.message,
        stack: error.stack,
        responseStatus: error.response?.status,
        responseStatusText: error.response?.statusText,
        responseData: error.response?.data,
        responseHeaders: error.response?.headers,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          params: error.config.params,
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
        responseData: error.response?.data,
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

    const credentials = Buffer.from(`${accessKey}:${secretKey}`).toString("base64");

    const client = commandeData.client || {};
    const relayPoint = commandeData.relayPoint || null;
    const items = commandeData.items || [];
    
    // Calcul du poids total (par défaut 0.5kg par article si non spécifié)
    const totalWeightKg = items.reduce(
      (sum, it) => sum + (it.weight || 0.5) * (it.quantity || 1),
      0
    );

    // ⚠️ TODO : adapter le endpoint et le body EXACT selon la doc Boxtal v3
    const url = `${baseUrl}/shipments`; // ex : /shipments ou /orders, à vérifier

    const payload = {
      // Exemple de structure à adapter selon la doc Boxtal v3 :
      // mode: "pickup" ou "relay",
      // carrier: "...",
      // ...

      reference: commandeId,
      recipient: relayPoint
        ? {
            // Livraison en point relais
            name: `${client.prenom || ""} ${client.nom || ""}`.trim(),
            email: client.email,
            phone: client.telephone,
            address: {
              street: relayPoint.street,
              city: relayPoint.city,
              postal_code: relayPoint.postal_code,
              country: "FR",
            },
            relay_id: relayPoint.id, // ID du point relais
          }
        : {
            // Livraison à domicile
            name: `${client.prenom || ""} ${client.nom || ""}`.trim(),
            email: client.email,
            phone: client.telephone,
            address: {
              street: client.adresse,
              city: client.ville,
              postal_code: client.codePostal,
              country: "FR",
            },
          },
      parcels: [
        {
          weight: totalWeightKg, // en kg
          // dimensions, contenu, valeur, etc.
        },
      ],
      // url_push pour le webhook de tracking Boxtal
      // ⚠️ TODO : remplace par l'URL de ta future fonction de webhook Boxtal
      url_push: "https://TON_PROJECT.cloudfunctions.net/boxtalWebhook",
    };

    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const data = response.data;

    // ⚠️ adapter les noms de champs selon la réponse Boxtal
    const shipmentInfo = {
      boxtalOrderId: data.id || data.reference,
      trackingNumber: data.tracking_number || data.trackingNumber,
      labelUrl: data.label_url || null,
      raw: data,
    };

    logger.info("Colis Boxtal créé avec succès", {
      commandeId,
      shipmentInfo,
    });

    // On enregistre ça sur la commande
    await db.collection("commandes").doc(commandeId).update({
      boxtal: shipmentInfo,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return shipmentInfo;
  } catch (error) {
    logger.error("Erreur création colis Boxtal", {
      error: error.message,
      stack: error.stack,
      commandeId,
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

        // Log pour déboguer les données récupérées
        logger.info("Données checkoutSessionData récupérées", {
          client: checkoutSessionData.client,
          clientAdresse: checkoutSessionData.client?.adresse,
          clientVille: checkoutSessionData.client?.ville,
          clientCodePostal: checkoutSessionData.client?.codePostal,
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
          // Informations de livraison
          shippingMethod: checkoutSessionData.shippingMethod || null,
          shippingPrice: checkoutSessionData.shippingPrice || 0,
          shippingLabel: checkoutSessionData.shippingLabel || null,
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
        });

        // ===== ÉTAPE 1.5 : Création du colis Boxtal =====
        // On crée le colis Boxtal après la création de la commande
        // MODIFIÉ : On récupère le résultat pour l'utiliser dans les emails
        let shipmentInfo = null;
        try {
          shipmentInfo = await createBoxtalShipmentForOrder(commandeId, commandeData);
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

          // Log pour déboguer les données client
          logger.info("Données client pour email", {
            clientInfo: clientInfo,
            adresse: clientInfo.adresse,
            ville: clientInfo.ville,
            codePostal: clientInfo.codePostal,
            email: clientInfo.email,
          });

          // Protection anti double-envoi : on vérifie les flags sur la commande
          const commandeSnapshot = await commandeRef.get();
          const commandeDataExisting = commandeSnapshot.data() || {};

          // MODIFIÉ : Récupération des infos de livraison (relayPoint et boxtal) depuis la commande
          const relayPoint = commandeDataExisting.relayPoint || null;
          // On utilise shipmentInfo si disponible, sinon on prend boxtal depuis la commande
          const boxtalInfo = shipmentInfo || commandeDataExisting.boxtal || null;

          if (commandeDataExisting.emailConfirmationSent || commandeDataExisting.emailThankYouSent) {
            logger.info("Emails post-achat déjà envoyés, on ne renvoie pas", {
              commandeId: commandeRef.id,
              clientEmail: clientInfo.email,
            });
          } else {
            // Email 1 : Confirmation de commande (MODIFIÉ : avec relayPoint et boxtal)
            await sendOrderConfirmationEmail({
              client: clientInfo,
              items,
              total,
              orderId: commandeRef.id,
              baseUrl,
              relayPoint,
              boxtal: boxtalInfo,
            });

            // Email 2 : Remerciement / fidélisation
            await sendThankYouEmail({
              client: clientInfo,
              baseUrl,
            });

            // NOUVEAU : Email 3 : Notification ADMIN
            try {
              await sendAdminOrderNotification({
                client: clientInfo,
                items,
                total,
                orderId: commandeRef.id,
                relayPoint,
                boxtal: boxtalInfo,
                baseUrl,
                adminEmail: "contact@vertyno.com", // Adresse email admin
              });
              logger.info("Email admin envoyé avec succès", {
                commandeId: commandeRef.id,
              });
            } catch (adminEmailError) {
              // On log l'erreur mais on ne bloque pas le processus
              logger.error("Erreur lors de l'envoi de l'email admin", {
                error: adminEmailError.message,
                commandeId: commandeRef.id,
              });
            }

            // Mise à jour de la commande pour tracer les emails envoyés
            await commandeRef.update({
              emailConfirmationSent: true,
              emailThankYouSent: true,
              adminNotificationSent: true,
            });

            logger.info("Emails post-achat envoyés avec succès via Brevo", {
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
