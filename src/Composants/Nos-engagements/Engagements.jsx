import "../../styles//Engagements/Engagements.css";

export default function Engagements() {
  const engagements = [
    {
      icon: "bi bi-check-circle",
      titre: "Sécurité & normes CE",
    },
    {
      icon: "bi bi-flower1",
      titre: "Matériaux responsables",
    },
    {
      icon: "bi bi-palette",
      titre: "Design ludique",
    },
    {
      icon: "bi bi-emoji-smile",
      titre: "Facilité d’utilisation",
    },
  ];

  return (
    <div className="engagements-section">
      <h2 className="engagements-titre">Nos engagements</h2>
      <div className="engagements-liste">
        {engagements.map((item, index) => (
          <div className="engagement" key={index}>
            <i className={`engagement-icon ${item.icon}`}></i>
            <p className="engagement-texte">{item.titre}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
