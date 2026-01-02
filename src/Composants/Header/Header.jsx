import React, { useEffect, useState, useRef } from 'react';
import '../../styles/Header/header.css';
import logoHeader from '../../assets/logo-entier.png';
import { Link } from 'react-router-dom';
import { useCartCount } from '../../context/CartContext';


const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { cartCount } = useCartCount();
  const panierButtonRef = useRef(null);

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
        <a href={"/Monpetitourson"}>Mon petit ourson</a>
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
            <a href={"/Panier"} ref={panierButtonRef} id="panier-button" className="panier-link">
              PANIER
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </a>
            <a href={"/Contact"}>CONTACT</a>
          </nav>

          <div className="mobile-header-actions">
            {/* Icône panier pour mobile */}
            <Link to="/Panier" className="mobile-cart-icon" id="panier-button-mobile">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.5C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="white"/>
              </svg>
              {cartCount > 0 && (
                <span className="cart-badge mobile-cart-badge">{cartCount}</span>
              )}
            </Link>
            
            <div className="burger" onClick={() => setMenuOpen(true)}>
              <span></span>
              <span></span>
              <span></span>
            </div>
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
          <Link 
            to="/Panier" 
            className="mobile-link panier-mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            PANIER
            {cartCount > 0 && (
              <span className="cart-badge mobile-menu-badge">{cartCount}</span>
            )}
          </Link>
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



