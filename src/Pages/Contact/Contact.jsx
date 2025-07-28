import "../../styles/Contact/Contact.css";
import { useState } from "react";
import { db } from "../../Firebase/firebase-config";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";

// 🔹 Fonction pour ajouter le contact dans Brevo
async function addContactToBrevo(nom, prenom, email, telephone) {
  try {
    await axios.post(
      "https://api.brevo.com/v3/contacts",
      {
        email: email,
        attributes: {
          NOM: nom,
          PRENOM: prenom,
          TELEPHONE: telephone
        },
        updateEnabled: true
      },
      {
        headers: {
          "api-key": process.env.REACT_APP_BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Contact ajouté à Brevo !");
  } catch (error) {
    console.error("Erreur ajout Brevo :", error.response?.data || error);
    throw error;
  }
}

// 🔹 Fonction pour envoyer un e-mail à ton adresse via Brevo SMTP
async function sendEmailNotification(nom, prenom, email, telephone, message) {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Formulaire Vertyno",
          email: "mickaelouis03@gmail.com" // 🔁 Remplace avec ton email validé chez Brevo
        },
        to: [
          { email: "contact@vertyno.com" } // 🔁 Remplace avec ton email de réception
        ],
        subject: "Nouveau message via le formulaire de contact",
        htmlContent: `
          <h3>Vous avez reçu un nouveau message :</h3>
          <p><strong>Prénom :</strong> ${prenom}</p>
          <p><strong>Nom :</strong> ${nom}</p>
          <p><strong>Email :</strong> ${email}</p>
          <p><strong>Téléphone :</strong> ${telephone}</p>
          <p><strong>Message :</strong><br/>${message}</p>
        `
      },
      {
        headers: {
          "api-key": process.env.REACT_APP_BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("E-mail envoyé avec succès !");
  } catch (error) {
    console.error("Erreur e-mail Brevo :", error.response?.data || error);
    throw error;
  }
}

export default function Contact() {
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [message, setMessage] = useState("");
  const [erreurMessage, setErreurMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreurMessage("");
    setSuccessMessage("");

    try {
      // Enregistrement dans Firestore
      await addDoc(collection(db, "contact"), {
        prenom,
        nom,
        email,
        telephone,
        message,
        timestamp: new Date()
      });

      // Ajout dans Brevo
      await addContactToBrevo(nom, prenom, email, telephone);

      // Envoi de l'e-mail
      await sendEmailNotification(nom, prenom, email, telephone, message);

      // Reset formulaire
      setPrenom("");
      setNom("");
      setEmail("");
      setTelephone("");
      setMessage("");

      // Message de succès
      setSuccessMessage("Votre message a bien été envoyé !");
    } catch (error) {
      setErreurMessage("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="contact-container">
      <h1 className="contact-title">Contactez-nous</h1>
      <form className="contact-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="prenom">Prénom</label>
            <input
              type="text"
              name="prenom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="nom">Nom</label>
            <input
              type="text"
              name="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="telephone">Téléphone</label>
            <input
              type="tel"
              name="telephone"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group message-group">
          <label htmlFor="message">Message</label>
          <textarea
            name="message"
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>
        </div>

        <div className="form-submit">
          {erreurMessage && <p className="erreur-message">{erreurMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <button type="submit">Envoyer</button>
        </div>
      </form>
    </div>
  );
}
