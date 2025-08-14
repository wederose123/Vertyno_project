import "../../styles/Footer/Footer.css";
import { useState } from "react";
import axios from "axios";
import { db } from "../../Firebase/firebase-config";
import { collection, addDoc } from "firebase/firestore";
import {
  FaTiktok,
  FaLinkedinIn,
  FaInstagram,
  FaPinterestP
} from "react-icons/fa";

// 🔹 Ajout à Brevo
async function addNewsletterEmailToBrevo(email) {
  try {
    await axios.post(
      "https://api.brevo.com/v3/contacts",
      {
        email: email,
        updateEnabled: true,
      },
      {
        headers: {
          "api-key": process.env.REACT_APP_BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Email newsletter ajouté à Brevo !");
  } catch (error) {
    console.error("Erreur ajout newsletter Brevo :", error.response?.data || error);
    throw error;
  }
}

// 🔹 Envoi d’email à Mickael
async function sendNewsletterNotification(email) {
  try {
    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Newsletter Vertyno",
          email: "mickaelouis03@gmail.com",
        },
        to: [
          { email: "contact@vertyno.com" },
        ],
        subject: "Nouvelle inscription à la newsletter",
        htmlContent: `
          <h3>Nouvel inscrit :</h3>
          <p><strong>Email :</strong> ${email}</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.REACT_APP_BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Notification envoyée !");
  } catch (error) {
    console.error("Erreur e-mail newsletter :", error.response?.data || error);
    throw error;
  }
}

export default function Footer() {
  const [email, setEmail] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await addDoc(collection(db, "newsletter"), {
        email,
        timestamp: new Date(),
      });

      await addNewsletterEmailToBrevo(email);
      await sendNewsletterNotification(email);

      setSuccessMsg("Merci ! Vous êtes bien inscrit à notre newsletter.");
      setEmail("");
    } catch (error) {
      setErrorMsg("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <>
      <div>
        <footer className="footer">
          <div className="footer-columns">
            <div className="footer-column">
              <h4>Nos Produits</h4>
              <ul>
                <li className="li-footer"><a href={"/LiliLlaLicorne"}>Lili la Licorne</a></li>
                <li className="li-footer"><a href={"/Mochilepanda"}>Mochi le panda</a></li>
                <li className="li-footer"><a href={"/Louloulechien"}>Loulou le chien</a></li>
                <li className="li-footer"> <a href={"/Dinoledinosaure"}>Dino le Dinosaure</a></li>
                <li className="li-footer"><a href={"/Mondouxnuage"}>Mon doux nuage</a></li>
                <li className="li-footer"><a href={"/Monpetitourson"}>Mon petit oursson</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Service Client</h4>
              <ul>
                <li className="li-footer"><a href={"/Contact"}>Contact</a></li>
                <li className="li-footer">FAQ</li>
                <li className="li-footer">Retours Et Remboursements</li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Information Légales</h4>
              <ul>
                <li className="li-footer">Mention Légales</li>
                <li className="li-footer">Condition Générales De Vente</li>
                <li className="li-footer">Politique De Confidentialité</li>
              </ul>
            </div>
          </div>

          <div className="footer-newsletter">
            <h4>Restez Informez</h4>
            <p>Recevez nos nouveautés et offres exclusives !</p>
            <form onSubmit={handleNewsletterSubmit}>
              <div className="container-input">
                <div className="newsletter-input">
                  <input
                    type="email"
                    placeholder="Votre Mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="arrow modif-arrow">→</button>
              </div>
              {errorMsg && <p className="erreur-message">{errorMsg}</p>}
              {successMsg && <p className="success-message">{successMsg}</p>}
            </form>
          </div>

          <div className="footer-socials">
  <a href={"https://www.tiktok.com/@vertyno_home"} target="_blank" rel="noopener noreferrer" className="col-socials"> 
    <FaTiktok />
  </a>
  <a href={"https://www.linkedin.com/in/tonprofil"} target="_blank" rel="noopener noreferrer" className="col-socials"> 
    <FaLinkedinIn />
  </a>
  <a href={"https://www.instagram.com/vertyno_home/"} target="_blank" rel="noopener noreferrer" className="col-socials"> 
    <FaInstagram />
  </a>
  <a href={"https://www.pinterest.fr/vertyno_home/"} target="_blank" rel="noopener noreferrer" className="col-socials"> 
    <FaPinterestP />
  </a>
</div>
        </footer>
      </div>
    </>
  );
}
