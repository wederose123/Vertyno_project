import { useEffect } from "react";
import LiliImage from "../../assets/Produits/lili-produits.jpg";
import LoulouImage from "../../assets/Produits/loulou-produits.jpg";
import MochiImage from "../../assets/Produits/mochi-produits.jpg";
import DinoImage from "../../assets/Produits/dino-produits.jpg";

export const productsData = [
  {
    id: "lililalicorne",
    slug: "lililalicorne",
    name: "Lili la licorne",
    category: "Veilleuse",
    price: 24.9,
    image: LiliImage,
    stripePriceId: "price_1SY3UzErrcOQOQOZtnsHYfMq" 
  },
  {
    id: "louloulechien",
    slug: "louloulechien",
    name: "Loulou le chien",
    category: "Veilleuse",
    price: 24.9,
    image: LoulouImage,
    stripePriceId: "price_XXXXXXXXXXXXX" // ⚠️ À remplacer par le Price ID Stripe depuis votre Dashboard
  },
  {
    id: "mochilepanda",
    slug: "mochilepanda",
    name: "Mochi le panda",
    category: "Veilleuse",
    price: 24.9,
    image: MochiImage,
    stripePriceId: "price_XXXXXXXXXXXXX" // ⚠️ À remplacer par le Price ID Stripe depuis votre Dashboard
  },
  {
    id: "dinoledinosaure",
    slug: "dinoledinosaure",
    name: "Dino le dinosaure",
    category: "Veilleuse",
    price: 24.9,
    image: DinoImage,
    stripePriceId: "price_XXXXXXXXXXXXX" // ⚠️ À remplacer par le Price ID Stripe depuis votre Dashboard
  }
];

export function getProductBySlug(slug) {
  return productsData.find((product) => product.slug === slug);
}

/**
 * ProductComponent n'affiche rien à l'écran.
 * Il informe simplement le parent lorsqu'un produit correspondant au slug est trouvé.
 */
export default function ProductComponent({ slug, onProductReady }) {
  useEffect(() => {
    const product = getProductBySlug(slug);
    if (product && typeof onProductReady === "function") {
      onProductReady(product);
    }
  }, [slug, onProductReady]);

  return null;
}

