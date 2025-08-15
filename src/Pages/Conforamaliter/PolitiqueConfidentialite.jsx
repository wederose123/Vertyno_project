import "../../styles/Pages/Conformaliter/PolitiqueConfidentialite.css";

export default function PolitiqueConfidentialite() {
  return (
    <div className="privacy-page">
      <header className="privacy-hero">
        <h1>Politique de confidentialité</h1>
        <p className="privacy-update">En vigueur au {new Date().toLocaleDateString()}</p>
      </header>

      {/* Sommaire */}
      <nav className="privacy-toc" aria-label="Sommaire">
        <ul>
          <li><a href="#scope">1. Objet et champ d’application</a></li>
          <li><a href="#data">2. Données que nous collectons</a></li>
          <li><a href="#purposes">3. Finalités & bases légales</a></li>
          <li><a href="#cookies">4. Cookies & traceurs</a></li>
          <li><a href="#third">5. Destinataires & sous-traitants</a></li>
          <li><a href="#retention">6. Durées de conservation</a></li>
          <li><a href="#rights">7. Vos droits (RGPD)</a></li>
          <li><a href="#security">8. Sécurité</a></li>
          <li><a href="#transfer">9. Transferts hors UE</a></li>
          <li><a href="#contact">10. Contact</a></li>
          <li><a href="#changes">11. Mises à jour</a></li>
        </ul>
      </nav>

      <main className="privacy-content">
        <section id="scope" className="privacy-block">
          <h2>1. Objet et champ d’application</h2>
          <p>
            La présente politique explique comment <strong>VERTYNO</strong> collecte, utilise et protège vos
            données personnelles lors de votre navigation sur <strong>https://vertyno.fr/</strong>, de vos
            achats (sur notre site et/ou plateformes partenaires), et de vos interactions (formulaire de
            contact, newsletter, réseaux sociaux).
          </p>
        </section>

        <section id="data" className="privacy-block">
          <h2>2. Données que nous collectons</h2>
          <ul className="privacy-list">
            <li><strong>Données d’identification :</strong> nom, prénom, email, éventuellement adresse postale et téléphone.</li>
            <li><strong>Données de commande :</strong> produits achetés, adresse de livraison/facturation, historique.</li>
            <li><strong>Données de paiement :</strong> traitées de façon sécurisée par nos prestataires (nous n’y avons pas accès en clair).</li>
            <li><strong>Données techniques :</strong> logs, adresse IP, navigateur, pages consultées (via cookies/analytics).</li>
            <li><strong>Newsletter :</strong> adresse email et préférences éventuelles.</li>
          </ul>
        </section>

        <section id="purposes" className="privacy-block">
          <h2>3. Finalités & bases légales</h2>
          <ul className="privacy-list">
            <li><strong>Traitement des commandes</strong> (exécution du contrat) : achat, livraison, service client.</li>
            <li><strong>Newsletter & offres</strong> (consentement) : envoi après votre inscription volontaire.</li>
            <li><strong>Contact/Support</strong> (intérêt légitime / mesures précontractuelles) : répondre à vos demandes.</li>
            <li><strong>Amélioration du site & statistiques</strong> (intérêt légitime / consentement cookies).</li>
            <li><strong>Obligations légales</strong> : comptabilité, lutte contre la fraude, garanties.</li>
          </ul>
        </section>

        <section id="cookies" className="privacy-block">
          <h2>4. Cookies & traceurs</h2>
          <p>
            Nous utilisons des cookies nécessaires au fonctionnement du site et, sous réserve de votre
            consentement, des cookies de mesure d’audience et/ou marketing. Vous pouvez à tout moment
            paramétrer votre navigateur pour accepter, refuser ou supprimer les cookies.
          </p>
        </section>

        <section id="third" className="privacy-block">
          <h2>5. Destinataires & sous-traitants</h2>
          <p>
            Vos données peuvent être traitées par des prestataires de confiance (hébergeur, solution
            emailing/newsletter, paiement, logistique) strictement pour les finalités décrites et dans le respect
            du RGPD. Nous ne vendons pas vos données.
          </p>
        </section>

        <section id="retention" className="privacy-block">
          <h2>6. Durées de conservation</h2>
          <ul className="privacy-list">
            <li><strong>Compte & commandes :</strong> durée de la relation, puis archives légales (généralement 5 à 10 ans selon obligation).</li>
            <li><strong>Newsletter :</strong> jusqu’au désabonnement ou 3 ans après le dernier contact.</li>
            <li><strong>Logs & analytics :</strong> durée proportionnée (souvent 13 mois pour les cookies de mesure d’audience).</li>
            <li><strong>Support :</strong> le temps de traiter la demande puis une durée limitée d’archive.</li>
          </ul>
        </section>

        <section id="rights" className="privacy-block">
          <h2>7. Vos droits (RGPD)</h2>
          <p>
            Vous disposez des droits d’<strong>accès</strong>, <strong>rectification</strong>, <strong>effacement</strong>, de
            <strong> limitation</strong>, d’<strong>opposition</strong>, et du droit à la <strong>portabilité</strong> de vos données.
            Vous pouvez aussi définir des directives post-mortem. Pour exercer vos droits :
          </p>
          <p className="privacy-contact-inline">
            Email : <a className="privacy-link" href="mailto:contact@vertyno.com">contact@vertyno.com</a> ou{" "}
            <a className="privacy-link" href="mailto:mickaelouis03@gmail.com">mickaelouis03@gmail.com</a>
          </p>
          <p>
            Vous avez le droit d’introduire une réclamation auprès de la <strong>CNIL</strong> si vous estimez que vos
            droits ne sont pas respectés.
          </p>
        </section>

        <section id="security" className="privacy-block">
          <h2>8. Sécurité</h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles adaptées pour protéger vos
            données (contrôles d’accès, chiffrement côté prestataires de paiement, sauvegardes, etc.).
          </p>
        </section>

        <section id="transfer" className="privacy-block">
          <h2>9. Transferts hors Union européenne</h2>
          <p>
            Si certains prestataires traitent des données en dehors de l’UE, ces transferts sont encadrés par
            des mécanismes légaux adéquats (clauses contractuelles types, décision d’adéquation, etc.).
          </p>
        </section>

        <section id="contact" className="privacy-block">
          <h2>10. Contact</h2>
          <p>
            Pour toute question relative à cette politique ou à vos données :{" "}
            <a className="privacy-link" href="mailto:contact@vertyno.com">contact@vertyno.com</a>.
          </p>
        </section>

        <section id="changes" className="privacy-block">
          <h2>11. Mises à jour</h2>
          <p>
            La présente politique peut évoluer. Toute modification substantielle sera signalée sur cette page
            et, le cas échéant, par email si vous êtes inscrit à la newsletter.
          </p>
        </section>
      </main>
    </div>
  );
}
