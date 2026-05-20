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

  const loginHref = useMemo(() => {
    if (typeof window === 'undefined') return '/login';
    return `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
  }, []);

  if (!current) return null;

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(total - 1, i + 1));

  const handlePick = (optIndex) => {
    setPicks((prev) => ({ ...prev, [index]: optIndex }));
    setRevealed((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <section className="suggested-quiz" aria-labelledby="suggested-quiz-heading">
      <header className="suggested-quiz__head">
        <h3 id="suggested-quiz-heading">Suggested Quiz</h3>
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

      <div className="suggested-quiz__body">
        {lessonTitle ? (
          <p className="suggested-quiz__context">{lessonTitle}</p>
        ) : null}
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
            Login to View Explanation
          </Link>
        )}
        <span className="suggested-quiz__progress">
          {index + 1}/{total}
        </span>
        <div className="suggested-quiz__nav">
          <button
            type="button"
            className="suggested-quiz__nav-btn"
            disabled={index === 0}
            onClick={goPrev}
          >
            &lt; Previous
          </button>
          <button
            type="button"
            className="suggested-quiz__nav-btn suggested-quiz__nav-btn--next"
            disabled={index >= total - 1}
            onClick={goNext}
          >
            Next &gt;
          </button>
        </div>
      </footer>
    </section>
  );
}
