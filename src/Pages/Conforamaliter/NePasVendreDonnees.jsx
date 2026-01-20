import "../../styles/Pages/Conformaliter/NePasVendreDonnees.css";

export default function NePasVendreDonnees() {
  return (
    <div className="no-sell-page">
      <header className="no-sell-hero">
        <h1>NE PAS VENDRE OU PARTAGER MES DONNÉES</h1>
        <p className="no-sell-subtitle">VERTYNO</p>
        <p className="no-sell-update">En vigueur au {new Date().toLocaleDateString()}</p>
      </header>

      {/* Sommaire */}
      <nav className="no-sell-toc" aria-label="Sommaire">
        <ul>
          <li><a href="#identite">1. Identité de l'entreprise</a></li>
          <li><a href="#engagement">2. Engagement de non-vente des données</a></li>
          <li><a href="#partage">3. Partage strictement encadré des données</a></li>
          <li><a href="#finalites">4. Finalités de l'utilisation des données</a></li>
          <li><a href="#droits">5. Vos droits</a></li>
          <li><a href="#securite">6. Sécurité des données</a></li>
          <li><a href="#modification">7. Modification de la politique</a></li>
          <li><a href="#contact">8. Contact</a></li>
        </ul>
      </nav>

      <main className="no-sell-content">
        <section className="no-sell-intro no-sell-block">
          <p>
            Chez <strong>VERTYNO</strong>, la protection de vos données personnelles est une priorité.
          </p>
          <p>
            La présente politique a pour objectif de vous informer de manière claire et transparente de notre engagement à <strong>ne pas vendre vos données personnelles</strong> et à en <strong>limiter strictement le partage</strong>, conformément au <strong>Règlement Général sur la Protection des Données (RGPD)</strong> et à la loi Informatique et Libertés.
          </p>
        </section>

        <section id="identite" className="no-sell-block">
          <h2>1. Identité de l'entreprise</h2>
          <p>
            <strong>Nom commercial :</strong> VERTYNO<br />
            <strong>Forme juridique :</strong> SASU<br />
            <strong>Adresse :</strong> 9 Allée Gabriel Zirnhelt, 93110 Rosny-sous-Bois, France<br />
            <strong>Email :</strong> <a href="mailto:contact@vertyno.com" className="no-sell-link">contact@vertyno.com</a><br />
            <strong>Téléphone :</strong> +33 6 67 56 13 29<br />
            <strong>SIREN :</strong> 927 887 489<br />
            <strong>SIRET :</strong> 927 887 489 00015<br />
            <strong>TVA intracommunautaire :</strong> FR32 927 887 489<br />
            <strong>Code APE :</strong> 4690Z
          </p>
        </section>

        <section id="engagement" className="no-sell-block">
          <h2>2. Engagement de non-vente des données</h2>
          <p>
            VERTYNO s'engage formellement à <strong>ne jamais vendre vos données personnelles</strong> à des tiers.
          </p>
          <p>
            Cela inclut notamment :
          </p>
          <ul>
            <li>votre nom et prénom,</li>
            <li>votre adresse postale,</li>
            <li>votre adresse e-mail,</li>
            <li>votre numéro de téléphone,</li>
            <li>toute information fournie lors de l'utilisation du site ou d'une commande.</li>
          </ul>
          <p>
            <strong>Aucune donnée personnelle n'est cédée à des fins commerciales</strong>.
          </p>
        </section>

        <section id="partage" className="no-sell-block">
          <h2>3. Partage strictement encadré des données</h2>
          <p>
            VERTYNO <strong>ne partage pas vos données personnelles</strong>, sauf dans les cas strictement nécessaires suivants :
          </p>
          <p><strong>a) Prestataires techniques et opérationnels</strong></p>
          <p>
            Certaines données peuvent être transmises à des prestataires agissant <strong>exclusivement pour le compte de VERTYNO</strong>, tels que :
          </p>
          <ul>
            <li>prestataires de paiement (ex. Stripe, PayPal, Apple Pay, Klarna),</li>
            <li>transporteurs et services de livraison,</li>
            <li>prestataires techniques (hébergement, plateforme e-commerce, support).</li>
          </ul>
          <p>
            Ces prestataires sont contractuellement tenus :
          </p>
          <ul>
            <li>de respecter la confidentialité des données,</li>
            <li>de n'utiliser les données que pour la mission confiée,</li>
            <li>de se conformer au RGPD.</li>
          </ul>
          <p><strong>b) Obligations légales</strong></p>
          <p>
            Vos données peuvent être communiquées si la loi l'exige, notamment dans le cadre :
          </p>
          <ul>
            <li>d'une obligation légale ou réglementaire,</li>
            <li>d'une décision judiciaire,</li>
            <li>de la protection des droits, de la sécurité ou de la prévention de la fraude.</li>
          </ul>
        </section>

        <section id="finalites" className="no-sell-block">
          <h2>4. Finalités de l'utilisation des données</h2>
          <p>
            Les données personnelles collectées sont utilisées <strong>uniquement</strong> pour :
          </p>
          <ul>
            <li>la gestion des commandes et livraisons,</li>
            <li>la gestion de votre compte client,</li>
            <li>le service client et le traitement des demandes,</li>
            <li>l'amélioration du site et des services,</li>
            <li>l'envoi de communications commerciales <strong>uniquement avec votre consentement</strong>.</li>
          </ul>
        </section>

        <section id="droits" className="no-sell-block">
          <h2>5. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul>
            <li><strong>Droit d'accès</strong> à vos données personnelles</li>
            <li><strong>Droit de rectification</strong> des données inexactes</li>
            <li><strong>Droit à l'effacement</strong> (dans les conditions prévues par la loi)</li>
            <li><strong>Droit à la limitation</strong> du traitement</li>
            <li><strong>Droit à la portabilité</strong></li>
            <li><strong>Droit d'opposition</strong>, notamment aux communications commerciales</li>
          </ul>
          <p>
            Vous pouvez exercer vos droits à tout moment en nous contactant à :
          </p>
          <p>
            📧 <a href="mailto:contact@vertyno.com" className="no-sell-link">contact@vertyno.com</a>
          </p>
        </section>

        <section id="securite" className="no-sell-block">
          <h2>6. Sécurité des données</h2>
          <p>
            VERTYNO met en œuvre des mesures techniques et organisationnelles appropriées afin de garantir :
          </p>
          <ul>
            <li>la confidentialité,</li>
            <li>l'intégrité,</li>
            <li>et la sécurité de vos données personnelles.</li>
          </ul>
          <p>
            <strong>Aucune donnée bancaire n'est stockée par VERTYNO</strong>.
          </p>
        </section>

        <section id="modification" className="no-sell-block">
          <h2>7. Modification de la politique</h2>
          <p>
            VERTYNO se réserve le droit de modifier la présente politique à tout moment.
          </p>
          <p>
            Toute modification sera publiée sur le site et prendra effet dès sa mise en ligne.
          </p>
          <p>
            Nous vous invitons à consulter régulièrement cette page.
          </p>
        </section>

        <section id="contact" className="no-sell-block">
          <h2>8. Contact</h2>
          <p>
            Nous répondons à toutes les demandes <strong>dans un délai de 24 heures ouvrées</strong>.
          </p>
          <p>
            <strong>VERTYNO – SASU</strong>
          </p>
          <p>
            📍 9 Allée Gabriel Zirnhelt, 93110 Rosny-sous-Bois<br />
            📧 <a href="mailto:contact@vertyno.com" className="no-sell-link">contact@vertyno.com</a><br />
            📞 +33 6 67 56 13 29
          </p>
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
