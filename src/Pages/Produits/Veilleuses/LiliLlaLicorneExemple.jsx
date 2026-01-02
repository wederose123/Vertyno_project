import "../../../styles/Pages/Produits/Veilleuses/lilicssexemple.css";
import { useState, useRef } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../../Firebase/firebase-config";
import axios from "axios";
import ProductComponent from "../../../Composants/Product/ProductComponent";
import { useFlyToCart } from "../../../hooks/useFlyToCart";
import liliProduit from "../../../assets/Produits/lili-produits.jpg";

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

export default function LiliLlaLicorneExemple() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderEmail, setOrderEmail] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  
  const heroButtonRef = useRef(null);
  const orderButtonRef = useRef(null);
  const ctaButtonRef = useRef(null);
  
  const flyToCart = useFlyToCart();

  const productImages = [
    liliProduit,
    liliProduit,
    liliProduit,
  ];

  const handleAddToCart = async (buttonRef) => {
    if (!selectedProduct) {
      console.warn("Aucun produit sélectionné");
      return;
    }

    const panierButton = document.getElementById("panier-button");
    
    if (buttonRef?.current && panierButton) {
      flyToCart(buttonRef.current, panierButton);
    }

    try {
      await addDoc(collection(db, "panier"), {
        id: selectedProduct.id,
        slug: selectedProduct.slug,
        name: selectedProduct.name,
        category: selectedProduct.category,
        price: selectedProduct.price,
        image: selectedProduct.image,
        stripePriceId: selectedProduct.stripePriceId,
        createdAt: serverTimestamp()
      });
      console.log("Produit ajouté dans Firestore :", selectedProduct.name);
    } catch (error) {
      console.error("Erreur lors de l'ajout dans Firestore :", error);
    }
  };

  const handleOrder = async () => {
    if (!selectedProduct) {
      console.warn("Aucun produit sélectionné");
      return;
    }

    if (!orderEmail || !orderEmail.trim()) {
      console.warn("Email requis pour la commande");
      return;
    }

    const panierButton = document.getElementById("panier-button");
    
    if (orderButtonRef?.current && panierButton) {
      flyToCart(orderButtonRef.current, panierButton);
    }

    try {
      await addDoc(collection(db, "panier"), {
        id: selectedProduct.id,
        slug: selectedProduct.slug,
        name: selectedProduct.name,
        category: selectedProduct.category,
        price: selectedProduct.price,
        image: selectedProduct.image,
        stripePriceId: selectedProduct.stripePriceId,
        createdAt: serverTimestamp()
      });
      console.log("Produit ajouté dans Firestore :", selectedProduct.name);

      await addDoc(collection(db, "newsletter"), {
        email: orderEmail.trim(),
        createdAt: serverTimestamp(),
        source: "lililalicorne-order"
      });
      console.log("Email ajouté dans newsletter :", orderEmail);

      try {
        await addEmailToBrevo(orderEmail.trim());
        console.log("Email ajouté dans Brevo :", orderEmail);
      } catch (brevoError) {
        console.warn("Erreur Brevo (non bloquant) :", brevoError);
      }

      window.location.href = "/Panier";
    } catch (error) {
      console.error("Erreur lors de la commande :", error);
    }
  };

  const features = [
    {
      icon: "🔋",
      title: "Autonomie optimale",
      description: "Jusqu'à une nuit complète de sommeil avec une seule charge"
    },
    {
      icon: "🌈",
      title: "7 couleurs magiques",
      description: "Mode multicolore changeant pour créer une atmosphère féerique"
    },
    {
      icon: "👶",
      title: "100% sécurisé",
      description: "Silicone alimentaire sans BPA, LED douce sans danger pour les yeux"
    },
    {
      icon: "⚡",
      title: "Rechargeable USB",
      description: "Batterie 1200 mAH rechargeable via USB (câble inclus)"
    },
    {
      icon: "⏰",
      title: "Minuterie intégrée",
      description: "S'éteint automatiquement après 30 minutes pour économiser la batterie"
    },
    {
      icon: "✨",
      title: "Texture douce",
      description: "Silicone moelleux et agréable au toucher, parfait pour les câlins"
    }
  ];

  const testimonials = [
    {
      name: "Sophie M.",
      text: "Ma fille de 3 ans adore Lili ! Elle s'endort beaucoup plus facilement maintenant. La lumière est vraiment douce et apaisante.",
      rating: 5
    },
    {
      name: "Thomas L.",
      text: "Excellent produit ! Très bonne qualité, la batterie tient vraiment toute la nuit. Ma petite fille ne veut plus s'en séparer.",
      rating: 5
    },
    {
      name: "Marie D.",
      text: "Parfait pour rassurer les enfants qui ont peur du noir. Le design est mignon et la fonctionnalité est au rendez-vous. Je recommande !",
      rating: 5
    }
  ];

  return (
    <div className="exemple-page">
      <ProductComponent
        slug="lililalicorne"
        onProductReady={(product) => setSelectedProduct(product)}
      />
      
      {/* Badges de confiance */}
      <section className="exemple-trust-badges">
        <div className="exemple-trust-item">
          <span className="exemple-trust-icon">🚚</span>
          <span className="exemple-trust-text">Livraison gratuite</span>
        </div>
        <div className="exemple-trust-item">
          <span className="exemple-trust-icon">🔒</span>
          <span className="exemple-trust-text">Paiement sécurisé</span>
        </div>
        <div className="exemple-trust-item">
          <span className="exemple-trust-icon">✅</span>
          <span className="exemple-trust-text">Satisfait ou remboursé</span>
        </div>
        <div className="exemple-trust-item">
          <span className="exemple-trust-icon">⏰</span>
          <span className="exemple-trust-text">Stock limité</span>
        </div>
      </section>

      {/* Section Produit Principal */}
      <section className="exemple-product-section">
        <div className="exemple-product-container">
          {/* Galerie d'images */}
          <div className="exemple-image-gallery">
            <div className="exemple-main-image">
              <img src={productImages[selectedImage]} alt="Lili la licorne" />
            </div>
            <div className="exemple-thumbnails">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  className={`exemple-thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`Vue ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Informations produit */}
          <div className="exemple-product-info">
            <h2 className="exemple-product-title">Lili la Licorne - Veilleuse Magique</h2>
            <div className="exemple-product-rating">
              <span className="exemple-stars">★★★★★</span>
              <span className="exemple-rating-text">(127 avis)</span>
            </div>
            
            <div className="exemple-product-price-section">
              <span className="exemple-product-old-price">35,00 €</span>
              <span className="exemple-product-price">24,90 €</span>
              <span className="exemple-product-discount">-29%</span>
            </div>

            <p className="exemple-product-description">
              Découvrez <strong>Lili la Licorne</strong>, la veilleuse magique qui transforme 
              les nuits de votre enfant en moments de douceur et de sérénité. Avec sa lumière 
              douce et ses 7 couleurs changeantes, Lili crée une atmosphère apaisante idéale 
              pour favoriser l'endormissement.
            </p>

            <div className="exemple-product-features-preview">
              <div className="exemple-feature-preview">
                <span className="exemple-feature-icon">🔋</span>
                <span>Autonomie : 1 nuit complète</span>
              </div>
              <div className="exemple-feature-preview">
                <span className="exemple-feature-icon">🌈</span>
                <span>7 couleurs magiques</span>
              </div>
              <div className="exemple-feature-preview">
                <span className="exemple-feature-icon">👶</span>
                <span>Sans BPA, 100% sécurisé</span>
              </div>
            </div>

            <div className="exemple-cta-section">
              <button
                type="button"
                className="exemple-cta-button primary"
                ref={heroButtonRef}
                onClick={() => handleAddToCart(heroButtonRef)}
              >
                Ajouter au panier - 24,90 €
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Caractéristiques */}
      <section className="exemple-features-section">
        <h2 className="exemple-section-title">Pourquoi choisir Lili la Licorne ?</h2>
        <div className="exemple-features-grid">
          {features.map((feature, index) => (
            <div key={index} className="exemple-feature-card">
              <div className="exemple-feature-icon-large">{feature.icon}</div>
              <h3 className="exemple-feature-title">{feature.title}</h3>
              <p className="exemple-feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="exemple-testimonials-section">
        <h2 className="exemple-section-title">Ce que disent les parents</h2>
        <div className="exemple-testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="exemple-testimonial-card">
              <div className="exemple-testimonial-stars">
                {"★".repeat(testimonial.rating)}
              </div>
              <p className="exemple-testimonial-text">"{testimonial.text}"</p>
              <p className="exemple-testimonial-author">— {testimonial.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section Commande avec Email */}
      <section id="exemple-order-section" className="exemple-order-section">
        <div className="exemple-order-container">
          <div className="exemple-order-content">
            <h2 className="exemple-order-title">Commandez maintenant et recevez des offres exclusives</h2>
            <p className="exemple-order-subtitle">
              En commandant aujourd'hui, vous bénéficiez de notre offre promotionnelle 
              et recevrez des informations sur nos nouveautés et offres spéciales.
            </p>
            
            <div className="exemple-order-price">
              <span className="exemple-order-old-price">35,00 €</span>
              <span className="exemple-order-new-price">24,90 €</span>
              <span className="exemple-order-discount">-29%</span>
            </div>

            <form className="exemple-order-form" onSubmit={(e) => { e.preventDefault(); handleOrder(); }}>
              <div className="exemple-form-group">
                <label htmlFor="exemple-email">Entrez votre e-mail pour bénéficier de réduction</label>
                <input
                  type="email"
                  id="exemple-email"
                  placeholder="votre@email.com"
                  value={orderEmail}
                  onChange={(e) => setOrderEmail(e.target.value)}
                  required
                />
                <p className="exemple-form-hint">
                  Nous vous enverrons un email de confirmation et des offres exclusives
                </p>
              </div>
              <button
                type="submit"
                className="exemple-order-button"
                ref={orderButtonRef}
              >
                Ajouter au panier
              </button>
            </form>
          </div>
          <div className="exemple-order-image">
            <img src={liliProduit} alt="Lili la licorne" />
          </div>
        </div>
      </section>

      {/* Section CTA Final */}
      <section className="exemple-final-cta">
        <div className="exemple-final-cta-content">
          <h2 className="exemple-final-cta-title">Ne manquez pas cette offre exceptionnelle !</h2>
          <p className="exemple-final-cta-text">
            Stock limité - Offre valable jusqu'à épuisement des stocks
          </p>
          <button
            type="button"
            className="exemple-final-cta-button"
            ref={ctaButtonRef}
            onClick={() => handleAddToCart(ctaButtonRef)}
          >
            Ajouter au panier maintenant
          </button>
        </div>
      </section>
    </div>
  );
}
