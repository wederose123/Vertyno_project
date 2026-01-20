import "../../styles/Pages/Conformaliter/PolitiqueRGPD.css";

export default function PolitiqueRGPD() {
  return (
    <div className="rgpd-page">
      <header className="rgpd-hero">
        <h1>Politique RGPD</h1>
        <p className="rgpd-update">Dernière mise à jour : 05/01/2026</p>
      </header>

      {/* Sommaire */}
      <nav className="rgpd-toc" aria-label="Sommaire">
        <ul>
          <li><a href="#responsable">1. Responsable du traitement</a></li>
          <li><a href="#donnees">2. Données personnelles collectées</a></li>
          <li><a href="#finalites">3. Finalités du traitement</a></li>
          <li><a href="#base">4. Base légale du traitement</a></li>
          <li><a href="#duree">5. Durée de conservation</a></li>
          <li><a href="#droits">6. Droits des utilisateurs</a></li>
          <li><a href="#securite">7. Sécurité des données</a></li>
          <li><a href="#transfert">8. Transfert de données</a></li>
          <li><a href="#cookies">9. Cookies</a></li>
          <li><a href="#modification">10. Modification de la politique</a></li>
          <li><a href="#contact">11. Contact</a></li>
        </ul>
      </nav>

      <main className="rgpd-content">
        <section className="rgpd-intro rgpd-block">
          <p>
            Chez <strong>VERTYNO</strong>, nous accordons une importance particulière à la protection de vos données personnelles et nous nous engageons à respecter la réglementation en vigueur, notamment le <strong>Règlement Général sur la Protection des Données (RGPD – UE 2016/679)</strong>.
          </p>
          <p>
            La présente politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles lorsque vous utilisez notre site.
          </p>
        </section>

        <section id="responsable" className="rgpd-block">
          <h2>1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données personnelles est :
          </p>
          <p>
            <strong>VERTYNO – SASU</strong><br />
            9 Allée Gabriel Zirnhelt, 93110 Rosny-sous-Bois, France<br />
            📧 <a href="mailto:contact@vertyno.com" className="rgpd-link">contact@vertyno.com</a><br />
            📞 +33 6 67 56 13 29
          </p>
        </section>

        <section id="donnees" className="rgpd-block">
          <h2>2. Données personnelles collectées</h2>
          <p>
            Nous collectons uniquement les données strictement nécessaires à nos activités.
          </p>
          <p><strong>Données collectées :</strong></p>
          <ul>
            <li><strong>Données d'identification</strong> : nom, prénom</li>
            <li><strong>Données de contact</strong> : adresse e-mail, numéro de téléphone</li>
            <li><strong>Données de livraison et de facturation</strong> : adresse postale</li>
            <li><strong>Données de paiement</strong> : traitées exclusivement par des prestataires de paiement sécurisés (VERTYNO ne stocke aucune donnée bancaire)</li>
            <li><strong>Données de navigation</strong> : adresse IP, cookies, données de connexion et d'utilisation du site</li>
          </ul>
        </section>

        <section id="finalites" className="rgpd-block">
          <h2>3. Finalités du traitement</h2>
          <p>
            Vos données personnelles sont collectées pour les finalités suivantes :
          </p>
          <ul>
            <li>gestion et traitement des commandes,</li>
            <li>communication relative à l'état de vos commandes,</li>
            <li>gestion du service client,</li>
            <li>amélioration du site et de l'expérience utilisateur,</li>
            <li>envoi de communications commerciales (uniquement si vous y avez consenti).</li>
          </ul>
        </section>

        <section id="base" className="rgpd-block">
          <h2>4. Base légale du traitement</h2>
          <p>
            Les traitements de données effectués par VERTYNO reposent sur :
          </p>
          <ul>
            <li>l'<strong>exécution d'un contrat</strong> (gestion des commandes),</li>
            <li>le <strong>consentement</strong> (newsletter, offres promotionnelles),</li>
            <li>l'<strong>intérêt légitime</strong> (sécurité du site, amélioration des services),</li>
            <li>les <strong>obligations légales</strong> applicables.</li>
          </ul>
        </section>

        <section id="duree" className="rgpd-block">
          <h2>5. Durée de conservation</h2>
          <p>
            Les données personnelles sont conservées :
          </p>
          <ul>
            <li>pendant la durée nécessaire à l'exécution du contrat,</li>
            <li>puis archivées selon les obligations légales en vigueur,</li>
            <li>ou supprimées sur demande lorsque cela est juridiquement possible.</li>
          </ul>
        </section>

        <section id="droits" className="rgpd-block">
          <h2>6. Droits des utilisateurs</h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul>
            <li>droit d'accès à vos données,</li>
            <li>droit de rectification,</li>
            <li>droit à l'effacement (droit à l'oubli),</li>
            <li>droit à la limitation du traitement,</li>
            <li>droit à la portabilité,</li>
            <li>droit d'opposition aux communications commerciales,</li>
            <li>droit de retrait du consentement à tout moment.</li>
          </ul>
          <p>
            Vous pouvez exercer vos droits en contactant :
          </p>
          <p>
            📧 <a href="mailto:contact@vertyno.com" className="rgpd-link">contact@vertyno.com</a>
          </p>
        </section>

        <section id="securite" className="rgpd-block">
          <h2>7. Sécurité des données</h2>
          <p>
            VERTYNO met en œuvre des mesures techniques et organisationnelles appropriées afin de garantir la sécurité et la confidentialité de vos données personnelles et d'éviter tout accès non autorisé, perte ou divulgation.
          </p>
        </section>

        <section id="transfert" className="rgpd-block">
          <h2>8. Transfert de données</h2>
          <p>
            Certaines données peuvent être traitées en dehors de l'Union européenne, notamment via des prestataires techniques (ex. plateforme e-commerce ou paiement).
          </p>
          <p>
            Dans ce cas, des <strong>garanties appropriées</strong> sont mises en place (clauses contractuelles types, conformité RGPD des prestataires).
          </p>
        </section>

        <section id="cookies" className="rgpd-block">
          <h2>9. Cookies</h2>
          <p>
            Le site utilise des cookies nécessaires à son bon fonctionnement et à l'amélioration de l'expérience utilisateur.
          </p>
          <p>
            Vous pouvez gérer vos préférences :
          </p>
          <ul>
            <li>via la bannière de consentement lors de votre première visite,</li>
            <li>ou via les paramètres de votre navigateur.</li>
          </ul>
        </section>

        <section id="modification" className="rgpd-block">
          <h2>10. Modification de la politique</h2>
          <p>
            VERTYNO se réserve le droit de modifier la présente politique de confidentialité à tout moment.
          </p>
          <p>
            La version applicable est celle publiée sur le site à la date de consultation.
          </p>
        </section>

        <section id="contact" className="rgpd-block">
          <h2>11. Contact</h2>
          <p>
            Nous répondons à toutes les demandes <strong>dans un délai de 24 heures ouvrées</strong>.
          </p>
          <p>
            <strong>VERTYNO – SASU</strong>
          </p>
          <p>
            📍 9 Allée Gabriel Zirnhelt, 93110 Rosny-sous-Bois<br />
            📧 <a href="mailto:contact@vertyno.com" className="rgpd-link">contact@vertyno.com</a><br />
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
