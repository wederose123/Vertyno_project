// Installation requise (dans ton terminal) :
// npm install swiper

// FAQSlider.jsx
/*import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import '../../styles/Faq/Faq.css';
import { useState } from 'react';
import img1 from '../../assets/home-page/QuatreVeilleuse.png';
import img2 from '../../assets/home-page/QuatreVeilleuse.png';

export default function FAQSlider() {
  const faqData = [
    {
      question: 'Vos produits sont-ils sans danger pour les enfants ?',
      answer:
        'Oui, nos produits respectent les normes CE et sont fabriqués avec des matériaux sans danger.',
      image: img1,
    },
    {
      question: 'Quels matériaux utilisez-vous ?',
      answer: 'Nous utilisons du silicone alimentaire et du bois naturel.',
      image: img2,
    },
    {
      question: 'Quels matériaux utilisez-vous ?',
      answer: 'Nous utilisons du silicone alimentaire et du bois naturel.',
      image: img2,
    },
  ];

  const [showAnswers, setShowAnswers] = useState(faqData.map(() => false));

  const toggleAnswer = (index) => {
    const newShowAnswers = [...showAnswers];
    newShowAnswers[index] = !newShowAnswers[index];
    setShowAnswers(newShowAnswers);
  };

  return (
    <div className="faq-container">
      <Swiper
        modules={[Navigation]}
        navigation
        loop={true}
        slidesPerView={1.2}
        centeredSlides
        className="faq-swiper"
      >
        {faqData.map((item, index) => (
          <SwiperSlide key={index} className="faq-slide">
            <img src={item.image} alt="FAQ" className="faq-image" />
            <div className="faq-overlay">
              <h2 className="faq-label">FAQ</h2>
              <p className="faq-question">{item.question}</p>
              {showAnswers[index] && (
                <p className="faq-answer">{item.answer}</p>
              )}
              <button className="faq-toggle" onClick={() => toggleAnswer(index)}>
                {showAnswers[index] ? '-' : '+'}
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}*/
// FaqSlider.jsx
import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import "../../styles/Faq/Faq.css";
import faq from "../../assets/home-page/Faq/faq.jpg"; 


// Composant principal
export default function Faq() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [showAnswer, setShowAnswer] = useState(false);

  const faqData = [
    {
      question: "Vos produits sont-ils sans danger pour les enfants ?",
      answer:
        "Oui, nos produits respectent les normes CE et sont fabriqués avec des matériaux sans danger.",
      image: faq,
    },
    {
      question: "Comment entretenir les assiettes en bambou ?",
      answer: "Lavez-les à la main avec de l’eau tiède et du savon doux. Évitez le lave-vaisselle pour préserver leur durabilité.",
      image: faq,
    },
    {
      question: "Les lampes en silicone sont-elles rechargeables ?",
      answer: "Oui, elles fonctionnent avec une batterie rechargeable incluse et offrent une longue autonomie.",
      image: faq,
    },
    {
      question: "Expédiez-vous en dehors de la France ?",
      answer: "Actuellement, nous vendons principalement via Etsy, qui propose des livraisons dans plusieurs pays européens.",
      image: faq,
    },
    {
      question: "Comment contacter le service client",
      answer: "Vous pouvez nous joindre via la page contact, nous vous répondrons dans les plus brefs délais.",
      image: faq,
    },
    // Ajoute d'autres slides ici
  ];

  // --- FONCTIONS FLÈCHES ---
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
    setShowAnswer(false);
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
    setShowAnswer(false);
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  return (
    <section className="faq-section">
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {faqData.map((item, index) => (
            <div className="embla__slide" key={index}>
              <img src={item.image} alt="FAQ" className="faq-image" />
              <div className="faq-overlay">
                <h2 className="faq-label">FAQ</h2>
                <p className="faq-question">{item.question}</p>
                {showAnswer && <p className="faq-answer">{item.answer}</p>}
                <button
                  className="faq-toggle"
                  onClick={() => setShowAnswer(!showAnswer)}
                >
                  {showAnswer ? "-" : "+"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Flèches intégrées dans le carrousel */}
        <button
          className="embla__button embla__button--prev"
          onClick={onPrevButtonClick}
          disabled={prevBtnDisabled}
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        <button
          className="embla__button embla__button--next"
          onClick={onNextButtonClick}
          disabled={nextBtnDisabled}
        >
          <i className="bi bi-chevron-right"></i>
        </button>
      </div>
    </section>
  );
}
