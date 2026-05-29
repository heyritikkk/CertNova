import { useEffect, useState, useMemo } from 'react';
import { Clock, Flag, RotateCcw, CheckCircle2, XCircle, AlertTriangle, BookOpen, Award } from 'lucide-react';
import { getRandomKnowledgeCheck, evaluateKnowledgeCheckPerformance } from '../lib/knowledgeCheckQuiz';
import './ModuleExamPortal.css'; // Reuse the same CSS

const EXAM_DURATION = 1800; // 30 minutes in seconds

export default function KnowledgeCheckPortal({ courseId, onComplete, isCompleted }) {
  const [questions, setQuestions] = useState([]);
  
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(EXAM_DURATION);
  const [timeTaken, setTimeTaken] = useState(0);

  // Load existing completion state if they completed it before
  useEffect(() => {
    setExamStarted(false);
    setExamFinished(false);
    setCurrentIdx(0);
    setAnswers({});
    setMarkedForReview({});
    setTimeLeft(EXAM_DURATION);
  }, [courseId]);

  // Countdown timer effect
  useEffect(() => {
    if (!examStarted || examFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishExam(true); // Auto-submit on time exhaustion
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, examFinished]);

  const handleStartExam = () => {
    // Pick 20 random questions when starting
    setQuestions(getRandomKnowledgeCheck(20));
    setExamStarted(true);
    setExamFinished(false);
    setTimeLeft(EXAM_DURATION);
  };

  const handleFinishExam = (autoSubmitted = false) => {
    setExamFinished(true);
    const taken = EXAM_DURATION - timeLeft;
    setTimeTaken(taken);
    
    // Calculate final score
    const score = questions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correctIndex ? 1 : 0);
    }, 0);
    
    const passed = (score / questions.length) >= 0.75; // 75% passing threshold
    
    if (passed && onComplete) {
      onComplete(`knowledge-check-${courseId}`);
    }

    if (autoSubmitted) {
      alert("Time is up! Your exam has been automatically submitted.");
    }
  };

  const handleRetakeExam = () => {
    setAnswers({});
    setMarkedForReview({});
    setCurrentIdx(0);
    setTimeLeft(EXAM_DURATION);
    setExamFinished(false);
    
    // Fetch a new set of 20 random questions
    setQuestions(getRandomKnowledgeCheck(20));
    
    setExamStarted(true);
  };

  const selectAnswer = (qId, optionIdx) => {
    setAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const toggleMarkReview = (qId) => {
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Performance computations
  const scoreCount = questions.reduce((acc, q) => {
    return acc + (answers[q.id] === q.correctIndex ? 1 : 0);
  }, 0);
  const scorePercentage = questions.length > 0 ? Math.round((scoreCount / questions.length) * 100) : 0;
  const passed = scorePercentage >= 75;

  const performanceReport = useMemo(() => {
    if (!examFinished) return { pros: [], cons: [] };
    return evaluateKnowledgeCheckPerformance(questions, answers);
  }, [examFinished, questions, answers]);

  // Format time (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins}m ${secs}s`;
  };

  // Welcome Intro View
  if (!examStarted && !examFinished) {
    return (
      <div className="exam-portal exam-portal--intro">
        <div className="exam-intro-badge">
          <Award size={28} className="intro-badge-icon" />
          <span>Security+ Knowledge Check</span>
        </div>
        
        <h2>Randomized Practice Exam</h2>
        <p className="exam-intro-desc">
          Test your comprehension of all Security+ concepts. Each time you start this knowledge check, you'll be given 20 randomly selected questions from a larger pool of 50.
        </p>

        <div className="exam-metrics-grid">
          <div className="exam-metric-card">
            <strong>20 Questions</strong>
            <span>Multiple Choice</span>
          </div>
          <div className="exam-metric-card">
            <strong>30 Minutes</strong>
            <span>Active Countdown Timer</span>
          </div>
          <div className="exam-metric-card">
            <strong>75% Pass Rate</strong>
            <span>15+ Correct Answers Required</span>
          </div>
        </div>

        <div className="exam-rules-list">
          <h3>Exam Instructions:</h3>
          <ul>
            <li>Once you click <strong>"Start Practice Exam"</strong>, the 30-minute timer will begin ticking down immediately.</li>
            <li>You can jump between questions in any order using the question navigation matrix on the side.</li>
            <li>Use the <strong>"Mark for Review"</strong> flag to flag complex questions you wish to review before submitting.</li>
            <li>If the timer runs out, your active selections will be submitted automatically.</li>
            <li>Upon completion, you will receive a detailed performance audit.</li>
          </ul>
        </div>

        <button type="button" className="exam-start-btn" onClick={handleStartExam}>
          Start Practice Exam
        </button>
      </div>
    );
  }

  // Active Test Portal View
  if (examStarted && !examFinished) {
    return (
      <div className="exam-portal exam-portal--active">
        <div className="exam-active-header">
          <div className="exam-back-header">
            <span className="exam-back-arrow">←</span> Security+ Knowledge Check
          </div>
        </div>

        <div className="exam-active-layout">
          {/* Main Question Panel */}
          <div className="exam-question-panel">
            {questions.map((q, idx) => {
              const isMarked = markedForReview[q.id];
              return (
                <div key={q.id} id={`question-${idx}`} className="exam-question-card">
                  <div className="exam-question-header">
                    <span className="question-number-badge">Question {idx + 1}</span>
                    <div className="exam-question-header-actions">
                      <span className="question-marks-badge">1.00 Marks</span>
                      <button 
                        type="button" 
                        className={`exam-flag-btn ${isMarked ? 'flagged' : ''}`}
                        onClick={() => toggleMarkReview(q.id)}
                        title={isMarked ? 'Remove Flag' : 'Flag for Review'}
                      >
                        <Flag size={15} />
                      </button>
                    </div>
                  </div>

                  <p className="exam-question-text">{q.question}</p>

                  <div className="exam-options-list">
                    <div className="exam-options-title">Select one:</div>
                    {q.options.map((opt, optIndex) => {
                      const isSelected = answers[q.id] === optIndex;
                      return (
                        <label 
                          key={optIndex} 
                          className={`exam-option-label ${isSelected ? 'is-selected' : ''}`}
                        >
                          <input 
                            type="radio" 
                            name={q.id}
                            checked={isSelected}
                            onChange={() => selectAnswer(q.id, optIndex)}
                          />
                          <span className="option-text">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Matrix Panel (Sticky Sidebar) */}
          <div className="exam-nav-sidebar">
            <div className={`exam-timer ${timeLeft < 180 ? 'timer-warning' : ''}`}>
              <span>Time left <strong>{formatTime(timeLeft)}</strong></span>
            </div>

            <div className="exam-nav-sidebar-box">
              <h4>Quiz navigation</h4>
              <div className="exam-grid-matrix">
                {questions.map((q, idx) => {
                  const answered = answers[q.id] !== undefined;
                  const flagged = markedForReview[q.id];
                  const active = currentIdx === idx;

                  return (
                    <button
                      key={q.id}
                      type="button"
                      className={`exam-grid-square ${active ? 'is-active' : ''} ${answered ? 'is-answered' : ''} ${flagged ? 'is-flagged' : ''}`}
                      onClick={() => {
                        setCurrentIdx(idx);
                        document.getElementById(`question-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      title={`Question ${idx + 1} (${flagged ? 'Flagged' : answered ? 'Answered' : 'Unattempted'})`}
                    >
                      {idx + 1}
                      {flagged && <span className="flag-dot" />}
                    </button>
                  );
                })}
              </div>

              <button 
                type="button" 
                className="exam-action-btn exam-action-btn--finish"
                onClick={() => {
                  if (window.confirm("Are you sure you want to submit your exam now?")) {
                    handleFinishExam();
                  }
                }}
              >
                 Submit quiz
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Finished / Performance Report View
  if (examFinished) {
    return (
      <div className="exam-portal exam-portal--results">
        <div className={`exam-results-hero ${passed ? 'passed-hero' : 'failed-hero'}`}>
          <div className="results-hero-circle">
            <span className="results-hero-score">{scorePercentage}%</span>
            <span className="results-hero-ratio">{scoreCount} / {questions.length} Correct</span>
          </div>
          
          <h2>{passed ? 'Congratulations!' : 'Keep Studying!'}</h2>
          <p className="results-hero-status">
            Status: <strong>{passed ? 'PASSED' : 'FAILED'}</strong> (Required: 75%)
          </p>
          <span className="results-hero-time">Completed in {formatDuration(timeTaken)}</span>
        </div>

        {/* Dynamic Strengths & Weaknesses (Pros & Cons) */}
        <div className="exam-performance-feedback">
          <h3>Personalized Performance Diagnostic</h3>
          <p className="diagnostic-summary-desc">
            Based on your practice exam analytics, we have mapped your performance against the official CompTIA Security+ domain objectives:
          </p>

          <div className="diagnostic-row-split">
            {/* Pros / Strengths */}
            <div className="diagnostic-card diagnostic-card--strengths">
              <h4>Strengths (Pros) 👍</h4>
              <div className="diagnostic-list">
                {performanceReport.pros.map((p, idx) => (
                  <div key={idx} className="diagnostic-item">
                    <div className="diagnostic-item-header">
                      <strong>{p.name}</strong>
                      <span className="diagnostic-badge success">{p.percentage}% ({p.score})</span>
                    </div>
                    <p>{p.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cons / Weaknesses */}
            <div className="diagnostic-card diagnostic-card--weaknesses">
              <h4>Areas for Improvement (Cons) ⚠️</h4>
              <div className="diagnostic-list">
                {performanceReport.cons.map((c, idx) => (
                  <div key={idx} className="diagnostic-item">
                    <div className="diagnostic-item-header">
                      <strong>{c.name}</strong>
                      <span className="diagnostic-badge warning">{c.percentage}% ({c.score})</span>
                    </div>
                    <p>{c.feedback}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Retake Button */}
        <div className="results-retake-container">
          <button type="button" className="exam-retake-btn" onClick={handleRetakeExam}>
            <RotateCcw size={16} />
            <span>Retake Random Quiz</span>
          </button>
        </div>

        {/* Question Review Section */}
        <div className="exam-review-section">
          <h3>Review Exam Questions</h3>
          <p className="review-intro-desc">Go through each question to check explanations and reinforce learning:</p>

          <div className="exam-review-list">
            {questions.map((q, idx) => {
              const pickedAns = answers[q.id];
              const wasCorrect = pickedAns === q.correctIndex;

              return (
                <div key={q.id} className={`review-question-card ${wasCorrect ? 'review-correct' : 'review-wrong'}`}>
                  <div className="review-question-header">
                    <span className="review-number-badge">Question {idx + 1}</span>
                    <span className={`review-status-label ${wasCorrect ? 'success' : 'wrong'}`}>
                      {wasCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                  </div>

                  <p className="review-question-text">{q.question}</p>

                  <div className="review-options-grid">
                    {q.options.map((opt, optIdx) => {
                      const isPicked = pickedAns === optIdx;
                      const isCorrectAnswer = q.correctIndex === optIdx;
                      
                      let optionClass = '';
                      if (isCorrectAnswer) optionClass = 'is-correct-answer';
                      else if (isPicked && !isCorrectAnswer) optionClass = 'is-wrong-picked';

                      return (
                        <div key={optIdx} className={`review-option-item ${optionClass}`}>
                          <span className="review-option-letter">{['A', 'B', 'C', 'D'][optIdx]}</span>
                          <span className="review-option-text">{opt}</span>
                          {isCorrectAnswer && <CheckCircle2 size={16} className="review-option-icon success" />}
                          {isPicked && !isCorrectAnswer && <XCircle size={16} className="review-option-icon wrong" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="review-explanation-box">
                    <BookOpen size={16} />
                    <div>
                      <strong>Explanation:</strong>
                      <p>{q.explanation}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
