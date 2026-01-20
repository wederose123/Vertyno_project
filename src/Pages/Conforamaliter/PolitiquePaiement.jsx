import "../../styles/Pages/Conformaliter/PolitiquePaiement.css";

export default function PolitiquePaiement() {
  return (
    <div className="payment-policy-page">
      <header className="payment-policy-hero">
        <h1>Politique de paiement</h1>
        <p className="payment-policy-update">En vigueur au {new Date().toLocaleDateString()}</p>
      </header>

      {/* Sommaire */}
      <nav className="payment-policy-toc" aria-label="Sommaire">
        <ul>
          <li><a href="#moyens">1. Moyens de paiement acceptés</a></li>
          <li><a href="#devise">2. Devise de paiement</a></li>
          <li><a href="#validation">3. Validation et autorisation du paiement</a></li>
          <li><a href="#verification">4. Vérification et lutte contre la fraude</a></li>
          <li><a href="#echec">5. Paiement échoué ou annulé</a></li>
          <li><a href="#annulation">6. Annulation et remboursement</a></li>
          <li><a href="#securite">7. Sécurité des paiements</a></li>
          <li><a href="#contact">8. Contact</a></li>
        </ul>
      </nav>

      <main className="payment-policy-content">
        <section className="payment-policy-intro payment-policy-block">
          <p>
            Merci de faire vos achats chez <strong>VERTYNO</strong>.
          </p>
          <p>
            La présente politique de paiement a pour objectif de vous informer de manière claire et transparente sur les modalités de paiement applicables aux commandes passées sur notre site.
          </p>
        </section>

        <section id="moyens" className="payment-policy-block">
          <h2>1. Moyens de paiement acceptés</h2>
          <p>
            VERTYNO accepte les moyens de paiement suivants :
          </p>
          <ul>
            <li>Carte bancaire (Visa, Mastercard, American Express)</li>
            <li>Apple Pay</li>
            <li>PayPal</li>
            <li>Klarna</li>
          </ul>
          <p>
            Tous les paiements sont sécurisés et traités via des prestataires de paiement certifiés.
          </p>
        </section>

        <section id="devise" className="payment-policy-block">
          <h2>2. Devise de paiement</h2>
          <p>
            Toutes les transactions effectuées sur le site sont exprimées et traitées en <strong>euros (€ – EUR)</strong>.
          </p>
        </section>

        <section id="validation" className="payment-policy-block">
          <h2>3. Validation et autorisation du paiement</h2>
          <p>
            Le paiement est <strong>débité immédiatement</strong> après validation de la commande.
          </p>
          <p>
            Une fois le paiement accepté, vous recevez un <strong>email de confirmation</strong> récapitulant les détails de votre commande.
          </p>
          <p>
            En cas de refus de paiement ou de détection d'un risque de fraude par notre système de sécurité ou par la plateforme Shopify :
          </p>
          <ul>
            <li>la commande ne sera pas traitée,</li>
            <li>aucun envoi ne sera effectué,</li>
            <li>vous serez informé par email,</li>
            <li>il pourra vous être demandé d'utiliser un autre moyen de paiement.</li>
          </ul>
        </section>

        <section id="verification" className="payment-policy-block">
          <h2>4. Vérification et lutte contre la fraude</h2>
          <p>
            Afin de garantir la sécurité des transactions, VERTYNO se réserve le droit de procéder à des vérifications complémentaires avant de valider une commande.
          </p>
          <p>
            Ces vérifications peuvent inclure, de manière exceptionnelle :
          </p>
          <ul>
            <li>la confirmation de l'adresse email,</li>
            <li>la vérification de l'adresse de livraison,</li>
            <li>une demande de justificatif d'identité en cas de suspicion de fraude avérée.</li>
          </ul>
          <p>
            En cas d'échec ou de refus de ces vérifications, la commande pourra être annulée et <strong>un remboursement intégral sera effectué</strong> via le moyen de paiement utilisé.
          </p>
        </section>

        <section id="echec" className="payment-policy-block">
          <h2>5. Paiement échoué ou annulé</h2>
          <p>
            Si un paiement échoue ou est annulé :
          </p>
          <ul>
            <li>la commande ne sera pas validée,</li>
            <li>aucun produit ne sera expédié,</li>
            <li>vous devrez repasser commande et finaliser le paiement.</li>
          </ul>
          <p>
            Si un montant a été débité sans confirmation de commande, veuillez contacter notre service client à l'adresse suivante :
          </p>
          <p>
            📧 <a href="mailto:contact@vertyno.com" className="payment-policy-link">contact@vertyno.com</a>
          </p>
        </section>

        <section id="annulation" className="payment-policy-block">
          <h2>6. Annulation et remboursement</h2>
          <p><strong>Annulation de commande</strong></p>
          <p>
            Une commande peut être annulée <strong>avant expédition</strong>, idéalement dans un délai maximum de <strong>12 heures</strong> après validation.
          </p>
          <p>
            Passé ce délai, la commande pourra être expédiée et devra suivre la procédure de retour applicable.
          </p>
          <p><strong>Remboursements</strong></p>
          <p>
            Les conditions de remboursement (éligibilité, procédure, délais) sont détaillées dans notre <a href="/PolitiqueRetoursRemboursements" className="payment-policy-link">politique de retours et remboursements</a> :
          </p>
          <p>
            Après validation du retour, le remboursement est effectué <strong>sous 5 jours ouvrés</strong> via le moyen de paiement initial.
          </p>
          <p>
            Les délais d'apparition sur votre compte peuvent varier selon votre établissement bancaire.
          </p>
        </section>

        <section id="securite" className="payment-policy-block">
          <h2>7. Sécurité des paiements</h2>
          <p>
            VERTYNO met en œuvre toutes les mesures techniques et organisationnelles nécessaires pour sécuriser les paiements et prévenir les tentatives de fraude.
          </p>
          <p>
            Toute tentative d'utilisation frauduleuse entraînera l'annulation immédiate de la commande et pourra faire l'objet de signalements appropriés.
          </p>
        </section>

        <section id="contact" className="payment-policy-block">
          <h2>8. Contact</h2>
          <p>
            <strong>VERTYNO – SASU</strong>
          </p>
          <p>
            📍 9 Allée Gabriel Zirnhelt, 93110 Rosny-sous-Bois<br />
            📧 <a href="mailto:contact@vertyno.com" className="payment-policy-link">contact@vertyno.com</a><br />
            📞 +33 6 67 56 13 29
          </p>
          <p>
            <strong>Service client :</strong><br />
            Du lundi au vendredi, de 8h à 18h<br />
            (Fermé les samedis, dimanches et jours fériés)
          </p>
        </section>
      </main>
    </div>
  );
}
