import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { SUGGESTED_QUIZ_SIZE } from '../lib/suggestedQuiz';
import './SuggestedQuiz.css';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function SuggestedQuiz({ questions, lessonTitle }) {
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState({});
  const [revealed, setRevealed] = useState({});

  const total = questions?.length || SUGGESTED_QUIZ_SIZE;
  const current = questions?.[index];
  const isLoggedIn =
    typeof window !== 'undefined' && localStorage.getItem('userAuth') === 'true';

  const reset = useCallback(() => {
    setIndex(0);
    setPicks({});
    setRevealed({});
  }, []);

  const currentPick = picks[index];
  const isRevealed = Boolean(revealed[index]);
  const isCorrect = isRevealed && currentPick === current?.correctIndex;
  const answeredCount = Object.keys(revealed).length;

  const loginHref = useMemo(() => {
    if (typeof window === 'undefined') return '/login';
    return `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
  }, []);

  if (!current) return null;

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(total - 1, i + 1));
  const goTo = (i) => setIndex(i);

  const handlePick = (optIndex) => {
    setPicks((prev) => ({ ...prev, [index]: optIndex }));
    setRevealed((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <section className="suggested-quiz" aria-labelledby="suggested-quiz-heading">
      <header className="suggested-quiz__head">
        <div className="suggested-quiz__head-text">
          <h3 id="suggested-quiz-heading">Suggested Quiz</h3>
          <p className="suggested-quiz__sub">
            {answeredCount} of {total} answered
            {lessonTitle ? ` · ${lessonTitle}` : ''}
          </p>
        </div>
        <button
          type="button"
          className="suggested-quiz__refresh"
          onClick={reset}
          title="Restart quiz"
        >
          <RotateCcw size={15} aria-hidden />
          <span>{total} Questions</span>
        </button>
      </header>

      <div className="suggested-quiz__steps" role="tablist" aria-label="Quiz questions">
        {Array.from({ length: total }, (_, i) => {
          const answered = revealed[i] != null;
          const correct = answered && picks[i] === questions[i]?.correctIndex;
          return (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Question ${i + 1}${answered ? (correct ? ', correct' : ', incorrect') : ''}`}
              className={`suggested-quiz__step${i === index ? ' is-active' : ''}${
                answered ? (correct ? ' is-correct' : ' is-wrong') : ''
              }`}
              onClick={() => goTo(i)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="suggested-quiz__body">
        <p className="suggested-quiz__question">{current.question}</p>
        <ul className="suggested-quiz__options" role="listbox" aria-label="Answer choices">
          {current.options.map((opt, optIndex) => {
            const selected = currentPick === optIndex;
            const showCorrect = isRevealed && optIndex === current.correctIndex;
            const showWrong = isRevealed && selected && optIndex !== current.correctIndex;
            return (
              <li key={optIndex}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={`suggested-quiz__option${selected ? ' is-selected' : ''}${
                    showCorrect ? ' is-correct' : ''
                  }${showWrong ? ' is-wrong' : ''}`}
                  onClick={() => handlePick(optIndex)}
                  disabled={isRevealed && !selected && !showCorrect}
                >
                  <span className="suggested-quiz__letter">{LETTERS[optIndex]}</span>
                  <span className="suggested-quiz__option-text">{opt}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {isRevealed ? (
          <p
            className={`suggested-quiz__inline-feedback${
              isCorrect ? ' is-correct' : ' is-wrong'
            }`}
          >
            {isCorrect ? 'Correct!' : 'Not quite — review the lesson and try again.'}
          </p>
        ) : null}
      </div>

      <footer className="suggested-quiz__foot">
        {isLoggedIn && current.explanation ? (
          <p className="suggested-quiz__explanation">{current.explanation}</p>
        ) : (
          <Link to={loginHref} className="suggested-quiz__login-link">
            Login to view explanation
          </Link>
        )}
        <div className="suggested-quiz__foot-nav">
          <span className="suggested-quiz__progress">
            Question {index + 1} of {total}
          </span>
          <div className="suggested-quiz__nav">
            <button
              type="button"
              className="suggested-quiz__nav-btn"
              disabled={index === 0}
              onClick={goPrev}
            >
              Previous
            </button>
            <button
              type="button"
              className="suggested-quiz__nav-btn suggested-quiz__nav-btn--next"
              disabled={index >= total - 1}
              onClick={goNext}
            >
              Next
            </button>
          </div>
        </div>
      </footer>
    </section>
  );
}
