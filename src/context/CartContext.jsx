import { createContext, useContext, useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../Firebase/firebase-config";

/**
 * CartContext : Contexte global pour gérer le compteur du panier
 * Il écoute en temps réel la collection Firestore "panier" et calcule
 * le total des quantités de tous les articles.
 */
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Écoute en temps réel de la collection "panier" dans Firestore
    const panierRef = collection(db, "panier");

    const unsubscribe = onSnapshot(panierRef, (snapshot) => {
      // Calcul du total des quantités de tous les articles
      let total = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        // On additionne la quantité de chaque article (par défaut 1 si non défini)
        total += data.quantity ?? 1;
      });

      // Mise à jour du compteur global
      setCartCount(total);
    });

    // Nettoyage de l'écouteur lors du démontage
    return () => unsubscribe();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount }}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook pour utiliser le contexte panier
 */
export function useCartCount() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartCount doit être utilisé à l'intérieur d'un CartProvider");
  }
  return context;
}

