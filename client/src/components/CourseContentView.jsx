import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CheckCircle2, XCircle } from 'lucide-react';
import { courseToContentBlocks } from '../lib/contentBlocks';
import { PlantUMLRenderer } from './PlantUMLRenderer';
import './CourseContentView.css';

const CourseContentView = ({ course }) => {
  const blocks = courseToContentBlocks(course);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const quizBlocks = blocks.filter((b) => b.type === 'quiz' && b.question?.trim());
  const hasContent = blocks.some(
    (b) => (b.type === 'markdown' && b.content?.trim()) || (b.type === 'quiz' && b.question?.trim())
  );

  if (!hasContent) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const score = quizBlocks.reduce((acc, block, i) => {
    const picked = answers[block.id || i];
    return acc + (picked === block.correctIndex ? 1 : 0);
  }, 0);

  return (
    <section className="course-content-view">
      <h2>Course content</h2>
      {blocks.map((block, index) => {
        if (block.type === 'markdown' && block.content?.trim()) {
          return (
            <div key={block.id || index} className="course-content-markdown prose">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(plantuml|puml)/i.exec(className || '');
                    if (!inline && match) {
                      return (
                        <PlantUMLRenderer
                          code={String(children).replace(/\n$/, '')}
                        />
                      );
                    }
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {block.content}
              </ReactMarkdown>
            </div>
          );
        }

        if (block.type === 'quiz' && block.question?.trim()) {
          const blockKey = block.id || `quiz-${index}`;
          const picked = answers[blockKey];
          const isCorrect = submitted && picked === block.correctIndex;
          const isWrong = submitted && picked !== undefined && picked !== block.correctIndex;

          return (
            <fieldset key={blockKey} className="course-content-quiz-card">
              <legend>{block.question}</legend>
              {(block.options || []).map((opt, optIndex) => (
                <label
                  key={optIndex}
                  className={`quiz-take-option${picked === optIndex ? ' selected' : ''}${
                    submitted && optIndex === block.correctIndex ? ' correct' : ''
                  }${submitted && picked === optIndex && optIndex !== block.correctIndex ? ' wrong' : ''}`}
                >
                  <input
                    type="radio"
                    name={blockKey}
                    checked={picked === optIndex}
                    disabled={submitted}
                    onChange={() => setAnswers((prev) => ({ ...prev, [blockKey]: optIndex }))}
                  />
                  <span>{opt}</span>
                  {submitted && optIndex === block.correctIndex ? (
                    <CheckCircle2 size={18} className="quiz-mark correct" />
                  ) : null}
                  {isWrong && picked === optIndex ? (
                    <XCircle size={18} className="quiz-mark wrong" />
                  ) : null}
                </label>
              ))}
              {submitted && isCorrect ? <p className="quiz-feedback correct">Correct!</p> : null}
              {isWrong ? <p className="quiz-feedback wrong">Not quite. Review the lesson.</p> : null}
            </fieldset>
          );
        }

        return null;
      })}

      {quizBlocks.length > 0 && !submitted ? (
        <form onSubmit={handleSubmit}>
          <button type="submit" className="quiz-submit-btn">
            Submit quiz
          </button>
        </form>
      ) : null}

      {submitted && quizBlocks.length > 0 ? (
        <p className="quiz-score">
          Score: {score} / {quizBlocks.length}
        </p>
      ) : null}
    </section>
  );
};

export default CourseContentView;
