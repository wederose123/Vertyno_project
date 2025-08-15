import "../../styles/Pages/Conformaliter/CGV.css";

export default function CGV() {
  return (
    <div className="cgv-page">
      <header className="cgv-hero">
        <h1>Conditions Générales de Vente (CGV)</h1>
        <p className="cgv-update">Dernière mise à jour : {new Date().toLocaleDateString()}</p>
      </header>

      {/* Sommaire */}
      <nav className="cgv-toc" aria-label="Sommaire">
        <ul>
          <li><a href="#objet">1. Objet</a></li>
          <li><a href="#produits">2. Produits et disponibilité</a></li>
          <li><a href="#prix-paiement">3. Prix et paiement</a></li>
          <li><a href="#livraison">4. Livraison</a></li>
          <li><a href="#retractation">5. Droit de rétractation</a></li>
          <li><a href="#garantie">6. Garantie et réclamations</a></li>
          <li><a href="#responsabilite">7. Responsabilité</a></li>
          <li><a href="#donnees">8. Données personnelles</a></li>
          <li><a href="#litiges">9. Litiges et droit applicable</a></li>
        </ul>
      </nav>

      <main className="cgv-content">
        <section id="objet" className="cgv-block">
          <h2>1. Objet</h2>
          <p>
            Les présentes conditions générales de vente définissent les modalités de vente des
            produits proposés par <strong>VERTYNO</strong> sur son site internet et via des plateformes partenaires.
          </p>
        </section>

        <section id="produits" className="cgv-block">
          <h2>2. Produits et disponibilité</h2>
          <p>
            Nos produits sont décrits et présentés avec la plus grande précision possible. En cas
            d’indisponibilité après commande, l’acheteur en sera informé et pourra choisir entre
            un remboursement ou un produit équivalent.
          </p>
        </section>

        <section id="prix-paiement" className="cgv-block">
          <h2>3. Prix et paiement</h2>
          <p>
            Les prix affichés sont en euros et incluent la TVA. Les paiements sont sécurisés et
            peuvent être effectués par carte bancaire, PayPal ou tout autre moyen proposé sur
            le site.
          </p>
        </section>

        <section id="livraison" className="cgv-block">
          <h2>4. Livraison</h2>
          <p>
            Les livraisons sont effectuées en France métropolitaine et dans certains pays
            européens via Etsy. Les délais de livraison varient selon l’option choisie et
            sont précisés lors de la commande.
          </p>
        </section>

        <section id="retractation" className="cgv-block">
          <h2>5. Droit de rétractation</h2>
          <p>
            Conformément à la loi, vous disposez de <strong>14 jours</strong> pour exercer votre droit de
            rétractation à compter de la réception du produit. Pour cela, contactez-nous à
            <a href="mailto:contact@vertyno.com" className="cgv-link"> contact@vertyno.com</a> en précisant votre demande.
            Le produit devra être retourné dans son état d’origine et les frais de retour seront à votre charge.
          </p>
        </section>

        <section id="garantie" className="cgv-block">
          <h2>6. Garantie et réclamations</h2>
          <p>
            Nos produits bénéficient de la garantie légale de conformité. En cas de produit
            défectueux, merci de nous contacter à
            <a href="mailto:contact@vertyno.com" className="cgv-link"> contact@vertyno.com</a> avec une description du
            problème et, si possible, des photos du produit concerné.
          </p>
        </section>

        <section id="responsabilite" className="cgv-block">
          <h2>7. Responsabilité</h2>
          <p>
            VERTYNO ne saurait être tenu responsable des dommages résultant d’une mauvaise
            utilisation des produits achetés sur le site.
          </p>
        </section>

        <section id="donnees" className="cgv-block">
          <h2>8. Données personnelles</h2>
          <p>
            Les informations collectées lors des commandes sont traitées conformément à notre
            politique de confidentialité et au <strong>RGPD</strong>.
          </p>
        </section>

        <section id="litiges" className="cgv-block">
          <h2>9. Litiges et droit applicable</h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige, une solution
            amiable sera privilégiée. À défaut, les tribunaux compétents seront ceux du siège
            social de VERTYNO.
          </p>
        </section>
      </main>
    </div>
  );
}
