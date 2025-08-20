import "../styles/Homes.css"; 
import HeroImage from "../assets/home-page/QuatreVeilleuse.png";
import justvetyno from "../assets/home-page/justvertyno.png";
import ListeProduits from "../Composants/Produits/Produit.jsx";
import Engagements from "../Composants/Nos-engagements/Engagements.jsx";
import Faq from "../Composants/Faq/Faq.jsx";


export default function Home()   {
  return (
    <>
    <div>
      <div className="hero">
      <img src={HeroImage} alt="Bannière veilleuses" className="hero-background" />

      <div className="hero-content">
        <img src={justvetyno} alt="Vertyno" className="hero-logo" />
      </div>
    </div>
    <section className="about-section">
  <h2 className="about-quote">“La simplicité de<br />l’histoire de VERTYNO“</h2>

  <p className="about-text">
    VERTYNO est né d’une idée simple : proposer des objets ludiques et pratiques, conçus par des parents qui comprennent les besoins des enfants.
    Nous savons que le quotidien avec un tout-petit est une aventure pleine de découvertes… et parfois de défis !
    C’est pourquoi nous créons des produits pensés pour simplifier la vie des familles, tout en éveillant la curiosité et l’imaginaire des enfants.
  </p>

  <p className="about-author"><strong>A.B</strong></p>
</section>
    <section className="produits-section">
      <h2 className="tittle-two">Nos produits phares</h2>
      <ListeProduits />
    </section>
    <section className="engagements-section">
      <Engagements />
    </section>
    <section className="faq-section">
      <Faq />
    </section>
    </div>
    </>
  );
}