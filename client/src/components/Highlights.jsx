import React, { useEffect, useState } from 'react';
import { Headphones, Workflow, Gauge } from 'lucide-react';
import './Highlights.css';

const iconMap = {
  Headphones,
  Workflow,
  Gauge,
};

const Highlights = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/highlights')
      .then((res) => res.json())
      .then((data) => {
        setCards(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load highlight cards:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <section className="highlights-section"><p className="highlights-loading">Loading highlights…</p></section>;
  }

  return (
    <section className="highlights-section">
      <div className="highlights-grid">
        {cards.map((card, index) => {
          const Icon = iconMap[card.icon_name] || Headphones;
          return (
            <article className="highlight-card" key={card.id}>
              <div className="highlight-visual">
                <div className="highlight-icon-wrap">
                  <Icon size={30} className="highlight-icon" />
                </div>
              </div>
              <div className="highlight-content">
                <h3>
                  <span className="highlight-badge">{index + 1}</span>
                  {card.title}
                </h3>
                <p>{card.text}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default Highlights;
