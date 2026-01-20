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
   VERTYNO est né d’une idée simple : créer des objets ludiques, pratiques et réconfortants, pensés pour accompagner les enfants comme les plus grands.
  Imaginés par des parents qui comprennent les besoins du quotidien, nos produits trouvent leur place à chaque étape de la vie familiale : apaiser un enfant au moment du coucher, rassurer dans la nuit, ou encore apporter une touche de douceur et de design à la maison.
  <br/><br/>Parce que le quotidien est une aventure faite de découvertes, de rires et parfois de défis, VERTYNO conçoit des créations qui facilitent la vie, éveillent l’imaginaire et apportent du bien-être à toute la famille.</p>

  <p className="about-author">Team VERTYNO</p>
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