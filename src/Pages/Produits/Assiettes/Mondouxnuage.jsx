import "../../../styles/Pages/Produits/Assiettes/Mondouxnuage.css";
import FirstNuage from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/FirstNuage.png";
import NuageTable from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/NuageTable.png";
import vertynoLogo from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/vertynoLogo.png";
import nuageBack from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/nuageBack.png";
import nuageOne from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/nuageOne.png";
import nuageTwo from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/nuageTwo.png";
import nuageGround from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/nuageGround.png";
import nuageThree from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/nuageThree.png";
import nuageQuatre from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/nuageQuatre.png";
import nuageFive from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/nuageFive.png";
import iconSmiley from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/iconSmiley.png";
import iconBamboo from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/iconBamboo.png";
import iconBPA from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/iconBPA.png";
import iconSponge from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/iconSponge.png";
import iconSuction from "../../../assets/Pages/Produits/Assiettes/Mondouxnuage/iconSuction.png";

export default function Mondouxnuage() {
 

  return (
    <>
      <div>
        <div className="hero-section">
          <img src={FirstNuage} alt="Veilleuse Mon doux nuage" className="hero-img" />
          <div className="hero-content">
            <h1 className="hero-title-nuage">Mon doux nuage</h1>
            <button className="hero-button-nuage">Commander</button>
          </div>
        </div>

        <section className="nuage-table-section">
          <div className="nuage-table-content">
            <img src={NuageTable} alt="Mon doux nuage sur une table" className="nuage-table-img" />
          </div>
        </section>

        <section className="nuage-text-section">
          <section className="presentation-section-nuage">
            <div className="image-logo-and-patte">
              <img src={vertynoLogo} alt="Logo Vertyno" className="vertyno-logo " />
            </div>
            <h2 className="presentation-title-nuage">Un repas tout en douceur </h2>
            <article className="presentation-text-area-nuage">
              <p className="presentation-text-nuage">
                Pensées pour les petites mains et les grandes découvertes, nos assiettes en bambou 
                FSC allient sécurité et confort. Leur base en silicone antidérapant assure une stabilité 
                parfaite pour éviter les accidents, tandis que leur design ludique encourage l’autonomie 
                des tout-petits. Inspirées de la pédagogie Montessori, nos assiettes permettent aux 
                enfants d’apprendre à manger seuls, en toute confiance. Leur forme ergonomique et 
                leur cuillère adaptée facilitent la prise en main en encouragent l’indépendance, 
                pour transformer chaque repas en une nouvelle aventure ! 
              </p>
              <img src={nuageBack} alt="Mon doux nuage lumineux" className="nuage-doudou-img" />
            </article>
          </section>
        </section>

        <section className="double-image-section-nuage">
          <div className="double-image-content-nuage">
            <img src={nuageOne} alt="Veilleuse Mon doux nuage" className="widthimage" />
            <img src={nuageTwo} alt="Veilleuse Mon doux nuage" className="widthimage" />
          </div>
        </section>

        <section className="advantages-and-order-nuage">
          <div className="nuage-new-info">
  <div className="nuage-title"><img src={vertynoLogo} alt="Logo Vertyno" className="vertyno-logo " /></div>
  <h3 className="nuage-subtitle"><strong className="confnuage">mon doux nuage</strong> une tendresse responsable </h3>
  <p className="nuage-description">
    Conçue en bambou certifié FSC et silicone alimentaire, 
    <strong className="confnuage"> mon doux nuage</strong> offre un équilibre parfait entre 
    douceur, sécurité et durabilité. Sans plastique, ni BPA, elle 
    accompagne les repas de votre enfant avec une sérénité 
    naturelle, dans le respect de sa santé… et de la planète.
  </p>
</div>


          <div className="order-section">
            <div className="order-content-nuage">
              <h3>Commander</h3>
              <h2 className="confiteria">Mon doux nuage</h2>
              <p>
                Laissez <strong className="confnuage">Mon doux nuage</strong> veiller sur les nuits de votre enfant avec douceur et réconfort.
                Renseignez votre adresse e-mail pour recevoir des offres exclusives et être informé des nouveautés !
              </p>
              <label htmlFor="email">adresse email :</label>
              <input type="email" id="email" placeholder="saisir" />
              <button>Commander</button>
            </div>
            <img src={nuageGround} alt="Veilleuse Mon doux nuage" className="order-image" />
          </div>
        </section>

        <section className="nuageimageandtext">
          <img src={nuageThree} alt="Caractéristiques de Mon doux nuage" className="widthimage" />
        </section>

        <section className="nuage-magie-text">
          <div className="nuage-title-text-part">
            Une pause douceur avec <span className="confiteria">mon doux nuage</span>
          </div>
          <p>
           Avec ses courbes apaisantes et son design poétique, <span className="confiteria">mon doux nuage </span> transforme chaque 
           repas en moment de calme et d’éveil. Idéale pour accompagner les premiers gestes des 
           tout-petits, elle invite à la découverte dans un cocon de tendresse.
          </p>
        </section>

        <section className="nuage-section-quatreimg">
          <img src={nuageQuatre} alt="Couleurs Mon doux nuage" className="widthimage dispFlex" />
        </section>

        <section className="nuage-caracteristiques-v2">
  <h2>Caractéristique de <span className="confnuage">mon doux nuage</span></h2>
  <div className="nuage-icon-grid">
    <div className="big-contenaire-three">
      <div className="nuage-icon-item">
        <img src={iconSmiley} alt="dessinée pour les enfants" />
        <p>dessinée pour<br />les enfants</p>
      </div>
      <div className="nuage-icon-item">
        <img src={iconBamboo} alt="écologique" />
        <p>écologique</p>
      </div>
      <div className="nuage-icon-item">
        <img src={iconBPA} alt="sans bisphénol A" />
        <p>sans<br />bisphénol A</p>
      </div>
    </div>

    <div className="small-contenaire-two">
      <div className="nuage-icon-item">
        <img src={iconSponge} alt="facile à nettoyer" />
        <p>facile à<br />nettoyer</p>
      </div>
      <div className="nuage-icon-item">
        <img src={iconSuction} alt="ventouse antidérapante" />
        <p>ventouse<br />antidérapante</p>
      </div>
    </div>
  </div>

  <div className="nuage-entretien">
    <h3>Guide d’entretien: prenez soin de votre nuage</h3>
    <p>
      Lavez <strong className="confnuage">mon doux nuage</strong> à la main avec une éponge douce et un peu de savon, puis séchez-le aussitôt. 
      Évitez le lave-vaisselle et le micro-ondes : ce petit nuage aime la douceur, pas les hautes températures.
      Pour le garder doux et lumineux, pensez à appliquer une goutte d’huile alimentaire de temps en temps (coco ou colza).
    </p>
  </div>
</section>

        <section className="nuage-packaging">
          <img
            src={nuageFive}
            alt="Boîte Mon doux nuage"
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
