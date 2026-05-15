import { Plus, Trash2 } from 'lucide-react';
import './QuizBuilder.css';

const emptyQuestion = () => ({
  id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  question: '',
  options: ['', '', '', ''],
  correctIndex: 0,
});

const QuizBuilder = ({ quiz = [], onChange }) => {
  const questions = quiz.length ? quiz : [];

  const updateQuestion = (index, patch) => {
    const next = questions.map((q, i) => (i === index ? { ...q, ...patch } : q));
    onChange(next);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const q = questions[qIndex];
    const options = [...q.options];
    options[optIndex] = value;
    updateQuestion(qIndex, { options });
  };

  const addQuestion = () => onChange([...questions, emptyQuestion()]);

  const removeQuestion = (index) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const addOption = (qIndex) => {
    const q = questions[qIndex];
    updateQuestion(qIndex, { options: [...q.options, ''] });
  };

  const removeOption = (qIndex, optIndex) => {
    const q = questions[qIndex];
    if (q.options.length <= 2) return;
    const options = q.options.filter((_, i) => i !== optIndex);
    const correctIndex =
      q.correctIndex >= options.length ? options.length - 1 : q.correctIndex;
    updateQuestion(qIndex, { options, correctIndex });
  };

  return (
    <div className="quiz-builder">
      {questions.length === 0 ? (
        <p className="quiz-builder-empty">
          No quiz questions yet. Add questions learners must answer after the lesson.
        </p>
      ) : (
        questions.map((q, qIndex) => (
          <div className="quiz-question-card" key={q.id || qIndex}>
            <motionQuizHeader qIndex={qIndex} onRemove={() => removeQuestion(qIndex)} />
            <label className="quiz-label">Question</label>
            <textarea
              value={q.question}
              onChange={(e) => updateQuestion(qIndex, { question: e.target.value })}
              rows={2}
              placeholder="e.g. What is the primary goal of defense in depth?"
            />
            <p className="quiz-options-title">Answer options (select the correct one)</p>
            {q.options.map((opt, optIndex) => (
              <div className="quiz-option-row" key={optIndex}>
                <input
                  type="radio"
                  name={`correct-${q.id || qIndex}`}
                  checked={q.correctIndex === optIndex}
                  onChange={() => updateQuestion(qIndex, { correctIndex: optIndex })}
                  title="Mark as correct answer"
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                  placeholder={`Option ${optIndex + 1}`}
                />
                <button
                  type="button"
                  className="quiz-icon-btn"
                  onClick={() => removeOption(qIndex, optIndex)}
                  disabled={q.options.length <= 2}
                  aria-label="Remove option"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button type="button" className="quiz-text-btn" onClick={() => addOption(qIndex)}>
              + Add option
            </button>
          </div>
        ))
      )}
      <button type="button" className="quiz-add-btn" onClick={addQuestion}>
        <Plus size={18} /> Add question
      </button>
    </div>
  );
};

function motionQuizHeader({ qIndex, onRemove }) {
  return (
    <div className="quiz-question-header">
      <strong>Question {qIndex + 1}</strong>
      <button type="button" className="quiz-icon-btn danger" onClick={onRemove} aria-label="Remove question">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default QuizBuilder;
