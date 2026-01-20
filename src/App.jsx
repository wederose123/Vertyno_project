import { Routes, Route } from "react-router-dom";
import Homes from './Pages/Homes';
import LiliLlaLicorne from './Pages/Produits/Veilleuses/LiliLlaLicorne';
import LiliLlaLicorneExemple from './Pages/Produits/Veilleuses/LiliLlaLicorneExemple';
import Louloulechien from './Pages/Produits/Veilleuses/Louloulechien';
import Mochilepanda from './Pages/Produits/Veilleuses/Mochilepanda';
import Dinoledinosaure from './Pages/Produits/Veilleuses/Dinoledinosaure';
import Mondouxnuage from './Pages/Produits/Assiettes/Mondouxnuage';
import Monpetitourson from './Pages/Produits/Assiettes/Monpetitourson';
import Contact from './Pages/Contact/Contact';
import MentionLegal from "./Pages/Conforamaliter/MentionLegal";
import CGV from "./Pages/Conforamaliter/CGV";
import PolitiqueConfidentialite from "./Pages/Conforamaliter/PolitiqueConfidentialite";
import PolitiqueRGPD from "./Pages/Conforamaliter/PolitiqueRGPD";
import NePasVendreDonnees from "./Pages/Conforamaliter/NePasVendreDonnees";
import PolitiqueRetoursRemboursements from "./Pages/Conforamaliter/PolitiqueRetoursRemboursements";
import PolitiqueLivraison from "./Pages/Conforamaliter/PolitiqueLivraison";
import PolitiquePaiement from "./Pages/Conforamaliter/PolitiquePaiement";
import ConditionsUtilisation from "./Pages/Conforamaliter/ConditionsUtilisation";
import ConditionsVentes from "./Pages/Conforamaliter/ConditionsVentes";
import RetourRemboursement from "./Pages/Service_Client/RetourRemboursement";
import Panier from "./Pages/Panier/Panier";
import './App.css';
import Header from "./Composants/Header/Header";
import Footer from "./Composants/Footer/Footer";
import { CartProvider } from "./context/CartContext";


function App() {
  return (
    <CartProvider>
     <div>
      <Header />
      <Routes>
        <Route path="/" element={<Homes />} />
        <Route path="/LiliLlaLicorne" element={<LiliLlaLicorne />} />
        <Route path="/LiliLlaLicorneExemple" element={<LiliLlaLicorneExemple />} />
         <Route path="/Louloulechien" element={<Louloulechien />} />
         <Route path="/Mochilepanda" element={<Mochilepanda />} />
         <Route path="/Dinoledinosaure" element={<Dinoledinosaure />} />
         <Route path="/Contact" element={<Contact />} />
         <Route path="/Mondouxnuage" element={<Mondouxnuage />} />
         <Route path="/Monpetitourson" element={<Monpetitourson />} />
          <Route path="/CGV" element={<CGV />} />
          <Route path="/MentionLegal" element={<MentionLegal />} />
          <Route path="/PolitiqueConfidentialite" element={<PolitiqueConfidentialite />} />
          <Route path="/PolitiqueRGPD" element={<PolitiqueRGPD />} />
          <Route path="/NePasVendreDonnees" element={<NePasVendreDonnees />} />
          <Route path="/PolitiqueRetoursRemboursements" element={<PolitiqueRetoursRemboursements />} />
          <Route path="/PolitiqueLivraison" element={<PolitiqueLivraison />} />
          <Route path="/PolitiquePaiement" element={<PolitiquePaiement />} />
          <Route path="/ConditionsUtilisation" element={<ConditionsUtilisation />} />
          <Route path="/ConditionsVentes" element={<ConditionsVentes />} />
          <Route path="/RetourRemboursement" element={<RetourRemboursement />} />
          <Route path="/Panier" element={<Panier />} />
      </Routes>
      <Footer/>
    </div>
    </CartProvider>
  );
}

export default App;
