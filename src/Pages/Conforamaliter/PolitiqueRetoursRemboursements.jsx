import "../../styles/Pages/Conformaliter/PolitiqueRetoursRemboursements.css";

export default function PolitiqueRetoursRemboursements() {
  return (
    <div className="returns-page">
      <header className="returns-hero">
        <h1>Politique de retours et de remboursements</h1>
        <p className="returns-update">En vigueur au {new Date().toLocaleDateString()}</p>
      </header>

      {/* Sommaire */}
      <nav className="returns-toc" aria-label="Sommaire">
        <ul>
          <li><a href="#retractation">1. Droit de rétractation</a></li>
          <li><a href="#retours-hors">2. Retours hors droit de rétractation</a></li>
          <li><a href="#defectueux">3. Produits défectueux, endommagés ou incorrects</a></li>
          <li><a href="#procedure">4. Procédure de retour</a></li>
          <li><a href="#remboursements">5. Remboursements</a></li>
          <li><a href="#exclus">6. Articles exclus</a></li>
          <li><a href="#coordonnees">7. Coordonnées de l'entreprise</a></li>
        </ul>
      </nav>

      <main className="returns-content">
        <section id="retractation" className="returns-block">
          <h2>1. Droit de rétractation (conformément à la loi)</h2>
          <p>
            Conformément aux articles L221-18 et suivants du Code de la consommation, le client dispose d'un délai de <strong>14 jours calendaires</strong> à compter de la réception de sa commande pour exercer son droit de rétractation, sans avoir à justifier de motif.
          </p>
          <p>
            Pour être éligible à un remboursement, le produit doit être :
          </p>
          <ul>
            <li>strictement neuf,</li>
            <li>non utilisé,</li>
            <li>non endommagé,</li>
            <li>retourné dans son emballage d'origine, complet et intact.</li>
          </ul>
          <p>
            Les <strong>frais de retour sont à la charge du client</strong>.
          </p>
          <p>
            Tout produit présentant des traces d'utilisation, d'usure, de détérioration ou incomplet <strong>ne pourra pas être remboursé</strong>.
          </p>
        </section>

        <section id="retours-hors" className="returns-block">
          <h2>2. Retours hors droit de rétractation</h2>
          <p>
            En dehors du droit légal de rétractation, <strong>VERTYNO n'accepte pas les retours pour simple changement d'avis</strong>.
          </p>
        </section>

        <section id="defectueux" className="returns-block">
          <h2>3. Produits défectueux, endommagés ou incorrects</h2>
          <p>
            Si vous recevez un produit :
          </p>
          <ul>
            <li>défectueux,</li>
            <li>endommagé à la livraison,</li>
            <li>ou non conforme à votre commande,</li>
          </ul>
          <p>
            vous devez contacter notre service client <strong>dans un délai maximum de 48 heures</strong> après réception, en joignant des <strong>photos claires</strong> du produit et de l'emballage.
          </p>
          <p>
            Après analyse :
          </p>
          <ul>
            <li>les frais de retour seront pris en charge par VERTYNO,</li>
            <li>un remplacement ou un remboursement sera proposé selon la situation.</li>
          </ul>
          <p>
            Tout signalement effectué hors délai ou sans preuve pourra être refusé.
          </p>
        </section>

        <section id="procedure" className="returns-block">
          <h2>4. Procédure de retour</h2>
          <p>
            <strong>Aucun retour ne sera accepté sans accord préalable.</strong>
          </p>
          <p>
            Pour initier une demande, contactez notre service client à :
          </p>
          <p>
            📧 <a href="mailto:contact@vertyno.com" className="returns-link">contact@vertyno.com</a>
          </p>
          <p>
            Si la demande est acceptée, les instructions de retour vous seront communiquées par email.
          </p>
          <p>
            Le produit devra être expédié <strong>dans un délai de 3 jours ouvrés</strong> après validation.
          </p>
        </section>

        <section id="remboursements" className="returns-block">
          <h2>5. Remboursements</h2>
          <p>
            Une fois le produit retourné et inspecté, le remboursement sera effectué <strong>sous 5 jours ouvrés</strong>, via le mode de paiement utilisé lors de l'achat.
          </p>
          <p>
            VERTYNO se réserve le droit de refuser un remboursement ou d'appliquer une décote en cas de non-respect des conditions ci-dessus.
          </p>
        </section>

        <section id="exclus" className="returns-block">
          <h2>6. Articles exclus</h2>
          <p>
            Les articles personnalisés ou réalisés sur mesure ne sont ni repris ni échangés, conformément à l'article L221-28 du Code de la consommation.
          </p>
        </section>

        <section id="coordonnees" className="returns-block">
          <h2>7. Coordonnées de l'entreprise</h2>
          <p>
            <strong>Nom commercial :</strong> VERTYNO<br />
            <strong>Forme juridique :</strong> SASU<br />
            <strong>Dénomination sociale :</strong> VERTYNO<br />
            <strong>Adresse :</strong> 9 Allée Gabriel Zirnhelt, 93110 Rosny-sous-Bois<br />
            <strong>Email :</strong> <a href="mailto:contact@vertyno.com" className="returns-link">contact@vertyno.com</a><br />
            <strong>Téléphone :</strong> 06 67 56 13 29<br />
            <strong>SIREN :</strong> 927 887 489<br />
            <strong>SIRET :</strong> 927 887 489 00015<br />
            <strong>TVA intracommunautaire :</strong> FR32927887489<br />
            <strong>Code APE :</strong> 4690Z<br />
            <strong>Service client :</strong> du lundi au vendredi, horaires de bureau.
          </p>
        </section>
      </main>
    </div>
  );
}
