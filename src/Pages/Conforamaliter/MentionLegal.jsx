import "../../styles/Pages/Conformaliter/MentionLegal.css";

export default function MentionLegal() {
  return (
    <div className="mentions-page">
      <header className="mentions-hero">
        <h1>Mentions légales</h1>
        <p className="mentions-update">En vigueur au {new Date().toLocaleDateString()}</p>
      </header>

      {/* Sommaire */}
      <nav className="mentions-toc" aria-label="Sommaire">
        <ul>
          <li><a href="#editeur">1. L’éditeur</a></li>
          <li><a href="#hebergeur">2. L’hébergeur</a></li>
          <li><a href="#acces">3. Accès au site</a></li>
          <li><a href="#donnees">4. Collecte des données</a></li>
          <li><a href="#propriete">5. Propriété intellectuelle</a></li>
          <li><a href="#cookies">6. Cookies</a></li>
        </ul>
      </nav>

      <main className="mentions-content">
        <section className="mentions-block">
          <p>
            Conformément aux dispositions des Articles 6-III et 19 de la Loi n°2004-575 du
            21 juin 2004 pour la Confiance dans l’économie numérique (L.C.E.N.), il est porté
            à la connaissance des utilisateurs du site <strong>https://vertyno.fr/</strong> les présentes
            mentions légales. La connexion et la navigation sur le Site impliquent l’acceptation
            pleine et entière des présentes.
          </p>
        </section>

        <section id="editeur" className="mentions-block">
          <h2>1. L’éditeur</h2>
          <p>
            L’édition et la direction de la publication du Site sont assurées par
            <strong> Louis Mickael</strong>, domicilié au <strong>39 rue Rousselle, 92800</strong>.
          </p>
          <p>
            Contact : <a className="mentions-link" href="mailto:mickaelouis03@gmail.com">mickaelouis03@gmail.com</a>
          </p>
        </section>

        <section id="hebergeur" className="mentions-block">
          <h2>2. L’hébergeur</h2>
          <p>
            L’hébergeur du Site est la société <strong>IONOS</strong>, dont le siège social est situé
            au <strong>222-224 Boulevard Gustave Flaubert, 63000 Clermont-Ferrand</strong>.
          </p>
          <p className="mentions-contact-inline">
            Téléphone : <a className="mentions-link" href="tel:0444446040">04&nbsp;44&nbsp;44&nbsp;60&nbsp;40</a> &nbsp;–&nbsp;
            Email : <a className="mentions-link" href="mailto:contact@ionos.fr">contact@ionos.fr</a>
          </p>
        </section>

        <section id="acces" className="mentions-block">
          <h2>3. Accès au site</h2>
          <p>
            Le Site est accessible 7j/7 et 24h/24, sauf cas de force majeure, interruption
            programmée ou non, ou nécessité de maintenance. En cas de modification, interruption
            ou suspension du Site, l’Éditeur ne saurait être tenu responsable.
          </p>
        </section>

        <section id="donnees" className="mentions-block">
          <h2>4. Collecte des données</h2>
          <p>
            Le Site assure à l’Utilisateur une collecte et un traitement des informations
            personnelles dans le respect de la vie privée, conformément à la loi n°78-17 du
            6 janvier 1978 et au RGPD. Conformément à ces textes, vous disposez d’un droit
            d’accès, de rectification, de suppression et d’opposition.
          </p>
          <p>
            Exercez vos droits par email à :{" "}
            <a className="mentions-link" href="mailto:mickaelouis03@gmail.com">mickaelouis03@gmail.com</a>{" "}
            ou{" "}
            <a className="mentions-link" href="mailto:contact@vertyno.com">contact@vertyno.com</a>.
          </p>
          <p>
            Toute utilisation, reproduction, diffusion, commercialisation ou modification de tout
            ou partie du Site sans autorisation est prohibée et pourra donner lieu à des poursuites.
          </p>
        </section>

        <section id="propriete" className="mentions-block">
          <h2>5. Propriété intellectuelle</h2>
          <p>
            Tous les contenus (textes, images, logos, vidéos, etc.) sont protégés par le droit
            d’auteur et sont la propriété exclusive de <strong>VERTYNO</strong>, sauf mention contraire.
            Toute reproduction sans autorisation est interdite.
          </p>
        </section>

        <section id="cookies" className="mentions-block">
          <h2>6. Cookies</h2>
          <p>
            Le Site utilise des cookies à des fins statistiques et d’amélioration de l’expérience
            utilisateur. Vous pouvez paramétrer ou refuser les cookies via les réglages de votre
            navigateur.
          </p>
        </section>
      </main>
    </div>
  );
}
