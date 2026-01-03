import { useEffect, useMemo, useState, useCallback } from "react";
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useSearchParams } from "react-router-dom";
import "../../styles/Pages/Panier/Panier.css";
import { db, app } from "../../Firebase/firebase-config";

const currencyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR"
});

const CartItem = ({ item, onToggle, onQuantityChange, onRemove }) => (
  <article className="cart-item">
    <label className="cart-checkbox">
      <input
        type="checkbox"
        checked={item.selected}
        onChange={() => onToggle(item.id)}
      />
      <span className="custom-checkbox" />
    </label>

    <div className="cart-item-image">
      <img src={item.image} alt={item.name} />
    </div>

    <div className="cart-item-info">
      <div>
        <h3>{item.name}</h3>
        <p>{item.category}</p>
      </div>
      <div className="cart-item-meta">
        <strong>{currencyFormatter.format(item.price)}</strong>
        <div className="quantity-controls">
          <button onClick={() => onQuantityChange(item.id, -1)}>-</button>
          <span>{item.quantity}</span>
          <button onClick={() => onQuantityChange(item.id, 1)}>+</button>
        </div>
      </div>
    </div>

    <button className="cart-delete" onClick={() => onRemove(item.id)}>
      ×
    </button>
  </article>
);

export default function Panier() {
  // Les produits affichés dans le panier
  const [items, setItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Messages de succès/annulation depuis les paramètres d'URL
  const paymentSuccess = searchParams.get("success") === "true";
  const paymentCanceled = searchParams.get("canceled") === "true";

  // État pour le mode de livraison et les frais
  const [shippingMethod, setShippingMethod] = useState("relay"); // "relay" | "home"
  const [shippingPrice, setShippingPrice] = useState(0);
  const [shippingLabel, setShippingLabel] = useState("Livraison en point relais (gratuite)");
  const [boxtalMap, setBoxtalMap] = useState(null);
  const [isBoxtalReady, setIsBoxtalReady] = useState(false);
  const [relayPoint, setRelayPoint] = useState(null); // point relais choisi

  // État pour les informations du formulaire de livraison
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    adresse: "",
    complementAdresse: "",
    ville: "",
    codePostal: "",
    telephone: "",
    email: "",
  });

  // Initialisation de la Cloud Function Stripe
  const functions = getFunctions(app);
  const createCheckoutSession = httpsCallable(functions, "createCheckoutSession");
  const getBoxtalMapToken = httpsCallable(functions, "getBoxtalMapToken");

  // Fonction pour gérer les changements dans le formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Réinitialiser l'erreur quand l'utilisateur modifie un champ
    if (error) setError(null);
  };

  // Initialise la carte Boxtal une seule fois
  const initBoxtalMap = useCallback(async () => {
    // Déjà initialisé
    if (boxtalMap) return;

    // Vérifier que le script Boxtal est bien chargé
    if (
      !window.BoxtalParcelPointMap ||
      !window.BoxtalParcelPointMap.BoxtalParcelPointMap
    ) {
      console.error("BoxtalParcelPointMap non disponible sur window");
      return;
    }

    try {
      // Récupérer un token temporaire via la Cloud Function
      const result = await getBoxtalMapToken();
      const tokenData = result.data || {};
      const accessToken =
        tokenData.accessToken || tokenData.token || tokenData?.access_token;

      if (!accessToken) {
        console.error("Token Boxtal invalide :", tokenData);
        return;
      }

      console.log("Token Boxtal OK");

      // Création de l'instance de carte Boxtal
      const mapInstance =
        new window.BoxtalParcelPointMap.BoxtalParcelPointMap({
          domToLoadMap: "#parcel-point-map",
          accessToken: accessToken,
          config: {
            locale: "fr",
            parcelPointNetworks: [
              { code: "MONR_NETWORK" }, // Mondial Relay
              { code: "CHRP_NETWORK" }, // Chronopost Shop2Shop
            ],
            options: {
              primaryColor: "#FFB6C1",
              autoSelectNearestParcelPoint: true,
            },
          },
          // Très important : on ne lancera la recherche qu'après ça
          onMapLoaded: () => {
            console.log("Carte Boxtal chargée");
            setIsBoxtalReady(true);
          },
        });

      setBoxtalMap(mapInstance);
    } catch (err) {
      console.error("Erreur init Boxtal map :", err);
    }
  }, [boxtalMap, getBoxtalMapToken]);

  // On initialise la carte au montage du composant
  useEffect(() => {
    initBoxtalMap();
  }, [initBoxtalMap]);

  // Fonction pour lancer la recherche de points relais
  const openRelayPicker = () => {
    if (!formData.codePostal || !formData.ville) {
      alert("Veuillez d'abord remplir votre code postal et votre ville.");
      return;
    }

    if (!boxtalMap) {
      console.error("Boxtal map non initialisée");
      alert("La carte des points relais n'est pas encore prête.");
      return;
    }

    if (!isBoxtalReady) {
      console.log("Carte Boxtal en cours de chargement...");
      alert("La carte est en cours de chargement, réessayez dans 1 seconde.");
      return;
    }

    const address = {
      country: "FR",
      zipCode: formData.codePostal.trim(),
      city: formData.ville.trim(),
      street: formData.adresse?.trim() || "",
    };

    console.log("Recherche Boxtal avec :", address);

    try {
      boxtalMap.searchParcelPoints(address, (parcelPoint) => {
        console.log("Point relais sélectionné par Boxtal :", parcelPoint);

        if (!parcelPoint) return;

        // Structure standardisée du point relais pour Firestore
        // Compatible avec le backend (functions/index.js)
        const postalCode = parcelPoint.address?.zipCode || parcelPoint.zipCode || "";
        const city = parcelPoint.address?.city || parcelPoint.city || "";
        const street = parcelPoint.address?.street || parcelPoint.street || parcelPoint.addressLine1 || "";
        
        setRelayPoint({
          // Identifiants
          id: parcelPoint.id,
          name: parcelPoint.name,
          // Adresse (format standardisé)
          street: street,
          postalCode: postalCode, // Format standardisé (camelCase)
          postal_code: postalCode, // Format legacy pour compatibilité backend
          city: city,
          country: "FR", // Toujours FR pour l'instant
          // Métadonnées
          provider: "boxtal", // Identifie la source (Boxtal)
          network: parcelPoint.networkCode || parcelPoint.network || "",
          // Données brutes (pour debug ou usage futur)
          raw: parcelPoint,
        });
      });
    } catch (err) {
      console.error("Erreur Boxtal searchParcelPoints :", err);
      alert("Erreur lors du chargement des points relais.");
    }
  };


  useEffect(() => {
    // Récupération en temps réel des documents de la collection `panier`
    const panierRef = collection(db, "panier");
    const unsubscribe = onSnapshot(panierRef, (snapshot) => {
      const fetchedItems = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          // on stocke aussi l'identifiant Firestore pour pouvoir mettre à jour/supprimer
          id: data.id ?? docSnap.id,
          firestoreId: docSnap.id,
          slug: data.slug,
          name: data.name,
          category: data.category,
          price: data.price,
          image: data.image,
          stripePriceId: data.stripePriceId, // Price ID Stripe pour le checkout
          quantity: data.quantity ?? 1, // quantité récupérée si elle existe, sinon 1
          // Récupération de selected depuis Firestore, par défaut true si non défini
          selected: data.selected ?? true
        };
      });
      setItems(fetchedItems);
    });

    // Nettoyage de l'écouteur lors du démontage
    return () => unsubscribe();
  }, []);

  const handleToggle = (id) => {
    setItems((prev) => {
      const updatedItems = prev.map((item) => {
        if (item.id === id) {
          const newSelected = !item.selected;
          
          // Mise à jour de la valeur selected dans Firestore
          if (item.firestoreId) {
            updateDoc(doc(db, "panier", item.firestoreId), {
              selected: newSelected
            }).catch((error) =>
              console.error("Erreur updateDoc selected :", error)
            );
          }
          
          return { ...item, selected: newSelected };
        }
        return item;
      });
      
      return updatedItems;
    });
  };

  const handleQuantityChange = (id, delta) => {
    setItems((prev) => {
      return prev.reduce((acc, item) => {
        if (item.id !== id) {
          acc.push(item);
          return acc;
        }

        const newQuantity = item.quantity + delta;

        if (newQuantity > 0) {
          const updatedItem = { ...item, quantity: newQuantity };
          acc.push(updatedItem);

          // Mise à jour de la quantité côté Firestore
          if (item.firestoreId) {
            updateDoc(doc(db, "panier", item.firestoreId), {
              quantity: newQuantity
            }).catch((error) =>
              console.error("Erreur updateDoc quantité :", error)
            );
          }
        } else {
          // Si la quantité devient <= 0, on supprime aussi côté Firestore
          if (item.firestoreId) {
            deleteDoc(doc(db, "panier", item.firestoreId)).catch((error) =>
              console.error("Erreur deleteDoc (quantité <= 0) :", error)
            );
          }
        }

        return acc;
      }, []);
    });
  };

  const handleRemove = (id) => {
    setItems((prev) => {
      const itemToRemove = prev.find((item) => item.id === id);

      if (itemToRemove?.firestoreId) {
        deleteDoc(doc(db, "panier", itemToRemove.firestoreId)).catch(
          (error) => console.error("Erreur deleteDoc (remove) :", error)
        );
      }

      return prev.filter((item) => item.id !== id);
    });
  };

  // Calcul du sous-total produits
  const productsTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      if (!item.selected) return sum;
      return sum + item.price * item.quantity;
    }, 0);
  }, [items]);

  // Calcul du total final (produits + livraison)
  const orderTotal = useMemo(() => {
    return productsTotal + shippingPrice;
  }, [productsTotal, shippingPrice]);

  // Calcul automatique des frais de livraison (logique locale simple)
  useEffect(() => {
    // Règle 1 : si total >= 45€ → livraison gratuite pour TOUT
    if (productsTotal >= 45) {
      setShippingPrice(0);
      setShippingLabel("Livraison gratuite (commande ≥ 45 €)");
      return;
    }

    // Règle 2 : point relais toujours gratuit
    if (shippingMethod === "relay") {
      setShippingPrice(0);
      setShippingLabel("Livraison en point relais (gratuite)");
      return;
    }

    // Règle 3 : livraison à domicile < 45€ → frais fixes 4.90€
    if (shippingMethod === "home") {
      setShippingPrice(4.9);
      setShippingLabel("Livraison à domicile");
      return;
    }
  }, [productsTotal, shippingMethod]);

  /**
   * Validation du formulaire
   * Vérifie que tous les champs obligatoires sont remplis
   */
  const validateForm = () => {
    const requiredFields = {
      nom: "Nom",
      prenom: "Prénom",
      adresse: "Adresse",
      ville: "Ville",
      codePostal: "Code postal",
      telephone: "Téléphone",
      email: "Adresse e-mail",
    };

    for (const [key, label] of Object.entries(requiredFields)) {
      if (!formData[key] || !formData[key].trim()) {
        setError(`Le champ "${label}" est obligatoire.`);
        return false;
      }
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Veuillez entrer une adresse e-mail valide.");
      return false;
    }

    // Validation du téléphone (format basique)
    const phoneRegex = /^[0-9+\s\-()]+$/;
    if (!phoneRegex.test(formData.telephone)) {
      setError("Veuillez entrer un numéro de téléphone valide.");
      return false;
    }

    return true;
  };

  /**
   * Fonction pour créer une session Stripe Checkout
   * Récupère les items sélectionnés, valide le formulaire, enregistre dans checkout_sessions et appelle la Cloud Function
   */
  const handleCheckout = async (e) => {
    e.preventDefault(); // Empêcher le rechargement de la page

    // Récupération des items sélectionnés uniquement
    const selectedItems = items.filter((item) => item.selected);

    // Vérification qu'il y a au moins un item sélectionné
    if (selectedItems.length === 0) {
      setError("Veuillez sélectionner au moins un produit pour passer commande.");
      return;
    }

    // Vérification qu'un point relais est sélectionné si mode relay
    if (shippingMethod === "relay" && !relayPoint) {
      setError("Veuillez choisir un point relais pour la livraison.");
      return;
    }


    // Vérification que tous les items ont un stripePriceId
    const itemsWithoutPriceId = selectedItems.filter((item) => !item.stripePriceId);
    if (itemsWithoutPriceId.length > 0) {
      setError(
        `Les produits suivants n'ont pas de Price ID Stripe : ${itemsWithoutPriceId.map((i) => i.name).join(", ")}`
      );
      return;
    }

    // Validation du formulaire
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const clientEmail = formData.email.trim();

      // ===== ÉTAPE 1 : Créer ou récupérer le client dans la collection clients =====
      // Vérifier si un client existe déjà avec cet email
      const clientsRef = collection(db, "clients");
      const clientQuery = query(clientsRef, where("email", "==", clientEmail));
      const existingClients = await getDocs(clientQuery);

      let clientId;

      if (!existingClients.empty) {
        // Client existant trouvé : on le met à jour
        const existingClientDoc = existingClients.docs[0];
        clientId = existingClientDoc.id;
        const clientRef = doc(db, "clients", clientId);

        // Mise à jour du client existant
        await updateDoc(clientRef, {
          // Mise à jour des infos si elles ont changé
          nom: formData.nom.trim() || existingClientDoc.data().nom,
          prenom: formData.prenom.trim() || existingClientDoc.data().prenom,
          adresse: {
            rue: formData.adresse.trim() || existingClientDoc.data().adresse?.rue,
            complement: formData.complementAdresse.trim() || existingClientDoc.data().adresse?.complement || null,
            ville: formData.ville.trim() || existingClientDoc.data().adresse?.ville,
            codePostal: formData.codePostal.trim() || existingClientDoc.data().adresse?.codePostal,
          },
          telephone: formData.telephone.trim() || existingClientDoc.data().telephone,
          // Mise à jour de la dernière activité
          derniereActiviteAt: serverTimestamp(),
          // derniereCommandeId reste inchangé (ce n'est pas encore une commande payée)
        });

        console.log("Client existant mis à jour :", clientId);
      } else {
        // Nouveau client : création d'un document dans clients
        const newClientData = {
          email: clientEmail,
          nom: formData.nom.trim(),
          prenom: formData.prenom.trim(),
          adresse: {
            rue: formData.adresse.trim(),
            complement: formData.complementAdresse.trim() || null,
            ville: formData.ville.trim(),
            codePostal: formData.codePostal.trim(),
          },
          telephone: formData.telephone.trim(),
          aUnCompte: false, // Par défaut, pas de compte
          aDejaPaye: false, // Pas encore de paiement
          derniereCommandeId: null,
          derniereActiviteAt: serverTimestamp(),
          nbCommandes: 0, // Nombre de commandes payées
          nbAbandons: 0, // Nombre d'abandons de panier
        };

        const clientRef = await addDoc(clientsRef, newClientData);
        clientId = clientRef.id;
        console.log("Nouveau client créé :", clientId);
      }

      // ===== ÉTAPE 2 : Créer ou mettre à jour la session checkout_sessions dans Firestore =====
      // Vérifier si une session checkout_sessions existe déjà pour cet email
      const checkoutSessionsRef = collection(db, "checkout_sessions");
      const q = query(checkoutSessionsRef, where("client.email", "==", clientEmail));
      const existingSessions = await getDocs(q);

      let checkoutSessionId;

      // Préparation sécurisée du point relais pour Firestore
      // On enregistre dès qu'on a un point relais, même si tous les champs ne sont pas parfaits
      const relayPointData =
        shippingMethod === "relay" && relayPoint
          ? {
              id:
                relayPoint.id ||
                relayPoint.code ||
                relayPoint.relayCode ||
                null,
              name: relayPoint.name || relayPoint.label || "",
              street:
                relayPoint.street ||
                relayPoint.address ||
                relayPoint.address1 ||
                "",
              postalCode:
                relayPoint.postalCode ||
                relayPoint.postal_code ||
                relayPoint.zipcode ||
                "",
              postal_code:
                relayPoint.postalCode ||
                relayPoint.postal_code ||
                relayPoint.zipcode ||
                "",
              city: relayPoint.city || relayPoint.locality || "",
              country: relayPoint.country || "FR",
              provider: relayPoint.provider || "boxtal",
            }
          : null;

      // Préparation des données de la session
      const checkoutSessionData = {
        // 🔗 Lien vers le document client
        clientId: clientId,
        // Informations client (conservées pour référence rapide)
        client: {
          nom: formData.nom.trim(),
          prenom: formData.prenom.trim(),
          adresse: formData.adresse.trim(),
          complementAdresse: formData.complementAdresse.trim() || null,
          ville: formData.ville.trim(),
          codePostal: formData.codePostal.trim(),
          telephone: formData.telephone.trim(),
          email: clientEmail,
        },
        // Produits commandés
        items: selectedItems.map((item) => ({
          id: item.id,
          slug: item.slug || null,
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: item.quantity,
          stripePriceId: item.stripePriceId,
          image: item.image || null, // Image pour l'archive
        })),
        // Informations de commande
        total: orderTotal, // Total incluant les frais de livraison
        productsTotal: productsTotal, // Sous-total produits uniquement
        shippingMethod: shippingMethod, // "relay" ou "home"
        shippingPrice: shippingPrice, // Frais de livraison
        shippingLabel: shippingLabel, // Libellé de la livraison
        // Point relais sélectionné (si mode relay et tous les champs requis sont présents)
        // Structure nettoyée pour Firestore : uniquement les champs essentiels, jamais undefined
        relayPoint: relayPointData,
        status: "pending", // En attente de paiement
        paymentMethod: paymentMethod,
        updatedAt: serverTimestamp(),
      };

      if (!existingSessions.empty) {
        // Session existante trouvée : on la met à jour
        const existingDoc = existingSessions.docs[0];
        checkoutSessionId = existingDoc.id;
        const checkoutSessionRef = doc(db, "checkout_sessions", checkoutSessionId);

        await updateDoc(checkoutSessionRef, checkoutSessionData);
        console.log("Session checkout_sessions mise à jour :", checkoutSessionId);
      } else {
        // Aucune session existante : création d'une nouvelle session
        checkoutSessionData.createdAt = serverTimestamp();
        const checkoutSessionRef = await addDoc(checkoutSessionsRef, checkoutSessionData);
        checkoutSessionId = checkoutSessionRef.id;
        console.log("Nouvelle session checkout_sessions créée :", checkoutSessionId);
      }

      // ===== ÉTAPE 3 : Préparation des données pour Stripe =====
      const stripeItems = selectedItems.map((item) => ({
        stripePriceId: item.stripePriceId,
        quantity: item.quantity,
        name: item.name,
      }));

      // Construction des URLs de redirection
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/Panier?success=true&checkoutSessionId=${checkoutSessionId}`;
      const cancelUrl = `${baseUrl}/Panier?canceled=true&checkoutSessionId=${checkoutSessionId}`;

      // ===== ÉTAPE 4 : Appel de la Cloud Function Stripe avec checkoutSessionId =====
      // Le checkoutSessionId sera ajouté dans les métadonnées Stripe pour le webhook
      const result = await createCheckoutSession({
        items: stripeItems,
        successUrl: successUrl,
        cancelUrl: cancelUrl,
        checkoutSessionId: checkoutSessionId, // ID Firestore à lier avec Stripe via metadata
        shipping: {
          method: shippingMethod,      // "relay" ou "home"
          label: shippingLabel,         // texte
          price: shippingPrice,         // en euros côté front, converti en cents côté backend
        },
      });

      // ===== ÉTAPE 5 : Redirection vers la page de paiement Stripe =====
      if (result.data && result.data.url) {
        window.location.href = result.data.url;
      } else {
        throw new Error("Aucune URL de session retournée par Stripe");
      }
    } catch (error) {
      console.error("Erreur lors de la création de la session Stripe :", error);
      setError(
        error.message || "Une erreur est survenue lors de la création de la session de paiement."
      );
      setIsLoading(false);
    }
  };

  // Effet pour nettoyer les paramètres d'URL après affichage du message
  useEffect(() => {
    if (paymentSuccess || paymentCanceled) {
      // Nettoyer les paramètres d'URL après 5 secondes
      const timer = setTimeout(() => {
        setSearchParams({});
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [paymentSuccess, paymentCanceled, setSearchParams]);

  return (
    <section className="panier-page">
      <div className="panier-header">
        <h1>Mon panier</h1>
        <p>Retrouvez vos produits Vertyno et finalisez votre commande.</p>
      </div>

      {/* Messages de succès/annulation */}
      {paymentSuccess && (
        <div style={{
          backgroundColor: "#d4edda",
          color: "#155724",
          padding: "15px 20px",
          borderRadius: "8px",
          margin: "20px 0",
          border: "1px solid #c3e6cb",
        }}>
          <strong>✅ Paiement réussi !</strong> Votre commande a été confirmée. Vous recevrez un email de confirmation sous peu.
        </div>
      )}

      {paymentCanceled && (
        <div style={{
          backgroundColor: "#fff3cd",
          color: "#856404",
          padding: "15px 20px",
          borderRadius: "8px",
          margin: "20px 0",
          border: "1px solid #ffeaa7",
        }}>
          <strong>⚠️ Paiement annulé</strong> Votre panier est toujours disponible. Vous pouvez continuer vos achats ou réessayer le paiement.
        </div>
      )}

      <div className="panier-layout">
        <div className="panier-left">
          <div className="cart-list">
            {items.length ? (
              items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggle}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))
            ) : (
              <div className="panier-empty">
                <p>Votre panier est vide pour le moment.</p>
                <button className="panier-btn">Explorer les produits</button>
              </div>
            )}
          </div>

          <div className="cart-summary">
            <div className="summary-row">
              <span>Sous-total produits</span>
              <span>{currencyFormatter.format(productsTotal)}</span>
            </div>
            <div className="summary-row">
              <span>Livraison</span>
              <span className="summary-muted">
                {shippingPrice === 0 ? (
                  "Gratuite"
                ) : (
                  currencyFormatter.format(shippingPrice)
                )}
              </span>
            </div>
            <div className="summary-row total">
              <span>Total à payer</span>
              <strong>{currencyFormatter.format(orderTotal)}</strong>
            </div>
          </div>
        </div>

        <aside className="panier-right">
          <div className="payment-methods">
            <button
              className={paymentMethod === "card" ? "active" : ""}
              onClick={() => setPaymentMethod("card")}
            >
              Card
            </button>
            <button
              className={paymentMethod === "paypal" ? "active" : ""}
              onClick={() => setPaymentMethod("paypal")}
            >
              Paypal
            </button>
          </div>

          {paymentMethod === "card" ? (
            <form className="card-form" onSubmit={handleCheckout}>
              <h3 style={{ marginBottom: "20px" }}>Mode de livraison</h3>
              
              <div className="shipping-methods" style={{ marginBottom: "24px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", border: "1px solid #e6e6e6", borderRadius: "8px", cursor: "pointer", marginBottom: "8px" }}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="relay"
                    checked={shippingMethod === "relay"}
                    onChange={() => setShippingMethod("relay")}
                    style={{ cursor: "pointer" }}
                  />
                  <div style={{ flex: 1 }}>
                    <strong>Point relais</strong>
                    <span style={{ display: "block", fontSize: "0.9rem", color: "#666", marginTop: "4px" }}>
                      Livraison gratuite
                    </span>
                  </div>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px", border: "1px solid #e6e6e6", borderRadius: "8px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value="home"
                    checked={shippingMethod === "home"}
                    onChange={() => setShippingMethod("home")}
                    style={{ cursor: "pointer" }}
                  />
                  <div style={{ flex: 1 }}>
                    <strong>Livraison à domicile</strong>
                    <span style={{ display: "block", fontSize: "0.9rem", color: "#666", marginTop: "4px" }}>
                      {productsTotal >= 45
                        ? "Gratuite (commande ≥ 45€)"
                        : `${shippingPrice.toFixed(2).replace(".", ",")} €`}
                    </span>
                  </div>
                </label>
              </div>

              {/* Sélection du point relais si mode relay */}
              {shippingMethod === "relay" && (
                <div style={{ marginBottom: "24px", marginTop: "-8px" }}>
                  {/* Carte des points relais */}
                  <div
                    id="parcel-point-map"
                    style={{
                      width: "100%",
                      height: "320px",
                      borderRadius: "12px",
                      border: "1px solid #f0e0d8",
                      overflow: "hidden",
                      marginBottom: "12px",
                    }}
                  />

                  {/* Bouton pour relancer une recherche si le client change l'adresse */}
                  <button
                    type="button"
                    onClick={openRelayPicker}
                    style={{
                      padding: "10px 16px",
                      borderRadius: "8px",
                      border: "1px solid #FFB6C1",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      color: "#4b3b36",
                      fontWeight: "500",
                      transition: "all 0.2s ease",
                      width: "100%",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = "#FFF0F2";
                      e.target.style.borderColor = "#FFA8B8";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#fff";
                      e.target.style.borderColor = "#FFB6C1";
                    }}
                  >
                    {relayPoint ? "Changer de point relais" : "Rechercher les points relais"}
                  </button>

                  {relayPoint && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "12px",
                        background: "#fdf7f3",
                        borderRadius: "8px",
                        border: "1px solid #f0e0d8",
                        fontSize: "0.9rem",
                        color: "#4b3b36",
                      }}
                    >
                      <strong style={{ display: "block", marginBottom: "6px" }}>
                        Point relais sélectionné :
                      </strong>
                      <div style={{ marginBottom: "4px" }}>{relayPoint.name}</div>
                      <div style={{ marginBottom: "4px" }}>{relayPoint.street}</div>
                      <div>
                        {relayPoint.postalCode || relayPoint.postal_code} {relayPoint.city}
                      </div>
                      {relayPoint.network && (
                        <div style={{ marginTop: "4px", fontSize: "0.8rem", color: "#888" }}>
                          Réseau : {relayPoint.network}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <h3 style={{ marginBottom: "20px", marginTop: "32px" }}>Informations de livraison</h3>
              
              <div className="form-row">
                <label>
                  Nom *
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleInputChange}
                    placeholder="Votre nom"
                    required
                  />
                </label>
                <label>
                  Prénom *
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleInputChange}
                    placeholder="Votre prénom"
                    required
                  />
                </label>
              </div>

              <label>
                Adresse *
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleInputChange}
                  placeholder="Numéro et nom de rue"
                  required
                />
              </label>

              <label>
                Complément d'adresse
                <input
                  type="text"
                  name="complementAdresse"
                  value={formData.complementAdresse}
                  onChange={handleInputChange}
                  placeholder="Appartement, étage, etc. (optionnel)"
                />
              </label>

              <div className="form-row">
                <label>
                  Ville *
                  <input
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleInputChange}
                    placeholder="Votre ville"
                    required
                  />
                </label>
                <label>
                  Code postal *
                  <input
                    type="text"
                    name="codePostal"
                    value={formData.codePostal}
                    onChange={handleInputChange}
                    placeholder="75001"
                    required
                  />
                </label>
              </div>

              <div className="form-row">
                <label>
                  Téléphone *
                  <input
                    type="tel"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    placeholder="06 12 34 56 78"
                    required
                  />
                </label>
                <label>
                  E-mail *
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="votre@email.com"
                    required
                  />
                </label>
              </div>

              <button
                type="submit"
                className="pay-btn"
                disabled={isLoading || orderTotal === 0}
              >
                {isLoading ? "Chargement..." : `Payer ${currencyFormatter.format(orderTotal)}`}
              </button>
              {error && (
                <div className="error-message" style={{ color: "red", marginTop: "10px", fontSize: "14px" }}>
                  {error}
                </div>
              )}
            </form>
          ) : (
            <div className="paypal-placeholder">
              <p>
                Connectez votre compte Paypal lors de la prochaine étape pour
                finaliser le paiement.
              </p>
              <button type="button" className="pay-btn">
                Continuer avec Paypal
              </button>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}


