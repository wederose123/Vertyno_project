import "../../styles/Pages/Conformaliter/ConditionsVentes.css";

export default function ConditionsVentes() {
  return (
    <div className="sales-terms-page">
      <header className="sales-terms-hero">
        <h1>Conditions de ventes</h1>
        <p className="sales-terms-update">En vigueur au {new Date().toLocaleDateString()}</p>
      </header>

      {/* Sommaire */}
      <nav className="sales-terms-toc" aria-label="Sommaire">
        <ul>
          <li><a href="#champ">1. Champ d'application</a></li>
          <li><a href="#prix">2. Prix et paiement</a></li>
          <li><a href="#acceptation">3. Acceptation de la commande</a></li>
          <li><a href="#livraison">4. Livraison</a></li>
          <li><a href="#utilisation">5. Utilisation des produits</a></li>
          <li><a href="#retractation">6. Droit de rétractation</a></li>
          <li><a href="#remboursements">7. Remboursements</a></li>
          <li><a href="#responsabilite">8. Responsabilité</a></li>
          <li><a href="#litiges">9. Droit applicable et litiges</a></li>
          <li><a href="#contact">10. Informations de contact</a></li>
        </ul>
      </nav>

      <main className="sales-terms-content">
        <section className="sales-terms-intro sales-terms-block">
          <h2>TERMES ET CONDITIONS DE VENTE</h2>
          <p><strong>VERTYNO</strong></p>
          <p>
            Les présentes Termes et Conditions de Vente (ci-après les « Termes ») régissent la vente des produits proposés sur le site <strong>VERTYNO</strong> (ci-après le « Site »).
          </p>
          <p>
            Toute commande passée sur le Site implique l'acceptation pleine et entière des présents Termes, sans réserve.
          </p>
        </section>

        <section id="champ" className="sales-terms-block">
          <h2>1. Champ d'application</h2>
          <p>
            Les présents Termes s'appliquent à toutes les commandes effectuées sur le Site par des consommateurs au sens du Code de la consommation.
          </p>
          <p>
            VERTYNO se réserve le droit de modifier les présents Termes à tout moment. Les Termes applicables sont ceux en vigueur à la date de la commande.
          </p>
        </section>

        <section id="prix" className="sales-terms-block">
          <h2>2. Prix et paiement</h2>
          <p>
            Les prix sont exprimés en <strong>euros (€), toutes taxes comprises</strong>.
          </p>
          <p>
            VERTYNO se réserve le droit de modifier ses prix à tout moment, sans effet rétroactif sur les commandes déjà validées.
          </p>
          <p>
            Les moyens de paiement acceptés sont :
          </p>
          <ul>
            <li>Visa</li>
            <li>Mastercard</li>
            <li>American Express</li>
            <li>Apple Pay</li>
            <li>PayPal</li>
          </ul>
          <p>
            La commande est réputée validée après confirmation du paiement.
          </p>
        </section>

        <section id="acceptation" className="sales-terms-block">
          <h2>3. Acceptation de la commande</h2>
          <p>
            Une commande n'est considérée comme acceptée qu'après l'envoi d'un <strong>email de confirmation</strong>.
          </p>
          <p>
            VERTYNO se réserve le droit de refuser ou d'annuler toute commande en cas de :
          </p>
          <ul>
            <li>suspicion de fraude,</li>
            <li>incohérence des informations fournies,</li>
            <li>commande anormale ou abusive,</li>
            <li>litige antérieur non résolu.</li>
          </ul>
          <p>
            Le client est informé de tout refus ou annulation par email.
          </p>
        </section>

        <section id="livraison" className="sales-terms-block">
          <h2>4. Livraison</h2>
          <p><strong>Zones de livraison</strong></p>
          <p>
            VERTYNO livre :
          </p>
          <ul>
            <li>en <strong>France métropolitaine</strong>,</li>
            <li>dans <strong>l'ensemble des pays de l'Union européenne</strong>.</li>
          </ul>
          <p><strong>Délais estimés</strong></p>
          <ul>
            <li>Traitement avant expédition : <strong>1 à 2 jours ouvrés</strong></li>
            <li>Livraison après expédition : <strong>2 à 5 jours ouvrés</strong></li>
            <li>Délai total estimé : <strong>3 à 7 jours ouvrés</strong></li>
          </ul>
          <p>
            Ces délais sont indicatifs et peuvent être prolongés en cas de circonstances exceptionnelles indépendantes de la volonté de VERTYNO (grèves, conditions météorologiques, incidents logistiques).
          </p>
        </section>

        <section id="utilisation" className="sales-terms-block">
          <h2>5. Utilisation des produits</h2>
          <p>
            Les produits vendus sont destinés à un usage personnel et licite.
          </p>
          <p>
            Toute utilisation frauduleuse, trompeuse ou contraire à la loi est strictement interdite.
          </p>
        </section>

        <section id="retractation" className="sales-terms-block">
          <h2>6. Droit de rétractation</h2>
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
            Les modalités complètes figurent dans la <a href="/PolitiqueRetoursRemboursements" className="sales-terms-link">politique de retours et remboursements</a> :
          </p>
        </section>

        <section id="remboursements" className="sales-terms-block">
          <h2>7. Remboursements</h2>
          <p>
            Après réception et inspection du produit retourné, le remboursement est effectué <strong>sous 5 jours ouvrés</strong>, via le mode de paiement utilisé lors de la commande.
          </p>
          <p>
            Tout produit ne respectant pas les conditions de retour pourra faire l'objet d'un <strong>refus de remboursement</strong>.
          </p>
          <p>
            En cas de suspicion de fraude, VERTYNO se réserve le droit de différer le remboursement le temps des vérifications nécessaires.
          </p>
        </section>

        <section id="responsabilite" className="sales-terms-block">
          <h2>8. Responsabilité</h2>
          <p>
            VERTYNO ne saurait être tenu responsable :
          </p>
          <ul>
            <li>des retards imputables aux transporteurs,</li>
            <li>des erreurs d'adresse fournies par le client,</li>
            <li>de l'utilisation non conforme des produits.</li>
          </ul>
          <p>
            La responsabilité de VERTYNO est limitée au <strong>montant de la commande</strong>.
          </p>
        </section>

        <section id="litiges" className="sales-terms-block">
          <h2>9. Droit applicable et litiges</h2>
          <p>
            Les présents Termes sont soumis au <strong>droit français</strong>.
          </p>
          <p>
            En cas de litige, le client est invité à contacter préalablement le service client afin de rechercher une solution amiable.
          </p>
          <p>
            Conformément à la loi, le consommateur peut recourir à un <strong>médiateur de la consommation</strong>.
          </p>
        </section>

        <section id="contact" className="sales-terms-block">
          <h2>10. Informations de contact</h2>
          <p>
            <strong>VERTYNO – SASU</strong>
          </p>
          <p>
            📍 9 Allée Gabriel Zirnhelt, 93110 Rosny-sous-Bois<br />
            📧 <a href="mailto:contact@vertyno.com" className="sales-terms-link">contact@vertyno.com</a><br />
            📞 06 67 56 13 29<br />
            <strong>Service client :</strong> du lundi au vendredi, horaires de bureau.
          </p>
        </section>
      </main>
    </div>
  );
}
