import "../../../styles/Pages/Produits/Veilleuses/Lili.css";
import { useState, useEffect, useRef } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../Firebase/firebase-config";
import axios from "axios";
import FirstLili from "../../../assets/Pages/Produits/Veilleuses/Lili/Lilifirst.png";
import GirlLili from "../../../assets/Pages/Produits/Veilleuses/Lili/Girl-Lili.png";
import arcenciel from "../../../assets/Pages/Produits/Veilleuses/Lili/arcenciel.png";
import lilibacknone from "../../../assets/Pages/Produits/Veilleuses/Lili/lilibacknone.png";
import vertynolLogo from "../../../assets/Pages/Produits/Veilleuses/Lili/vertyno-logo.png";
import lilioneimg from "../../../assets/Pages/Produits/Veilleuses/Lili/lilioneimg.png";
import lilitwoimg from "../../../assets/Pages/Produits/Veilleuses/Lili/lilitwoimg.png";
import lilithreeimg from "../../../assets/Pages/Produits/Veilleuses/Lili/lilithreeimg.png";
import liliquatreimg from "../../../assets/Pages/Produits/Veilleuses/Lili/liliquatreimg.png";
import lilifiveimg from "../../../assets/Pages/Produits/Veilleuses/Lili/lilifiveimg.png";
import lilisiximg from "../../../assets/Pages/Produits/Veilleuses/Lili/lilisiximg.png";
import ProductComponent from "../../../Composants/Product/ProductComponent";
import { useFlyToCart } from "../../../hooks/useFlyToCart";

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




export default function LiliLlaLicorne () {
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

  /**
   * Fonction spécifique pour la section "order-section"
   * Combine : ajout au panier + enregistrement email dans newsletter + redirection
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
        source: "lililalicorne-order"
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
      window.location.href = "/Panier";
    } catch (error) {
      console.error("Erreur lors de la commande :", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 5000); // change every 5 seconds
    return () => clearInterval(interval);
  }, []);

 

  return (
    <>
    <div className="page-lili">
      <ProductComponent
        slug="lililalicorne"
        onProductReady={(product) => setSelectedProduct(product)}
      />
       <div className="hero-section">
  <img src={FirstLili} alt="Veilleuse Lili la licorne" className="hero-img" />
  <div className="hero-content">
    <h1 className="hero-title">Lili la licorne</h1>
    <button 
      type="button" 
      className="hero-button" 
      ref={heroButtonRef}
      onClick={() => handleAddToCart(heroButtonRef)}
    >
      Commander
    </button>
  </div>
</div>

      <section className="Little-girl-section">
        <div className="Little-girl-content">
          <img src={GirlLili} alt="Lili la licorne" className="Little" />
        </div>
      </section>
      <section className="Lili-text-section">
        <section className="presentation-section">
          <div className="two-img-log-raimbow">
  <img src={arcenciel} alt="Arc-en-ciel Vertyno" className="rainbow" />
  <img src={vertynolLogo} alt="Arc-en-ciel Vertyno" className="rainbow" />
  </div>
  <h2 className="presentation-title">Lili, la douce amie des rêveurs étoilés</h2>
  <article className="presentation-text-area">
<div className="presentation-text-big-one">
    <p className="presentation-text-one">
    Avec sa crinière enchantée et sa lumière réconfortante, <strong className="conflili">Lili</strong> accompagne les nuits des petits rêveurs. 
    D’une simple pression, elle s’illumine pour créer une atmosphère magique et apaisante. Conçue en silicone tout doux, 
    elle est aussi agréable à câliner qu’à admirer. Un véritable trésor pour des nuits pleines de douceur !
  </p>
  </div>
  <div className="presentation-text-big-two">
  <p className="presentation-text-two">
    Une veilleuse pensée pour le bien-être des enfants <br />
    Les spécialistes s’accordent à dire qu’un environnement rassurant favorise un sommeil paisible. 
    <strong className="conflili" >Lili</strong>, avec sa texture toute douce et ses formes réconfortantes, a été conçue pour apporter douceur et 
    sécurité aux tout-petits. Son silicone alimentaire sans BPA est idéal pour les petites mains curieuses, 
    et sa lumière LED sans danger veille sur les nuits sans fatiguer les yeux sensibles.
  </p>
  <img src={lilibacknone} alt="Arc-en-ciel Vertyno" className="liliback" />
  </div>
  </article>
</section>
      </section>
       <section className="double-image-section">
  <div className="double-image-content">
    <img src={lilioneimg} alt="image_de_la_veilleuse" className="widthimage" />
    <img src={lilitwoimg} alt="image_de_la_veilleuse" className="widthimage" />
  </div>
</section> 


    <section className="advantages-and-order-lili">
  <div className="advantages-section">
    <h2 className="confiteria advantages-title">Lili la licorne</h2>
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
    <div className="order-content-lili">
      <h3>Commander</h3>
      <h2 className="confiteria">Lili la licorne</h2>
      <p>
        Laissez <strong className="conflili" >Lili</strong> illuminer les nuits de votre enfant avec douceur et magie.
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
    <img src={lilithreeimg} alt="Veilleuse Lili" className="order-image" />
  </div>
</section>
<section className="liliimageandtext">
    <img src={liliquatreimg} alt="image_de_les_caracteristique_de_lili" className=" widthimage" />
</section>
<section className="lili-description-text">
  <h2><span className="confiteria">Lili</span>, la douce amie des rêveurs étoilés</h2>
  <p>
    Avec sa crinière enchantée et sa lumière réconfortante, <span className="confiteria">Lili</span> accompagne les nuits des petits rêveurs. 
    D’une simple pression, elle s’illumine pour créer une atmosphère magique et apaisante. 
    Conçue en silicone tout doux, elle est aussi agréable à câliner qu’à admirer. 
    Un véritable trésor pour des nuits pleines de douceur !
  </p>
</section>
<section className="liliimagecolor">
    <img src={lilifiveimg} alt="image_de_les_couleurs_de_lili" className=" widthimage dispFlex" />
</section>

    <section className="lili-caracteristiques">
  <h2>Caractéristique de <span className="confiteria">Lili la licorne</span></h2>

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
    <div className="carac-item">Sécurité<br /><strong className="reglage">Sans BPA, en silicone alimentaire,sans danger pour les yeux</strong></div>

    <div className="caracteristiques-divider"></div>

    <div className="carac-item unique">Matière<br /><strong className="reglage">Silicone doux  <br />et moelleux</strong></div>
  </div>

  <div className="guide-utilisation">
    <h3>Guide d’utilisation</h3>
    <p>
      Appuyez légèrement sur <strong className="conflili" >Lili</strong>  pour l’allumer ou varier l’intensité.
      Son mode multicolore apporte une touche de magie avant le coucher.
      Les couleurs défilent une à une : tapotez au moment où celle que vous aimez apparaît pour la figer.
      Activez le minuteur pour qu’il s’éteigne tout seul après un moment, 
      et laissez Lili veiller sur votre enfant toute la nuit.
    </p>
  </div>
</section>

<section className="lili-packaging">
  <img
    src={lilisiximg}
    alt="Boîte Lili la licorne"
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
    <button className="white-outline-btn"> <a href={"/Contact"}>Contact</a></button>
  </div>
</section>



    </div>
    </>
  );
}




