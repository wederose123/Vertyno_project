import React, { useEffect, useState } from 'react';
import '../../styles/Header/header.css';
import logoHeader from '../../assets/logo-entier.png';
import { Link } from 'react-router-dom';


const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isMobile = window.innerWidth <= 768;

  const renderCategoryContent = () => {
  if (selectedCategory === 'Veilleuses') {
    return (
      <div className="category-products">
        <a href={"/LiliLlaLicorne"}>Lili la Licorne</a>
        <a href={"/Louloulechien"}>Loulou le chien</a>
        <a href={"/Mochilepanda"}>Mochi le panda</a>
        <a href={"/Dinoledinosaure"}>Dino le Dinosaure</a>
      </div>
    );
  } else if (selectedCategory === 'Assiettes') {
    return (
      <div className="category-products">
        <a href={"/Mondouxnuage"}>Mon doux nuage</a>
        <a href={"/Monpetitourson"}>Mon petit oursson</a>
      </div>
    );
  } else {
    return (
      <div className="category-list">
        <button onClick={() => setSelectedCategory('Veilleuses')}>Veilleuses</button>
        <button onClick={() => setSelectedCategory('Assiettes')}>Assiettes</button>
      </div>
    );
  }
};

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-content">
          <div className="logo">
            <Link to="/">
  <img src={logoHeader} alt="Logo" />
</Link>
          </div>

          <nav className="nav-links">
            <button className="link-button" onClick={() => setSideMenuOpen(true)}>PRODUITS</button>
            <a href={"/Contact"}>CONTACT</a>
          </nav>

          <div className="burger" onClick={() => setMenuOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </header>

      {/* Menu mobile fullscreen */}
      {menuOpen && (
        <div className="mobile-menu">
          <button className="close-btn" onClick={() => setMenuOpen(false)}>×</button>
          <button
            className="mobile-link"
            onClick={() => {
              setMenuOpen(false);
              setSideMenuOpen(true);
            }}
          >
            PRODUITS
          </button>
          <a href="/Contact" onClick={() => setMenuOpen(false)}>CONTACT</a>
        </div>
      )}

      {/* Side menu produits */}
      {sideMenuOpen && (
        <div className="side-menu">
          <div className="side-menu-header">
            {isMobile && !selectedCategory && (
              <button className="back-btn" onClick={() => {
                setSideMenuOpen(false);
                setMenuOpen(true);
              }}>←</button>
            )}

            {selectedCategory && (
              <button className="back-btn" onClick={() => setSelectedCategory(null)}>←</button>
            )}

            <button className="close-btn" onClick={() => {
              setSideMenuOpen(false);
              setSelectedCategory(null);
            }}>×</button>
          </div>

          <div className="side-menu-content">
            {renderCategoryContent()}
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
