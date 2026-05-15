import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './Faq.css';

const faqItems = [
  {
    question: 'How does CertNova help me prepare for Security+?',
    answer:
      'CertNova combines structured lessons, guided labs, and focused exam prep so you can build real understanding instead of memorizing facts.',
  },
  {
    question: 'Are the labs beginner-friendly?',
    answer:
      'Yes. Labs are designed with step-by-step guidance and include practical scenarios that gradually increase in difficulty as your skills improve.',
  },
  {
    question: 'Do you provide mock tests similar to the real exam?',
    answer:
      'Yes. You get exam-style practice tests that mirror timing and question patterns to help you identify weak areas before test day.',
  },
  {
    question: 'Can I learn at my own pace?',
    answer:
      'Absolutely. Your progress is tracked automatically, and you can continue from where you left off on desktop or web.',
  },
  {
    question: 'Is this platform suitable for career switchers?',
    answer:
      'Definitely. CertNova is built for beginners and career changers who want a practical, confidence-building path into cybersecurity.',
  },
];

const Faq = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="faq-section">
      <div className="faq-container">
        <div className="faq-left">
          <span className="faq-kicker">FAQ</span>
          <h2>
            Got Questions?
            <br />
            We&apos;ve the Answers
          </h2>
          <p>
            Everything you need to know about learning with CertNova and preparing for the CompTIA Security+ exam.
          </p>
          <button className="faq-btn">Ask Your Question</button>
        </div>

        <div className="faq-right">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div className={`faq-item ${isOpen ? 'open' : ''}`} key={item.question}>
                <button
                  className="faq-question"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  type="button"
                >
                  <span>{item.question}</span>
                  <ChevronDown size={18} className={`faq-icon ${isOpen ? 'rotated' : ''}`} />
                </button>
                {isOpen && <div className="faq-answer">{item.answer}</div>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Faq;
