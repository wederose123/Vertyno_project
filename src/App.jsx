import { Routes, Route } from "react-router-dom";
import Homes from './Pages/Homes';
import LiliLlaLicorne from './Pages/Produits/Veilleuses/LiliLlaLicorne';
import Louloulechien from './Pages/Produits/Veilleuses/Louloulechien';
import Mochilepanda from './Pages/Produits/Veilleuses/Mochilepanda';
import Dinoledinosaure from './Pages/Produits/Veilleuses/Dinoledinosaure';
import Mondouxnuage from './Pages/Produits/Assiettes/Mondouxnuage';
import Monpetitourson from './Pages/Produits/Assiettes/Monpetitourson';
import Contact from './Pages/Contact/Contact';
import MentionLegal from "./Pages/Conforamaliter/MentionLegal";
import CGV from "./Pages/Conforamaliter/CGV";
import PolitiqueConfidentialite from "./Pages/Conforamaliter/PolitiqueConfidentialite";
import './App.css';
import Header from "./Composants/Header/Header";
import Footer from "./Composants/Footer/Footer";


function App() {
  return (
     <div>
      <Header />
      <Routes>
        <Route path="/" element={<Homes />} />
        <Route path="/LiliLlaLicorne" element={<LiliLlaLicorne />} />
         <Route path="/Louloulechien" element={<Louloulechien />} />
         <Route path="/Mochilepanda" element={<Mochilepanda />} />
         <Route path="/Dinoledinosaure" element={<Dinoledinosaure />} />
         <Route path="/Contact" element={<Contact />} />
         <Route path="/Mondouxnuage" element={<Mondouxnuage />} />
         <Route path="/Monpetitourson" element={<Monpetitourson />} />
          <Route path="/CGV" element={<CGV />} />
          <Route path="/MentionLegal" element={<MentionLegal />} />
          <Route path="/PolitiqueConfidentialite" element={<PolitiqueConfidentialite />} />
      </Routes>
      <Footer/>
    </div>
  );
}

export default App;
