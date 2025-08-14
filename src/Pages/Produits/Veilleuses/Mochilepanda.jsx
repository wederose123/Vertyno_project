import "../../../styles/Pages/Produits/Veilleuses/mochi.css";
import { useState, useEffect } from "react";
import FirstMochi from "../../../assets/Pages/Produits/Veilleuses/Mochi/Mochifirst.png"; 
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

export default function MochiLePanda () {

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prevIndex) => (prevIndex + 1) % 3);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="mochi-page">
        <div className="hero-section">
          <img src={FirstMochi} alt="Veilleuse Mochi le panda" className="hero-img" />
          <div className="hero-content">
            <h1 className="hero-title">Mochi le panda</h1>
            <a href={"https://www.etsy.com/fr/listing/4346170757/mochi-le-panda-veilleuse-bebe-silicone-o?ref=related-1&logging_key=e8cfb9fd8ad2d4fb72e2157124888a0d60a415fa%3A4346170757 "} className="hero-button-mochi">Commander</a>
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
              <input type="email" id="email" placeholder="saisir" />
              <button> <a href={"https://www.etsy.com/fr/listing/4346170757/mochi-le-panda-veilleuse-bebe-silicone-o?ref=related-1&logging_key=e8cfb9fd8ad2d4fb72e2157124888a0d60a415fa%3A4346170757 "}>Commander</a></button>
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
            <button className="white-outline-btn"> <a href={"https://www.etsy.com/fr/listing/4346170757/mochi-le-panda-veilleuse-bebe-silicone-o?ref=related-1&logging_key=e8cfb9fd8ad2d4fb72e2157124888a0d60a415fa%3A4346170757 "}>Commander</a></button>
            <button className="white-outline-btn"><a href={"/Contact"}>Contact</a></button>
          </div>
        </section>
      </div>
    </>
  );
}
