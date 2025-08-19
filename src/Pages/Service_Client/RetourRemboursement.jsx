import "../../styles/Pages/Service_Client/RetourRemboursement.css";

export default function RetourRemboursement() {
  return (
    <>
      <div className="m-5 mar-px">
        <h1 className="text-center mt-5">RETOURS ET REMBOURSEMENTS</h1>
        <h5 className="text-center">En vigueur au 15/08/2025</h5>
        <section className="firtSectRetour">
          <article className="artiRetour">
            <p>
              Vous disposez d’un délai de <strong>14 jours</strong> après réception de votre
              commande pour nous retourner un article qui ne vous conviendrait pas.
            </p>
          </article>

          <h3>Conditions de retour</h3>
          <article className="artiRetour">
            <p>
              Pour être éligible à un retour, le produit doit être :
              <ul>
                <li>Non utilisé</li>
                <li>Dans son emballage d’origine</li>
                <li>En parfait état</li>
              </ul>
            </p>
          </article>

          <h3>Frais de retour</h3>
          <article className="artiRetour">
            <p>
              Les frais de retour sont à la charge de l’acheteur,
              sauf en cas d’erreur de notre part ou de produit défectueux.
            </p>
          </article>

          <h3>Remboursement</h3>
          <article className="artiRetour">
            <p>
              Après réception et inspection du produit, nous procéderons au
              remboursement sur le moyen de paiement initial sous un délai de
              <strong> 7 jours ouvrés</strong>.
            </p>
          </article>
        </section>
      </div>
    </>
  );
}
