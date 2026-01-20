import "../../styles/Pages/Conformaliter/PolitiqueLivraison.css";

export default function PolitiqueLivraison() {
  return (
    <div className="shipping-page">
      <header className="shipping-hero">
        <h1>Politique de livraison</h1>
        <p className="shipping-update">En vigueur au {new Date().toLocaleDateString()}</p>
      </header>

      {/* Sommaire */}
      <nav className="shipping-toc" aria-label="Sommaire">
        <ul>
          <li><a href="#zones">1. Zones de livraison</a></li>
          <li><a href="#frais">2. Frais d'expédition</a></li>
          <li><a href="#delais">3. Délais de traitement et de livraison</a></li>
          <li><a href="#transporteurs">4. Transporteurs</a></li>
          <li><a href="#weekend">5. Commandes passées le week-end</a></li>
          <li><a href="#suivi">6. Suivi de commande</a></li>
          <li><a href="#modification">7. Modification de l'adresse de livraison</a></li>
          <li><a href="#annulation">8. Annulation de commande</a></li>
          <li><a href="#dommages">9. Colis endommagé, manquant ou non conforme</a></li>
          <li><a href="#conformite">10. Conformité des produits</a></li>
          <li><a href="#coordonnees">11. Service client & informations légales</a></li>
        </ul>
      </nav>

      <main className="shipping-content">
        <section className="shipping-intro shipping-block">
          <h2>Politique d'expédition – VERTYNO</h2>
          <p>
            La présente politique d'expédition a pour objectif d'informer clairement nos clients sur nos conditions de livraison.
          </p>
          <p>
            En passant commande sur notre site, vous acceptez l'ensemble des conditions décrites ci-dessous.
          </p>
        </section>

        <section id="zones" className="shipping-block">
          <h2>1. Zones de livraison</h2>
          <p>
            VERTYNO livre actuellement :
          </p>
          <ul>
            <li>en <strong>France métropolitaine</strong>,</li>
            <li>ainsi que dans certains <strong>pays européens</strong> (selon transporteur et destination).</li>
          </ul>
          <p>
            En cas de doute concernant votre zone de livraison, nous vous invitons à contacter notre service client avant de passer commande :
          </p>
          <p>
            📧 <a href="mailto:contact@vertyno.com" className="shipping-link">contact@vertyno.com</a>
          </p>
        </section>

        <section id="frais" className="shipping-block">
          <h2>2. Frais d'expédition</h2>
          <ul>
            <li><strong>Aucun frais caché</strong> : l'ensemble des frais liés à votre commande (livraison, taxes éventuelles) est affiché <strong>avant validation du paiement</strong>.</li>
            <li>Les frais de livraison varient selon le transporteur et le mode de livraison sélectionné.</li>
          </ul>
        </section>

        <section id="delais" className="shipping-block">
          <h2>3. Délais de traitement et de livraison</h2>
          <p><strong>Traitement de la commande</strong></p>
          <ul>
            <li>1 à 2 jours ouvrés (du lundi au vendredi, hors jours fériés).</li>
          </ul>
          <p><strong>Délais de livraison estimés après expédition</strong></p>
          <ul>
            <li>2 à 5 jours ouvrés selon le transporteur.</li>
          </ul>
          <p><strong>Délai total estimé</strong></p>
          <ul>
            <li>3 à 7 jours ouvrés.</li>
          </ul>
          <p>
            Ces délais sont donnés à titre indicatif. Ils peuvent être prolongés en cas de circonstances exceptionnelles indépendantes de notre volonté (grèves, conditions météorologiques, incidents logistiques, périodes de forte activité).
          </p>
        </section>

        <section id="transporteurs" className="shipping-block">
          <h2>4. Transporteurs</h2>
          <p>
            Nous travaillons avec des transporteurs reconnus tels que :
          </p>
          <ul>
            <li>Chronopost</li>
            <li>Mondial Relay</li>
            <li>Colis Privé</li>
            <li>ou tout autre transporteur adapté à votre commande.</li>
          </ul>
          <p>
            Le choix du transporteur dépend du mode de livraison sélectionné lors de la commande.
          </p>
        </section>

        <section id="weekend" className="shipping-block">
          <h2>5. Commandes passées le week-end</h2>
          <p>
            Les commandes passées le samedi, le dimanche ou un jour férié sont traitées le <strong>jour ouvré suivant</strong>.
          </p>
        </section>

        <section id="suivi" className="shipping-block">
          <h2>6. Suivi de commande</h2>
          <p>
            Une fois votre commande expédiée, vous recevrez un <strong>email de confirmation d'expédition</strong> contenant :
          </p>
          <ul>
            <li>votre numéro de suivi,</li>
            <li>un lien direct vers le site du transporteur.</li>
          </ul>
          <p>
            Vous pouvez également suivre votre commande directement sur notre site via la page dédiée :
          </p>
          <p>
            👉 <a href="/SuiviCommande" className="shipping-link">Suivi de commande</a> (lien à insérer)
          </p>
        </section>

        <section id="modification" className="shipping-block">
          <h2>7. Modification de l'adresse de livraison</h2>
          <p>
            Il appartient au client de vérifier attentivement l'exactitude de l'adresse de livraison avant validation de la commande.
          </p>
          <p>
            ⚠️ <strong>Une fois la commande expédiée, aucune modification d'adresse ne pourra être effectuée.</strong>
          </p>
          <p>
            VERTYNO ne pourra être tenu responsable d'une erreur d'adresse fournie par le client.
          </p>
        </section>

        <section id="annulation" className="shipping-block">
          <h2>8. Annulation de commande</h2>
          <ul>
            <li>Les annulations sont possibles <strong>uniquement avant l'expédition</strong> de la commande, idéalement dans un délai maximum de <strong>12 heures</strong> après la validation.</li>
            <li>Une fois la commande traitée ou expédiée, aucune annulation ne sera possible.</li>
          </ul>
          <p>
            Dans ce cas, le client devra se référer à notre <a href="/PolitiqueRetoursRemboursements" className="shipping-link">politique de retours et remboursements</a> :
          </p>
        </section>

        <section id="dommages" className="shipping-block">
          <h2>9. Colis endommagé, manquant ou non conforme</h2>
          <p><strong>Colis endommagé à la livraison</strong></p>
          <ul>
            <li>Si possible, le colis doit être refusé lors de la livraison.</li>
            <li>Si le colis a été livré en votre absence, contactez notre service client <strong>dans un délai de 48 heures</strong> après réception, avec photos à l'appui (colis + produit).</li>
          </ul>
          <p><strong>Produit manquant ou incorrect</strong></p>
          <ul>
            <li>Toute anomalie doit être signalée <strong>dans les 48 heures suivant la réception</strong> par email à :</li>
          </ul>
          <p>
            📧 <a href="mailto:contact@vertyno.com" className="shipping-link">contact@vertyno.com</a>
          </p>
          <p>
            Passé ce délai, aucune réclamation ne pourra être prise en compte.
          </p>
        </section>

        <section id="conformite" className="shipping-block">
          <h2>10. Conformité des produits</h2>
          <p>
            Nous faisons le maximum pour fournir des descriptions de produits fidèles et détaillées.
          </p>
          <p>
            En cas de non-conformité avérée entre le produit reçu et sa description, le client peut demander un retour ou un remboursement <strong>sans frais</strong>, conformément à notre <a href="/PolitiqueRetoursRemboursements" className="shipping-link">politique de retours et remboursements</a>.
          </p>
        </section>

        <section id="coordonnees" className="shipping-block">
          <h2>11. Service client & informations légales</h2>
          <p>
            <strong>Nom commercial :</strong> VERTYNO<br />
            <strong>Forme juridique :</strong> SASU<br />
            <strong>Dénomination sociale :</strong> VERTYNO<br />
            <strong>Adresse :</strong> 9 Allée Gabriel Zirnhelt, 93110 Rosny-sous-Bois<br />
            <strong>Email :</strong> <a href="mailto:contact@vertyno.com" className="shipping-link">contact@vertyno.com</a><br />
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
