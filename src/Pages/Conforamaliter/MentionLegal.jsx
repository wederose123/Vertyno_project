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
          <li><a href="#presentation">1. Présentation de l'entreprise</a></li>
          <li><a href="#hebergeur">2. Hébergeur du site</a></li>
          <li><a href="#contact">3. Nous contacter</a></li>
        </ul>
      </nav>

      <main className="mentions-content">
        <section id="presentation" className="mentions-block">
          <h2>1. Présentation de l'entreprise</h2>
          <ul>
            <li><strong>Raison sociale :</strong> VERTYNO</li>
            <li><strong>Forme juridique :</strong> SASU (Société par Actions Simplifiée Unipersonnelle)</li>
            <li><strong>Capital social :</strong> 10 000 €</li>
            <li><strong>Adresse du siège social :</strong><br />
            9 Allée Gabriel Zirnhelt, 93110 Rosny-sous-Bois, France</li>
            <li><strong>Téléphone :</strong> +33 6 67 56 13 29</li>
            <li><strong>Adresse e-mail :</strong> <a className="mentions-link" href="mailto:contact@vertyno.com">contact@vertyno.com</a></li>
            <li><strong>Numéro de TVA intracommunautaire :</strong> FR32 927 887 489</li>
            <li><strong>Numéro de SIREN :</strong> 927 887 489</li>
            <li><strong>Numéro de SIRET :</strong> 927 887 489 00015</li>
            <li><strong>Code NAF / APE :</strong> 4690Z</li>
            <li><strong>Domaine d'activité :</strong> Commerce de produits pour enfants et bébés</li>
            <li><strong>Forme d'exercice :</strong> Vente en ligne (e-commerce) – B2C et B2B sur demande</li>
          </ul>
          <p>
            <strong>RCS :</strong> Bobigny 927 887 489<br />
            <strong>Président :</strong> Belkhoudja Abesse<br />
            <strong>Directeur de la publication :</strong> Belkhoudja Abesse
          </p>
        </section>

        <section id="hebergeur" className="mentions-block">
          <h2>2. Hébergeur du site</h2>
          <ul>
            <li><strong>Hébergeur :</strong> IONOS by 1&1</li>
            <li><strong>Raison sociale :</strong> IONOS SE</li>
            <li><strong>Adresse :</strong><br />
            Elgendorfer Straße 57<br />
            56410 Montabaur<br />
            Allemagne</li>
            <li><strong>Téléphone :</strong> +49 721 170 5522</li>
            <li><strong>Site web :</strong> <a className="mentions-link" href="https://www.ionos.fr" target="_blank" rel="noopener noreferrer">https://www.ionos.fr</a></li>
          </ul>
          <p>
            Le site utilise la plateforme <strong>Shopify</strong> pour la gestion de la boutique en ligne (solution e-commerce).
          </p>
        </section>

        <section id="contact" className="mentions-block">
          <h2>3. Nous contacter</h2>
          <p>
            Nous répondons à toutes les demandes <strong>dans un délai de 24 heures ouvrées</strong>.
          </p>
          <ul>
            <li><strong>Nom commercial :</strong> VERTYNO</li>
            <li><strong>Forme juridique :</strong> SASU</li>
            <li><strong>Numéro de téléphone :</strong> +33 6 67 56 13 29</li>
            <li><strong>Adresse e-mail :</strong> <a className="mentions-link" href="mailto:contact@vertyno.com">contact@vertyno.com</a></li>
            <li><strong>Adresse physique :</strong><br />
            9 Allée Gabriel Zirnhelt, 93110 Rosny-sous-Bois, France</li>
            <li><strong>SIREN :</strong> 927 887 489</li>
            <li><strong>SIRET :</strong> 927 887 489 00015</li>
            <li><strong>Numéro de TVA intracommunautaire :</strong> FR32 927 887 489</li>
            <li><strong>Code NAF / APE :</strong> 4690Z</li>
            <li><strong>Forme d'exercice :</strong> Vente en ligne</li>
            <li><strong>Domaine d'activité :</strong> Produits pour enfants et bébés</li>
          </ul>
          <p>
            <strong>Heures du service client :</strong><br />
            Du lundi au vendredi, de 8h à 18h<br />
            Fermé les samedis, dimanches et jours fériés
          </p>
        </section>
      </main>
    </div>
  );
}
