import "../../../styles/Pages/Produits/Veilleuses/Lili.css";
import { useState, useEffect } from "react";
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




export default function LiliLlaLicorne () {

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 5000); // change every 5 seconds
    return () => clearInterval(interval);
  }, []);


  return (
    <>
    <div>
       <div className="hero-section">
  <img src={FirstLili} alt="Veilleuse Lili la licorne" className="hero-img" />
  <div className="hero-content">
    <h1 className="hero-title">Lili la licorne</h1>
    <button className="hero-button">Commander</button>
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
      <input type="email" id="email" placeholder="saisir" />
      <button>Commander</button>
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
    <button className="white-outline-btn">Commander</button>
    <button className="white-outline-btn">Contact</button>
  </div>
</section>

    </div>
    </>
  );
}

