import "../../../styles/Pages/Produits/Assiettes/Monpetitourson.css";
import FirstOurson from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/FirstOurson.png";
import OursonTable from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/OursonTable.png";
import vertynoLogo from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/vertynoLogo.png";
import oursonBack from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/oursonBack.png";
import oursonOne from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/oursonOne.png";
import oursonTwo from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/oursonTwo.png";
import oursonGround from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/oursonGround.png";
import oursonThree from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/oursonThree.png";
import oursonQuatre from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/oursonQuatre.png";
import oursonFive from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/oursonFive.png";
import iconSmiley from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/iconSmiley.png";
import iconBamboo from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/iconBamboo.png";
import iconBPA from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/iconBPA.png";
import iconSponge from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/iconSponge.png";
import iconSuction from "../../../assets/Pages/Produits/Assiettes/Monpetitourson/iconSuction.png";

export default function Monpetitourson() {
  return (
    <>
      <div>
        <div className="hero-section">
          <img src={FirstOurson} alt="Assiette Mon petit ourson" className="hero-img" />
          <div className="hero-content">
            <h1 className="hero-title-ourson">Mon petit ourson</h1>
            <button className="hero-button-ourson">Commander</button>
          </div>
        </div>

        <section className="ourson-table-section">
          <div className="ourson-table-content">
            <img src={OursonTable} alt="Mon petit ourson sur une table" className="ourson-table-img" />
          </div>
        </section>

        <section className="ourson-text-section">
          <section className="presentation-section-ourson">
            <div className="image-logo-and-patte">
              <img src={vertynoLogo} alt="Logo Vertyno" className="vertyno-logo " />
            </div>
            <h2 className="presentation-title-ourson">Un repas tout en douceur </h2>
            <article className="presentation-text-area-ourson">
              <p className="presentation-text-ourson">
                Pensées pour les petites faims et les grands câlins, notre assiette mon doux 
                ourson en bambou FSC a été conçue pour accompagner les premiers repas en toiute 
                sérénité. Sa base en silicone antidérapante évite les glissades, et ses contourq 
                doux et arrondis encouragent l’autonomie des tout-petits. Une approche ludique et 
                bienveillante inspirée de la méthode Montessori.
              </p>
              <img src={oursonBack} alt="Mon petit ourson lumineux" className="ourson-doudou-img" />
            </article>
          </section>
        </section>

        <section className="double-image-section-ourson">
          <div className="double-image-content-ourson">
            <img src={oursonOne} alt="Assiette Mon petit ourson" className="widthimage" />
            <img src={oursonTwo} alt="Assiette Mon petit ourson" className="widthimage" />
          </div>
        </section>

        <section className="advantages-and-order">
          <div className="ourson-new-info">
            <div className="ourson-title"><img src={vertynoLogo} alt="Logo Vertyno" className="vertyno-logo " /></div>
            <h3 className="ourson-subtitle"><strong className="confourson">mon petit ourson</strong> une tendresse responsable </h3>
            <p className="ourson-description">
              Fabriqué en bambou issu de forêts gérées durablement, sans plastique ni BPA,
               cette assiette respecte la santé de votre enfant comme celle de la planète. 
               Un choix responsable pour des parents exigeants.
            </p>
          </div>

          <div className="order-section">
            <div className="order-content">
              <h3>Commander</h3>
              <h2 className="confiteria">Mon petit ourson</h2>
              <p>
                Laissez <strong className="confourson">Mon petit ourson</strong> veiller sur les repas de votre enfant avec douceur et réconfort.
                Renseignez votre adresse e-mail pour recevoir des offres exclusives et être informé des nouveautés !
              </p>
              <label htmlFor="email">adresse email :</label>
              <input type="email" id="email" placeholder="saisir" />
              <button>Commander</button>
            </div>
            <img src={oursonGround} alt="Assiette Mon petit ourson" className="order-image" />
          </div>
        </section>

        <section className="oursonimageandtext">
          <img src={oursonThree} alt="Caractéristiques de Mon petit ourson" className="widthimage" />
        </section>

        <section className="ourson-magie-text">
          <div className="ourson-title-text-part">
            Un moment complice avec <span className="confourson">mon petit ourson</span>
          </div>
          <p>
            Plus qu’un repas, c’est un moment de partage. Avec son design attendrissant, 
            <span className="confourson">mon petit ourson</span> transforme chaque bouchée 
            en une petite aventure plein de tendresse.Idéale pour les enfants dès 6 mois, 
            avec l’aide d’un parent, ou en solo quand ils grandissent.

          </p>
        </section>

        <section className="ourson-section-quatreimg">
          <img src={oursonQuatre} alt="Couleurs Mon petit ourson" className="widthimage dispFlex" />
        </section>

        <section className="ourson-caracteristiques-v2">
          <h2>Caractéristique de <span className="confourson">mon petit ourson</span></h2>
          <div className="ourson-icon-grid">
            <div className="big-contenaire-three">
              <div className="ourson-icon-item">
                <img src={iconSmiley} alt="dessinée pour les enfants" />
                <p>dessinée pour<br />les enfants</p>
              </div>
              <div className="ourson-icon-item">
                <img src={iconBamboo} alt="écologique" />
                <p>écologique</p>
              </div>
              <div className="ourson-icon-item">
                <img src={iconBPA} alt="sans bisphénol A" />
                <p>sans<br />bisphénol A</p>
              </div>
            </div>

            <div className="small-contenaire-two">
              <div className="ourson-icon-item">
                <img src={iconSponge} alt="facile à nettoyer" />
                <p>facile à<br />nettoyer</p>
              </div>
              <div className="ourson-icon-item">
                <img src={iconSuction} alt="ventouse antidérapante" />
                <p>ventouse<br />antidérapante</p>
              </div>
            </div>
          </div>

          <div className="ourson-entretien">
            <h3>Guide d’entretien: prenez soin de votre ourson</h3>
            <p>
              Lavez <span className="confourson">mon petit ourson</span> à la main avec une éponge douce et un peu de savon, puis séchez-le aussitôt. 
              Évitez le lave-vaisselle et le micro-ondes : ce petit ourson aime la douceur, pas les hautes températures.
              Pour le garder doux et lumineux, pensez à appliquer une goutte d’huile alimentaire de temps en temps (coco ou colza).
            </p>
          </div>
        </section>

        <section className="ourson-packaging">
          <img
            src={oursonFive}
            alt="Boîte Mon petit ourson"
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
 