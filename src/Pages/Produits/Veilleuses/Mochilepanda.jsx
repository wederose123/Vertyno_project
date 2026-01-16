import "../../../styles/Pages/Produits/Veilleuses/mochi.css";
import { useState, useEffect, useRef } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../Firebase/firebase-config";
import axios from "axios";
import FirstMochi from "../../../assets/Pages/Produits/Veilleuses/Mochi/Mochifirst.png"; 
import ProductComponent from "../../../Composants/Product/ProductComponent";
import { useFlyToCart } from "../../../hooks/useFlyToCart";
import { useToast } from "../../../context/ToastContext";
import Mochigirl from "../../../assets/Pages/Produits/Veilleuses/Mochi/Mochigirl.png";
import vertynoLogo from "../../../assets/Pages/Produits/Veilleuses/Mochi/vertynoLogo.png";
import mochiBack from "../../../assets/Pages/Produits/Veilleuses/Mochi/mochiBack.png";
import yeuxmochi from "../../../assets/Pages/Produits/Veilleuses/Mochi/yeuxmochi.png";
import mochiOne from "../../../assets/Pages/Produits/Veilleuses/Mochi/mochiOne.png";
import mochiTwo from "../../../assets/Pages/Produits/Veilleuses/Mochi/mochiTwo.png";
import mochiGround from "../../../assets/Pages/Produits/Veilleuses/Mochi/mochiGround.png";
import mochiThree from "../../../assets/Pages/Produits/Veilleuses/Mochi/mochiThree.png";
import mochiQuatre from "../../../assets/Pages/Produits/Veilleuses/Mochi/mochiQuatre.png";
import mochiFive from "../../../assets/Pages/Produits/Veilleuses/Mochi/mochiFive.png";

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

export default function MochiLePanda () {

  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  // State pour l'email dans la section "order-section"
  const [orderEmail, setOrderEmail] = useState("");
  
  // Refs pour les boutons "Commander" (pour l'animation)
  const heroButtonRef = useRef(null);
  const orderButtonRef = useRef(null);
  const packagingButtonRef = useRef(null);
  
  // Hook pour l'animation de vol vers le panier
  const flyToCart = useFlyToCart();
  const { showToast } = useToast();

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
      showToast("Produit ajouté au panier");
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
  const handleOrder = async () => {
    if (!selectedProduct) {
      console.warn("Aucun produit sélectionné");
      return;
    }

    // Vérification que l'email est renseigné
    if (!orderEmail || !orderEmail.trim()) {
      console.warn("Email requis pour la commande");
      return;
    }

    // Récupération du bouton panier dans le Header (via son ID)
    const panierButton = document.getElementById("panier-button");
    
    // Déclenchement de l'animation si le bouton panier est trouvé
    if (orderButtonRef?.current && panierButton) {
      flyToCart(orderButtonRef.current, panierButton);
    }

    try {
      // 1. Ajout du produit dans le panier (comportement existant conservé)
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
        email: orderEmail.trim(),
        createdAt: serverTimestamp(),
        source: "mochilepanda-order"
      });
      console.log("Email ajouté dans newsletter :", orderEmail);

      // 3. Ajout de l'email dans Brevo (optionnel - ne bloque pas si ça échoue)
      try {
        await addEmailToBrevo(orderEmail.trim());
        console.log("Email ajouté dans Brevo :", orderEmail);
      } catch (brevoError) {
        // On continue même si Brevo échoue (clé API non configurée ou autre erreur)
        console.warn("Erreur Brevo (non bloquant) :", brevoError);
      }

      // 4. Redirection vers la page panier
      showToast("Produit ajouté au panier");
      window.location.href = "/Panier";
    } catch (error) {
      console.error("Erreur lors de la commande :", error);
    }
  };

  return (
    <>
      <div className="mochi-page">
        <ProductComponent
          slug="mochilepanda"
          onProductReady={(product) => setSelectedProduct(product)}
        />
        <div className="hero-section">
          <img src={FirstMochi} alt="Veilleuse Mochi le panda" className="hero-img" />
          <div className="hero-content">
            <h1 className="hero-title">Mochi le panda</h1>
            <button 
              type="button" 
              className="hero-button-mochi" 
              ref={heroButtonRef}
              onClick={() => handleAddToCart(heroButtonRef)}
            >
              Commander
            </button>
          </div>
        </div>

        <section className="mochi-table-section">
          <div className="mochi-table-content">
            <img src={Mochigirl} alt="Mochi le panda sur une table" className="mochi-table-img" />
          </div>
        </section>

        <section className="mochi-text-section">
          <section className="presentation-section-mochi">
            <div className="image-logo-and-patte">
              <img src={yeuxmochi} alt="Icône" className="imgCent rainbow" />
              <img src={vertynoLogo} alt="Logo Vertyno" className="vertyno-logo " />
            </div>
            <h2 className="presentation-title-mochi">Mochi, le compagnon des nuits sereines </h2>
            <article className="presentation-text-area-mochi">
             <p className="presentation-text-mochi">
  <strong className="confmochi">Mochi</strong>, le compagnon des nuits sereines — une douceur signée VERTYNO
  Avec son regard malicieux et sa lumière apaisante, <strong className="confmochi">Mochi</strong> veille sur les tout-petits.
  Conçu en silicone moelleux sans BPA, il est aussi doux à câliner qu’agréable à regarder.
  D’un simple tapotement, il diffuse une lueur réconfortante, idéale pour apaiser les nuits et accompagner les rêves.
  Une bulle de douceur, signée VERTYNO.
</p>
              <img src={mochiBack} alt="Mochi le panda lumineux" className="mochi-doudou-img" />
            </article>
          </section>
        </section>

        <section className="double-image-section-mochi">
          <div className="double-image-content-mochi">
            <img src={mochiOne} alt="image_de_la_veilleuse_mochi" className="widthimage" />
            <img src={mochiTwo} alt="image_de_la_veilleuse_mochi" className="widthimage" />
          </div>
        </section>

        <section className="advantages-and-order-mochi">
          <div className="advantages-section">
            <h2 className="confiteria advantages-title">Mochi le panda</h2>
            <div className="advantages-list">
              <div className="advantage-item">
                <div className={`advantage-bar ${activeIndex === 0 ? 'active' : ''}`}></div>
                <h3>Sécurité</h3>
                <p>Silicone alimentaire sans BPA et LED sans danger pour les yeux.</p>
              </div>
              <div className="advantage-item">
                <div className={`advantage-bar ${activeIndex === 1 ? 'active' : ''}`}></div>
                <h3>Qualité</h3>
                <p>Doux, résistant et lumière apaisante pour un sommeil serein.</p>
              </div>
              <div className="advantage-item">
                <div className={`advantage-bar ${activeIndex === 2 ? 'active' : ''}`}></div>
                <h3>Éco-responsable</h3>
                <p>Rechargeable, et fait pour durer.</p>
              </div>
            </div>
          </div>

          <div className="order-section">
            <div className="order-content-mochi">
              <h3>Commander</h3>
              <h2 className="confiteria">Mochi le panda</h2>
              <p>
                Laissez <strong className="confmochi">Mochi</strong> veiller sur les nuits de votre enfant avec douceur et réconfort.
                Renseignez votre adresse e-mail pour recevoir des offres exclusives et être informé des nouveautés !
              </p>
              <label htmlFor="email">adresse email :</label>
              <input 
                type="email" 
                id="email" 
                placeholder="saisir" 
                value={orderEmail}
                onChange={(e) => setOrderEmail(e.target.value)}
              />
              <button 
                type="button" 
                ref={orderButtonRef}
                onClick={handleOrder}
              >
                Commander
              </button>
            </div>
            <img src={mochiGround} alt="Veilleuse Mochi" className="order-image" />
          </div>
        </section>

        <section className="mochiimageandtext">
          <img src={mochiThree} alt="image_des_caracteristiques_de_mochi" className="widthimage" />
        </section>

        <section className="mochi-magie-text">
  <h2>
    <span className="confiteria">Mochi</span>, le panda veilleur des nuits – une magie VERTYNO
  </h2>
  <p>
    <span className="confiteria">Mochi</span>, le panda malicieux, s’adapte à chaque moment de la nuit. Avec ses 7 couleurs changeantes, 
    il crée une ambiance unique : une lumière douce pour l’endormissement, un éclairage rassurant pour les réveils nocturnes, 
    ou une touche ludique pour les rêves éveillés. Pratique et sécurisé, <span className="confiteria">Mochi</span> accompagne chaque nuit avec douceur.
  </p>
</section>


        <section className="mochi-section-quatreimg">
          <img src={mochiQuatre} alt="image_de_couleurs_de_mochi" className="widthimage dispFlex" />
        </section>

        <section className="mochi-caracteristiques">
  <h2>Caractéristiques de <span className="confiteria">Mochi le panda</span></h2>

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
      Appuyez légèrement sur <strong className="confmochi">Mochi</strong> pour l’allumer ou varier l’intensité.
      Son mode multicolore apporte une touche de magie avant le coucher.
      Les couleurs défilent une à une : tapotez au moment où celle que vous aimez apparaît pour la figer.
      Activez le minuteur pour qu’il s’éteigne tout seul après un moment, 
      et laissez Mochi veiller sur votre enfant toute la nuit.
    </p>
  </div>
</section>



        <section className="mochi-packaging">
          <img
            src={mochiFive}
            alt="Boîte Mochi le panda"
            className="packaging-box-img widthimage"
          />
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
