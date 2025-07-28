import "../../../styles/Pages/Produits/Veilleuses/dino.css";
import { useState, useEffect } from "react";
import { db } from "../../../Firebase/firebase-config";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import FirstDino from "../../../assets/Pages/Produits/Veilleuses/Dino/FirstDino.png";
import DinoGirl from "../../../assets/Pages/Produits/Veilleuses/Dino/DinoGirl.png";
import vertynoLogo from "../../../assets/Pages/Produits/Veilleuses/Dino/vertynoLogo.png";
import dinoBack from "../../../assets/Pages/Produits/Veilleuses/Dino/dinoBack.png";
import oeufdino from "../../../assets/Pages/Produits/Veilleuses/Dino/oeufdino.png";
import dinoOne from "../../../assets/Pages/Produits/Veilleuses/Dino/dinoOne.png";
import dinoTwo from "../../../assets/Pages/Produits/Veilleuses/Dino/dinoTwo.png";
import dinoGround from "../../../assets/Pages/Produits/Veilleuses/Dino/dinoGround.png";
import dinoThree from "../../../assets/Pages/Produits/Veilleuses/Dino/dinoThree.png";
import dinoQuatre from "../../../assets/Pages/Produits/Veilleuses/Dino/dinoQuatre.png";
import dinoFive from "../../../assets/Pages/Produits/Veilleuses/Dino/dinoFive.png";

export default function DinoLedinosaure() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleOrder = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    try {
      await addDoc(collection(db, "commandes"), {
        produit: "Dino le dinosaure",
        email: email,
        timestamp: new Date()
      });

      await axios.post(
        "https://api.brevo.com/v3/contacts",
        {
          email: email,
          attributes: { PRODUIT: "Dino le dinosaure" },
          updateEnabled: true
        },
        {
          headers: {
            "api-key": process.env.REACT_APP_BREVO_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );

      await axios.post(
        "https://api.brevo.com/v3/smtp/email",
        {
          sender: {
            name: "Commande Vertyno",
            email: "mickaelouis03@gmail.com"
          },
          to: [{ email: "mickamickael93@gmail.com" }],
          subject: "Nouvelle commande Dino",
          htmlContent: `
            <h3>Nouvelle commande :</h3>
            <p><strong>Produit :</strong> Dino le dinosaure</p>
            <p><strong>Email :</strong> ${email}</p>
          `
        },
        {
          headers: {
            "api-key": process.env.REACT_APP_BREVO_API_KEY,
            "Content-Type": "application/json"
          }
        }
      );

      setSuccess("Votre demande a bien été prise en compte !");
      setEmail("");
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <>
      <div>
        <div className="hero-section">
          <img src={FirstDino} alt="Veilleuse Dino le dinosaure" className="hero-img" />
          <div className="hero-content">
            <h1 className="hero-title">Dino le dinosaure</h1>
            <button className="hero-button-dino">Commander</button>
          </div>
        </div>

        <section className="dino-table-section">
          <div className="dino-table-content">
            <img src={DinoGirl} alt="Dino le dinosaure sur une table" className="dino-table-img" />
          </div>
        </section>

        <section className="dino-text-section">
          <section className="presentation-section-dino">
            <div className="image-logo-and-patte">
              <img src={oeufdino} alt="Icône" />
              <img src={vertynoLogo} alt="Logo Vertyno" className="vertyno-logo" />
            </div>
            <h2 className="presentation-title-dino">
              <strong className="confdino">Dino,</strong> le compagnon rassurant des petits aventuriers
            </h2>
            <article className="presentation-text-area-dino">
              <p className="presentation-text-dino">
                <strong className="confdino">Dino</strong>, le compagnon des nuits paisibles — une douceur signée VERTYNO.
                Avec son regard joueur et sa lumière rassurante, <strong className="confdino">Dino</strong> veille sur les tout-petits.
                Conçu en silicone moelleux sans BPA, il est aussi doux à câliner qu’agréable à regarder. D’un simple tapotement,
                il diffuse une lueur réconfortante pour apaiser les nuits. Une bulle de douceur, signée VERTYNO.
              </p>
              <img src={dinoBack} alt="Dino le dinosaure lumineux" className="dino-doudou-img" />
            </article>
          </section>
        </section>

        <section className="double-image-section-dino">
          <div className="double-image-content-dino">
            <img src={dinoOne} alt="image_de_la_veilleuse_dino" className="widthimage" />
            <img src={dinoTwo} alt="image_de_la_veilleuse_dino" className="widthimage" />
          </div>
        </section>

        <section className="advantages-and-order-dino">
          <div className="advantages-section">
            <h2 className="confiteria advantages-title">Dino le dinosaure</h2>
            <div className="advantages-list">
              {["Sécurité", "Qualité", "Éco-responsable"].map((titre, index) => (
                <div className="advantage-item" key={index}>
                  <div className={`advantage-bar ${activeIndex === index ? "active" : ""}`}></div>
                  <h3>{titre}</h3>
                  <p>
                    {index === 0 && "Silicone alimentaire sans BPA et LED sans danger pour les yeux."}
                    {index === 1 && "Doux, résistant et lumière apaisante pour un sommeil serein."}
                    {index === 2 && "Rechargeable, et fait pour durer."}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="order-section">
            <div className="order-content-dino">
              <h3>Commander</h3>
              <h2 className="confiteria">Dino le dinosaure</h2>
              <p>
                Laissez <strong className="confdino">Dino</strong> veiller sur les nuits de votre enfant avec douceur et réconfort.
                Renseignez votre adresse e-mail pour recevoir des offres exclusives et être informé des nouveautés !
              </p>
              <form onSubmit={handleOrder}>
                <label htmlFor="email">Adresse email :</label>
                <input
                  type="email"
                  id="email"
                  placeholder="saisir"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit">Commander</button>
                {error && <p className="erreur-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
              </form>
            </div>
            <img src={dinoGround} alt="Veilleuse Dino" className="order-image" />
          </div>
        </section>

        <section className="dinoimageandtext">
          <img src={dinoThree} alt="image_des_caracteristiques_de_dino" className="widthimage" />
        </section>

        <section className="dino-magie-text">
          <h2><span className="confiteria">Dino</span>, le gardien bienveillant des nuits</h2>
          <p>
            Conçu pour le bien-être des enfants, <span className="confiteria">Dino</span> allie confort et sécurité.
            Son silicone moelleux sans BPA est adapté aux petites mains, tandis que sa lumière LED douce protège les yeux sensibles.
            Avec ses 7 couleurs changeantes, il s’adapte à chaque moment : une lueur apaisante pour l’endormissement,
            un éclairage rassurant pour la nuit, ou une touche de magie pour les rêves éveillés.
            Une veilleuse maligne, une magie VERTYNO.
          </p>
        </section>

        <section className="dino-section-quatreimg">
          <img src={dinoQuatre} alt="image_de_couleurs_de_dino" className="widthimage dispFlex" />
        </section>

        <section className="dino-caracteristiques">
          <h2>Caractéristiques de <span className="confiteria">Dino le dinosaure</span></h2>
          <div className="caracteristiques-grid">
            <div className="carac-item">Niveaux d’intensité<br /><strong className="reglage">Réglable,<br /> BLANCHE</strong></div>
            <div className="carac-item">Autonomie<br /><strong className="reglage">Jusqu’à une nuit <br /> de sommeil</strong></div>
            <div className="carac-item">Capacité<br /><strong className="reglage">1200 mAH</strong></div>
            <div className="caracteristiques-divider"></div>
            <div className="carac-item">Mode lumineux<br /><strong className="reglage">7 couleurs<br /> changeantes</strong></div>
            <div className="carac-item">Lumière<br /><strong className="reglage">Douce à 360°</strong></div>
            <div className="carac-item">Contrôle<br /><strong className="reglage">Par tapotement</strong></div>
            <div className="caracteristiques-divider"></div>
            <div className="carac-item">Minuterie<br /><strong className="reglage">30 minutes</strong></div>
            <div className="carac-item">Batterie<br /><strong className="reglage">Rechargeable <br />via USB</strong> <small>(câble inclus)</small></div>
            <div className="carac-item">Sécurité<br /><strong className="reglage">Sans BPA, en silicone alimentaire, sans danger pour les yeux</strong></div>
            <div className="caracteristiques-divider"></div>
            <div className="carac-item unique">Matière<br /><strong className="reglage">Silicone doux <br />et moelleux</strong></div>
          </div>

          <div className="guide-utilisation">
            <h3>Guide d’utilisation</h3>
            <p>
              Appuyez légèrement sur <strong className="confdino">Dino</strong> pour l’allumer ou varier l’intensité.
              Son mode multicolore ajoute une touche de magie avant le coucher.
              Tapotez au moment où la couleur préférée apparaît pour la figer.
              Activez le minuteur pour qu’il s’éteigne automatiquement,
              et laissez <strong className="confdino">Dino</strong> veiller toute la nuit sur votre enfant.
            </p>
          </div>
        </section>

        <section className="dino-packaging">
          <img src={dinoFive} alt="Boîte Dino le dinosaure" className="packaging-box-img widthimage" />
          <div className="packaging-btns">
            <button className="white-outline-btn">Commander</button>
            <button className="white-outline-btn">Contact</button>
          </div>
        </section>
      </div>
    </>
  );
}
