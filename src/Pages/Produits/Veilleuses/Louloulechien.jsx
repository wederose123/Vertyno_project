import "../../../styles/Pages/Produits/Veilleuses/loulou.css";
import { useState, useEffect } from "react";
import FirstLoulou from "../../../assets/Pages/Produits/Veilleuses/Loulou/Louloufirst.png"; 
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




export default function Louloulechien () {

const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 5000); // change every 5 seconds
    return () => clearInterval(interval);
  }, []);




  return (

    <>
    <div className="loulou-page">
<div className="hero-section">
  <img src={FirstLoulou} alt="Veilleuse Loulou le chien" className="hero-img" />
  <div className="hero-content">
    <h1 className="hero-title">Loulou le chien</h1>
    <a href={"https://www.etsy.com/fr/listing/4346166365/loulou-le-chien-veilleuse-bebe-tactile?ls=s&ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=veilleuse+silicone+licorne&ref=sr_gallery-1-4&nob=1&content_source=2a03c84d-0262-440d-9460-1f001f0ee17b%253A991ab0a1dd2638422376f1b8edd41695ef2f3c59&organic_search_click=1&logging_key=2a03c84d-0262-440d-9460-1f001f0ee17b%3A991ab0a1dd2638422376f1b8edd41695ef2f3c59 "} className="hero-button-loulou">Commander</a>
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
      <input type="email" id="email" placeholder="saisir" />
      <button>Commander</button>
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
    <button className="white-outline-btn"><a href={"https://www.etsy.com/fr/listing/4346166365/loulou-le-chien-veilleuse-bebe-tactile?ls=s&ga_order=most_relevant&ga_search_type=all&ga_view_type=gallery&ga_search_query=veilleuse+silicone+licorne&ref=sr_gallery-1-4&nob=1&content_source=2a03c84d-0262-440d-9460-1f001f0ee17b%253A991ab0a1dd2638422376f1b8edd41695ef2f3c59&organic_search_click=1&logging_key=2a03c84d-0262-440d-9460-1f001f0ee17b%3A991ab0a1dd2638422376f1b8edd41695ef2f3c59"}>Commander</a></button>
    <button className="white-outline-btn"><a href={"Contact"}>Contact</a></button>
  </div>
</section>


    </div>
    </>
  );
}