import "../../styles/Pages/Conformaliter/ConditionsUtilisation.css";

export default function ConditionsUtilisation() {
  return (
    <div className="terms-page">
      <header className="terms-hero">
        <h1>Conditions d'utilisation</h1>
        <p className="terms-update">En vigueur au {new Date().toLocaleDateString()}</p>
      </header>

      {/* Sommaire */}
      <nav className="terms-toc" aria-label="Sommaire">
        <ul>
          <li><a href="#identite">1. Identité de l'éditeur</a></li>
          <li><a href="#champ">2. Champ d'application</a></li>
          <li><a href="#produits">3. Produits</a></li>
          <li><a href="#commandes">4. Commandes</a></li>
          <li><a href="#prix">5. Prix & Paiement</a></li>
          <li><a href="#livraison">6. Livraison</a></li>
          <li><a href="#annulation">7. Annulation de commande</a></li>
          <li><a href="#retractation">8. Droit de rétractation</a></li>
          <li><a href="#defectueux">9. Produits défectueux ou non conformes</a></li>
          <li><a href="#responsabilite">10. Responsabilité</a></li>
          <li><a href="#donnees">11. Données personnelles</a></li>
          <li><a href="#propriete">12. Propriété intellectuelle</a></li>
          <li><a href="#mediation">13. Médiation de la consommation</a></li>
          <li><a href="#droit">14. Droit applicable</a></li>
          <li><a href="#contact">15. Contact</a></li>
        </ul>
      </nav>

      <main className="terms-content">
        <section id="identite" className="terms-block">
          <h2>ARTICLE 1 – IDENTITÉ DE L'ÉDITEUR</h2>
          <p>
            Le présent site est édité par :
          </p>
          <ul>
            <li><strong>Dénomination sociale :</strong> VERTYNO</li>
            <li><strong>Forme juridique :</strong> SASU</li>
            <li><strong>Capital social :</strong> 10 000 €</li>
            <li><strong>RCS :</strong> Bobigny 927 887 489</li>
            <li><strong>Siège social :</strong> 9 Allée Gabriel Zirnhelt, 93110 Rosny-sous-Bois, France</li>
            <li><strong>Président :</strong> Belkhoudja Abesse</li>
            <li><strong>Email :</strong> <a href="mailto:contact@vertyno.com" className="terms-link">contact@vertyno.com</a></li>
            <li><strong>Téléphone :</strong> 06 67 56 13 29</li>
            <li><strong>TVA intracommunautaire :</strong> FR32927887489</li>
            <li><strong>Code APE :</strong> 4690Z</li>
          </ul>
          <p>
            <strong>Directeur de la publication :</strong> le Président de la société.
          </p>
          <p><strong>Hébergement :</strong></p>
          <p>
            Le site est hébergé par <strong>Shopify Inc.</strong><br />
            Le nom de domaine est géré par <strong>IONOS</strong>.
          </p>
        </section>

        <section id="champ" className="terms-block">
          <h2>ARTICLE 2 – CHAMP D'APPLICATION</h2>
          <p>
            Les présentes Conditions Générales de Vente et d'Utilisation (CGV/CGU) s'appliquent à toute navigation sur le site et à toute commande passée auprès de VERTYNO.
          </p>
          <p>
            Toute commande implique l'acceptation <strong>pleine et entière</strong> des présentes CGV, sans réserve.
          </p>
        </section>

        <section id="produits" className="terms-block">
          <h2>ARTICLE 3 – PRODUITS</h2>
          <p>
            Les produits proposés sont décrits avec la plus grande exactitude possible.
          </p>
          <p>
            Toutefois, des variations minimes (couleur, rendu écran) peuvent exister sans engager la responsabilité de VERTYNO.
          </p>
          <p>
            Les produits sont proposés <strong>dans la limite des stocks disponibles</strong>.
          </p>
        </section>

        <section id="commandes" className="terms-block">
          <h2>ARTICLE 4 – COMMANDES</h2>
          <p>
            VERTYNO se réserve le droit de refuser ou d'annuler toute commande présentant un caractère anormal, frauduleux ou suspect (commande en volume inhabituel, incohérence d'adresse, litige antérieur, etc.).
          </p>
          <p>
            Les ventes aux <strong>professionnels (B2B)</strong> sont possibles uniquement <strong>sur demande préalable par contact direct</strong>.
          </p>
        </section>

        <section id="prix" className="terms-block">
          <h2>ARTICLE 5 – PRIX & PAIEMENT</h2>
          <p>
            Les prix sont exprimés en <strong>euros (€), toutes taxes comprises</strong>.
          </p>
          <p>
            VERTYNO accepte les moyens de paiement suivants :
          </p>
          <ul>
            <li>Carte bancaire</li>
            <li>Apple Pay</li>
            <li>PayPal</li>
            <li>Klarna</li>
          </ul>
          <p>
            Les factures sont transmises <strong>automatiquement par email</strong> après validation de la commande.
          </p>
          <p>
            VERTYNO se réserve le droit de modifier ses prix à tout moment, sans effet rétroactif sur les commandes déjà validées.
          </p>
        </section>

        <section id="livraison" className="terms-block">
          <h2>ARTICLE 6 – LIVRAISON</h2>
          <p><strong>Zones de livraison</strong></p>
          <p>
            VERTYNO livre :
          </p>
          <ul>
            <li>en <strong>France métropolitaine</strong>,</li>
            <li>dans <strong>l'ensemble des pays de l'Union européenne</strong>, sans exception.</li>
          </ul>
          <p><strong>Modes de livraison</strong></p>
          <ul>
            <li>Livraison à domicile</li>
            <li>Livraison en point relais</li>
            <li>Livraison express (selon options proposées)</li>
          </ul>
          <p>
            👉 <strong>Livraison gratuite en point relais Chronopost Shop2Shop</strong>, lorsque cette option est disponible.
          </p>
          <p><strong>Délais</strong></p>
          <ul>
            <li>Traitement de commande : 1 à 2 jours ouvrés</li>
            <li>Livraison : 2 à 5 jours ouvrés selon le transporteur</li>
            <li>Délai total estimé : 3 à 7 jours ouvrés</li>
          </ul>
          <p>
            Ces délais sont indicatifs et peuvent être prolongés en cas de circonstances indépendantes de notre volonté.
          </p>
        </section>

        <section id="annulation" className="terms-block">
          <h2>ARTICLE 7 – ANNULATION DE COMMANDE</h2>
          <p>
            Une commande peut être annulée <strong>avant expédition</strong>, idéalement dans un délai maximum de <strong>12 heures</strong> après validation.
          </p>
          <p>
            Une fois la commande expédiée, aucune annulation n'est possible.
          </p>
          <p>
            Le client devra alors se référer à la <a href="/PolitiqueRetoursRemboursements" className="terms-link">politique de retours et remboursements</a>.
          </p>
        </section>

        <section id="retractation" className="terms-block">
          <h2>ARTICLE 8 – DROIT DE RÉTRACTATION</h2>
          <p>
            Conformément aux articles L221-18 et suivants du Code de la consommation, le client dispose d'un délai de <strong>14 jours calendaires</strong> à compter de la réception du produit pour exercer son droit de rétractation, sans avoir à justifier de motif.
          </p>
          <p>
            Les <strong>frais de retour sont à la charge du client</strong>.
          </p>
          <p>
            Le produit doit être retourné :
          </p>
          <ul>
            <li>neuf,</li>
            <li>non utilisé,</li>
            <li>non endommagé,</li>
            <li>dans son emballage d'origine.</li>
          </ul>
          <p>
            Tout produit ne respectant pas ces conditions pourra faire l'objet d'un <strong>refus de remboursement</strong>.
          </p>
          <p>
            Les modalités détaillées figurent dans la <a href="/PolitiqueRetoursRemboursements" className="terms-link">politique de retours et remboursements</a>.
          </p>
        </section>

        <section id="defectueux" className="terms-block">
          <h2>ARTICLE 9 – PRODUITS DÉFECTUEUX OU NON CONFORMES</h2>
          <p>
            Toute anomalie (produit défectueux, endommagé, manquant ou incorrect) doit être signalée <strong>dans un délai strict de 48 heures</strong> après réception, accompagnée de photos justificatives.
          </p>
          <p>
            Passé ce délai, aucune réclamation ne pourra être prise en compte.
          </p>
        </section>

        <section id="responsabilite" className="terms-block">
          <h2>ARTICLE 10 – RESPONSABILITÉ</h2>
          <p>
            VERTYNO ne saurait être tenu responsable :
          </p>
          <ul>
            <li>des retards imputables aux transporteurs,</li>
            <li>des erreurs d'adresse fournies par le client,</li>
            <li>de l'utilisation inappropriée des produits.</li>
          </ul>
          <p>
            La responsabilité de VERTYNO est en tout état de cause <strong>limitée au montant de la commande</strong>.
          </p>
        </section>

        <section id="donnees" className="terms-block">
          <h2>ARTICLE 11 – DONNÉES PERSONNELLES</h2>
          <p>
            Les données personnelles sont traitées conformément à la <a href="/PolitiqueConfidentialite" className="terms-link">politique de confidentialité</a> du site et à la réglementation RGPD en vigueur.
          </p>
        </section>

        <section id="propriete" className="terms-block">
          <h2>ARTICLE 12 – PROPRIÉTÉ INTELLECTUELLE</h2>
          <p>
            Tous les contenus du site (textes, images, logos, visuels) sont la propriété exclusive de VERTYNO.
          </p>
          <p>
            Toute reproduction, totale ou partielle, est strictement interdite sans autorisation écrite.
          </p>
        </section>

        <section id="mediation" className="terms-block">
          <h2>ARTICLE 13 – MÉDIATION DE LA CONSOMMATION</h2>
          <p>
            Conformément aux articles L612-1 et suivants du Code de la consommation, le client peut recourir à un médiateur de la consommation en cas de litige non résolu.
          </p>
          <p>
            👉 <strong>Médiateur à désigner avant mise en ligne</strong> (obligatoire).
          </p>
        </section>

        <section id="droit" className="terms-block">
          <h2>ARTICLE 14 – DROIT APPLICABLE</h2>
          <p>
            Les présentes CGV sont soumises au <strong>droit français</strong>.
          </p>
          <p>
            Tout litige sera soumis aux juridictions compétentes françaises.
          </p>
        </section>

        <section id="contact" className="terms-block">
          <h2>ARTICLE 15 – CONTACT</h2>
          <p>
            <strong>Service client :</strong>
          </p>
          <p>
            📧 <a href="mailto:contact@vertyno.com" className="terms-link">contact@vertyno.com</a><br />
            📞 06 67 56 13 29<br />
            🕘 Du lundi au vendredi, horaires de bureau
          </p>
        </section>
      </main>
    </div>
  );
}
