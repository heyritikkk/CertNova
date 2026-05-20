import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import {
  SUGGESTED_QUIZ_SIZE,
  createDefaultSuggestedQuiz,
  normalizeSuggestedQuiz,
} from '../lib/suggestedQuiz';
import './SuggestedQuizEditor.css';

export default function SuggestedQuizEditor({ block, updateBlock }) {
  const [open, setOpen] = useState(false);
  const questions =
    normalizeSuggestedQuiz(block.suggestedQuiz) || createDefaultSuggestedQuiz();

  const setQuestions = (next) => {
    updateBlock(block.id, { suggestedQuiz: next });
  };

  const updateQuestion = (qIndex, patch) => {
    const next = questions.map((q, i) => (i === qIndex ? { ...q, ...patch } : q));
    setQuestions(next);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const q = questions[qIndex];
    const options = [...q.options];
    options[optIndex] = value;
    updateQuestion(qIndex, { options });
  };

  return (
    <div className="suggested-quiz-editor">
      <button
        type="button"
        className="suggested-quiz-editor__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span>Suggested Quiz ({SUGGESTED_QUIZ_SIZE} questions)</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open ? (
        <div className="suggested-quiz-editor__panel">
          <p className="suggested-quiz-editor__hint">
            Shown at the end of this sub-lesson on the learn page. Leave blank fields to use
            auto-generated placeholders.
          </p>
          {questions.map((q, qIndex) => (
            <div className="suggested-quiz-editor__card" key={q.id || qIndex}>
              <h5>Question {qIndex + 1}</h5>
              <label>
                Prompt
                <textarea
                  rows={2}
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
                  placeholder="What does…?"
                />
              </label>
              {q.options.map((opt, optIndex) => (
                <label key={optIndex} className="suggested-quiz-editor__option">
                  <input
                    type="radio"
                    name={`sq-correct-${block.id}-${qIndex}`}
                    checked={q.correctIndex === optIndex}
                    onChange={() => updateQuestion(qIndex, { correctIndex: optIndex })}
                  />
                  Option {String.fromCharCode(65 + optIndex)}
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                  />
                </label>
              ))}
              <label>
                Explanation (after login)
                <textarea
                  rows={2}
                  value={q.explanation || ''}
                  onChange={(e) => updateQuestion(qIndex, { explanation: e.target.value })}
                  placeholder="Why the correct answer is right…"
                />
              </label>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
