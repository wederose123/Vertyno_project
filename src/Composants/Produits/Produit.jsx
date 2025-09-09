import "../../styles//Produits/Produit.css";
import Just from "../../assets/Produits/lili-produits.jpg";
import loulou from "../../assets/Produits/loulou-produits.jpg";
import mochi from "../../assets/Produits/mochi-produits.jpg";
import dino from "../../assets/Produits/dino-produits.jpg";
import oursson from "../../assets/Produits/oursson-produits.png"; 
import nuage from "../../assets/Produits/nuage-produits.png"; 


// Composant pour afficher un seul produit
const ProduitCard = ({ image, nom, lien }) => {
  return (
    <div className="produit-card">
      <img src={image} alt={nom} className="produit-image" />
      <h3 className="produit-nom">{nom}</h3>
      <a href={lien} className="produit-btn" >Découvrir</a>
    </div>
  );
};

// Composant principal exporté
export default function ListeProduits() {
  const produits = [
    { image: Just, nom: "Lili la licorne", lien: "/LiliLlaLicorne" },
    { image: loulou, nom: "Loulou le chien", lien: "/Louloulechien" },
    { image: mochi, nom: "Mochi le panda", lien: "/Mochilepanda" },
    { image: dino, nom: "Dino le dinosaure", lien: "/Dinoledinosaure" },
    { image: oursson, nom: "Mon petit ourson", lien: "/Monpetitourson" },
    { image: nuage, nom: "Mon doux nuage", lien: "/Mondouxnuage" },
  ];

  return (
    <div className="liste-produits">
      {produits.map((item, index) => (
        <ProduitCard
          key={index}
          image={item.image}
          nom={item.nom}
          lien={item.lien}
        />
      ))}
    </div>
  );
}
