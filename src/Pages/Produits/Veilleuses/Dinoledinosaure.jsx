import "../../../styles/Pages/Produits/Veilleuses/dino.css";
import { useState, useEffect, useRef } from "react";
import { db } from "../../../Firebase/firebase-config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import axios from "axios";
import ProductComponent from "../../../Composants/Product/ProductComponent";
import { useFlyToCart } from "../../../hooks/useFlyToCart";
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

// 🔹 Fonction pour ajouter l'email à Brevo
async function addEmailToBrevo(email) {
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
    console.log("Email ajouté à Brevo !");
  } catch (error) {
    console.error("Erreur ajout Brevo :", error.response?.data || error);
    throw error;
  }
}

export default function DinoLedinosaure() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Refs pour les boutons "Commander" (pour l'animation)
  const heroButtonRef = useRef(null);
  const orderButtonRef = useRef(null);
  const packagingButtonRef = useRef(null);
  
  // Hook pour l'animation de vol vers le panier
  const flyToCart = useFlyToCart();

  const handleAddToCart = async (buttonRef) => {
    if (!selectedProduct) {
      console.warn("Aucun produit sélectionné");
      return;
    }

    // Récupération du bouton panier dans le Header (via son ID)
    const panierButton = document.getElementById("panier-button");
    
    // Déclenchement de l'animation si les deux boutons sont trouvés
    if (buttonRef?.current && panierButton) {
      flyToCart(buttonRef.current, panierButton);
    }

    // Ajout du produit dans Firestore (l'animation se joue en parallèle)
    try {
      await addDoc(collection(db, "panier"), {
        id: selectedProduct.id,
        slug: selectedProduct.slug,
        name: selectedProduct.name,
        category: selectedProduct.category,
        price: selectedProduct.price,
        image: selectedProduct.image,
        stripePriceId: selectedProduct.stripePriceId, // Price ID Stripe pour le checkout
        createdAt: serverTimestamp()
      });
      console.log("Produit ajouté dans Firestore :", selectedProduct.name);
    } catch (error) {
      console.error("Erreur lors de l'ajout dans Firestore :", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Fonction spécifique pour la section "order-section"
   * Combine : ajout au panier + enregistrement email dans newsletter + Brevo + redirection
   */
  const handleOrder = async (e) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!selectedProduct) {
      console.warn("Aucun produit sélectionné");
      setError("Erreur : produit non disponible");
      return;
    }

    // Vérification que l'email est renseigné
    if (!email || !email.trim()) {
      console.warn("Email requis pour la commande");
      setError("Veuillez renseigner votre email");
      return;
    }

    // Récupération du bouton panier dans le Header (via son ID)
    const panierButton = document.getElementById("panier-button");
    
    // Déclenchement de l'animation si le bouton panier est trouvé
    if (orderButtonRef?.current && panierButton) {
      flyToCart(orderButtonRef.current, panierButton);
    }

    try {
      // 1. Ajout du produit dans le panier
      await addDoc(collection(db, "panier"), {
        id: selectedProduct.id,
        slug: selectedProduct.slug,
        name: selectedProduct.name,
        category: selectedProduct.category,
        price: selectedProduct.price,
        image: selectedProduct.image,
        stripePriceId: selectedProduct.stripePriceId, // Price ID Stripe pour le checkout
        createdAt: serverTimestamp()
      });
      console.log("Produit ajouté dans Firestore :", selectedProduct.name);

      // 2. Enregistrement de l'email dans la collection newsletter
      await addDoc(collection(db, "newsletter"), {
        email: email.trim(),
        createdAt: serverTimestamp(),
        source: "dinoledinosaure-order"
      });
      console.log("Email ajouté dans newsletter :", email);

      // 3. Ajout de l'email dans Brevo (optionnel - ne bloque pas si ça échoue)
      try {
        await addEmailToBrevo(email.trim());
        console.log("Email ajouté dans Brevo :", email);
      } catch (brevoError) {
        // On continue même si Brevo échoue (clé API non configurée ou autre erreur)
        console.warn("Erreur Brevo (non bloquant) :", brevoError);
      }

      // 4. Redirection vers la page panier
      window.location.href = "/Panier";
    } catch (err) {
      console.error("Erreur lors de la commande :", err);
      setError("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <>
      <div className="dino-page">
        <ProductComponent
          slug="dinoledinosaure"
          onProductReady={(product) => setSelectedProduct(product)}
        />
        <div className="hero-section">
          <img src={FirstDino} alt="Veilleuse Dino le dinosaure" className="hero-img" />
          <div className="hero-content">
            <h1 className="hero-title">Dino le dinosaure</h1>
            <button 
              type="button" 
              className="hero-button-dino" 
              ref={heroButtonRef}
              onClick={() => handleAddToCart(heroButtonRef)}
            >
              Commander
            </button>
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
                <button type="submit" ref={orderButtonRef}>Commander</button>
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
            <button
              className="white-outline-btn"
              type="button"
              ref={packagingButtonRef}
              onClick={() => handleAddToCart(packagingButtonRef)}
            >
              Commander
            </button>
            <button className="white-outline-btn"><a href={"/Contact"}>Contact</a></button>
          </div>
        </section>
      </div>
    </>
  );
}
