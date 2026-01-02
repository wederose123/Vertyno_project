import { useEffect, useRef } from "react";

/**
 * Hook personnalisé pour créer une animation de "vol" d'un élément vers le panier
 * 
 * @param {Function} onComplete - Callback appelé à la fin de l'animation
 * @returns {Function} Fonction à appeler pour déclencher l'animation
 */
export function useFlyToCart(onComplete) {
  const animationRef = useRef(null);

  /**
   * Déclenche l'animation depuis un bouton source vers le bouton panier
   * 
   * @param {HTMLElement} sourceButton - Le bouton "Commander" (ref)
   * @param {HTMLElement} targetButton - Le bouton "Panier" dans le Header (ref)
   */
  const triggerAnimation = (sourceButton, targetButton) => {
    if (!sourceButton || !targetButton) {
      console.warn("Boutons source ou cible non trouvés pour l'animation");
      return;
    }

    // Récupération des positions des boutons
    const sourceRect = sourceButton.getBoundingClientRect();
    const targetRect = targetButton.getBoundingClientRect();

    // Calcul des positions de départ et d'arrivée
    const startX = sourceRect.left + sourceRect.width / 2;
    const startY = sourceRect.top + sourceRect.height / 2;
    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    // Création de l'élément animé (petit cercle)
    const flyingElement = document.createElement("div");
    flyingElement.style.cssText = `
      position: fixed;
      width: 20px;
      height: 20px;
      background-color: #333;
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      left: ${startX}px;
      top: ${startY}px;
      transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    `;

    document.body.appendChild(flyingElement);

    // Force un reflow pour que le navigateur applique le style initial
    void flyingElement.offsetHeight;

    // Déclenchement de l'animation vers la cible
    requestAnimationFrame(() => {
      flyingElement.style.left = `${endX}px`;
      flyingElement.style.top = `${endY}px`;
      flyingElement.style.transform = "scale(0.3)";
      flyingElement.style.opacity = "0.7";
    });

    // Nettoyage après la fin de l'animation
    setTimeout(() => {
      if (flyingElement.parentNode) {
        flyingElement.parentNode.removeChild(flyingElement);
      }
      if (onComplete) {
        onComplete();
      }
    }, 600);

    animationRef.current = flyingElement;
  };

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      if (animationRef.current && animationRef.current.parentNode) {
        animationRef.current.parentNode.removeChild(animationRef.current);
      }
    };
  }, []);

  return triggerAnimation;
}

