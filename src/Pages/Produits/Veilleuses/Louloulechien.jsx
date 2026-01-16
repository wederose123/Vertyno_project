import "../../../styles/Pages/Produits/Veilleuses/loulou.css";
import { useState, useEffect, useRef } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../Firebase/firebase-config";
import axios from "axios";
import FirstLoulou from "../../../assets/Pages/Produits/Veilleuses/Loulou/Louloufirst.png"; 
import ProductComponent from "../../../Composants/Product/ProductComponent";
import { useFlyToCart } from "../../../hooks/useFlyToCart";
import { useToast } from "../../../context/ToastContext";
import LoulouTable from "../../../assets/Pages/Produits/Veilleuses/Loulou/Loulou-table.png";
import vertynoLogo from "../../../assets/Pages/Produits/Veilleuses/Loulou/vertynoLogo.png";
import loulouback from "../../../assets/Pages/Produits/Veilleuses/Loulou/loulouback.png";
import patte from "../../../assets/Pages/Produits/Veilleuses/Loulou/patte.png";
import loulouone from "../../../assets/Pages/Produits/Veilleuses/Loulou/loulouone.png";
import louloutwo from "../../../assets/Pages/Produits/Veilleuses/Loulou/louloutwo.png";
import loulouground from "../../../assets/Pages/Produits/Veilleuses/Loulou/loulouground.png";
import loulouthree from "../../../assets/Pages/Produits/Veilleuses/Loulou/loulouthree.png";
import loulouquatre from "../../../assets/Pages/Produits/Veilleuses/Loulou/loulouquatre.png";
import louloufive from "../../../assets/Pages/Produits/Veilleuses/Loulou/louloufive.png";

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




export default function Louloulechien () {

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
    }, 5000); // change every 5 seconds
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
        source: "louloulechien-order"
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
    <div className="loulou-page">
      <ProductComponent
        slug="louloulechien"
        onProductReady={(product) => setSelectedProduct(product)}
      />
<div className="hero-section">
  <img src={FirstLoulou} alt="Veilleuse Loulou le chien" className="hero-img" />
  <div className="hero-content">
    <h1 className="hero-title">Loulou le chien</h1>
    <button 
      type="button" 
      className="hero-button-loulou" 
      ref={heroButtonRef}
      onClick={() => handleAddToCart(heroButtonRef)}
    >
      Commander
    </button>
  </div>
</div>

<section className="loulou-table-section">
  <div className="loulou-table-content">
    <img src={LoulouTable} alt="Loulou le chien sur une table" className="loulou-table-img" />
  </div>
</section>

<section className="loulou-text-section">
  <section className="presentation-section-loulou">
        <div className="image-logo-and-patte">
      <img src={patte} alt="Arc-en-ciel Vertyno" className="rainbow" />
    <img src={vertynoLogo} alt="Logo Vertyno" className="vertyno-logo " />
        </div>
    <h2 className="presentation-title-loulou">Loulou, le compagnon lumineux des nuits sereines</h2>
    <article className="presentation-text-area-loulou">
      <p className="presentation-text-loulou">
        Avec son regard tendre et sa lumière apaisante, <strong className="confloulou">Loulou </strong>
         veille sur les tout-petits. Son silicone moelleux sans BPA et sa LED douce rassurent sans
        fatiguer les yeux. D’un simple tapotement, il s’illumine pour accompagner le sommeil. Un
        doudou magique aux couleurs changeantes, une touche de douceur VERTYNO.
      </p>
      <img src={loulouback} alt="Loulou le chien lumineux" className="loulou-doudou-img" />
    </article>
  </section>
</section>

<section className="double-image-section-loulou">
  <div className="double-image-content-loulou">
    <img src={loulouone} alt="image_de_la_veilleuse_loulou" className="widthimage" />
    <img src={louloutwo} alt="image_de_la_veilleuse_loulou" className="widthimage" />
  </div>
</section>

<section className="advantages-and-order-loulou">
  <div className="advantages-section">
    <h2 className="confiteria advantages-title">Loulou le chien</h2>
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
    <div className="order-content-loulou">
      <h3>Commander</h3>
      <h2 className="confiteria">Loulou le chien</h2>
<p>
  Laissez <strong className="confloulou">Loulou</strong> veiller sur les nuits de votre enfant avec douceur et réconfort.
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
    <img src={loulouground} alt="Veilleuse Lili" className="order-image" />
  </div>
</section>

<section className="loulouimageandtext">
    <img src={loulouthree} alt="image_de_les_caracteristique_de_loulou" className=" widthimage" />
</section>


<section className="loulou-description-text">
  <h2><span className="confiteria">Loulou</span>, la veilleuse enchantée par Vertyno</h2>
  <p>
    Un réveil nocturne, un besoin de lumière sans déranger ? D’un simple tapotement, 
    <span className="confiteria">Loulou</span> s’illumine en douceur. Conçue pour apporter confort et sérénité, 
    elle diffuse une lumière tamisée qui rassure, guide et accompagne chaque instant, 
    du coucher aux petits réveils nocturnes. Avec ses 7 couleurs changeantes, elle s’adapte aux besoins.
  </p>
</section>

<section className="loulou-section-quatreimg">
    <img src={loulouquatre} alt="image_de_les_couleurs_de_lili" className=" widthimage dispFlex" />
</section>

<section className="loulou-caracteristiques">
  <h2>Caractéristique de <span className="confiteria">Loulou le petit chien</span></h2>

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

    <div className="carac-item unique">Matière<br /><strong className="reglage">Silicone doux  <br />et moelleux</strong></div>
  </div>

  <div className="guide-utilisation">
    <h3>Guide d’utilisation</h3>
    <p>
      Appuyez légèrement sur <strong className="confloulou">Loulou</strong> pour l’allumer ou varier l’intensité.
      Son mode multicolore apporte une touche de magie avant le coucher.
      Les couleurs défilent une à une : tapotez au moment où celle que vous aimez apparaît pour la figer.
      Activez le minuteur pour qu’il s’éteigne tout seul après un moment, 
      et laissez Loulou veiller sur votre enfant toute la nuit.
    </p>
  </div>
</section>

<section className="loulou-packaging">
  <img
    src={louloufive}
    alt="Boîte Loulou le petit chien"
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