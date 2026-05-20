import { useCallback, useEffect, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  BookOpen,
  CircleCheck,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  courseToContentBlocks,
  formatCourseDate,
  findSectionForBlock,
  getBlockNavLabel,
  getVisibleBlocks,
  groupBlocksIntoModules,
  splitMarkdownLeadingTitle,
} from '../lib/contentBlocks';
import { CourseOutlineNav } from './CourseOutlineNav';
import './CourseLessonLayout.css';

const progressStorageKey = (courseId) => `certnova-lesson-progress-${courseId}`;

function loadCompletedIds(courseId) {
  try {
    const raw = localStorage.getItem(progressStorageKey(courseId));
    return new Set(JSON.parse(raw || '[]'));
  } catch {
    return new Set();
  }
}

function saveCompletedIds(courseId, ids) {
  localStorage.setItem(progressStorageKey(courseId), JSON.stringify([...ids]));
}

function estimateReadMinutes(block) {
  if (!block || block.type !== 'markdown') return null;
  const text = block.content || '';
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (!words) return 1;
  return Math.max(1, Math.ceil(words / 200));
}

const CourseLessonLayout = ({ course }) => {
  const allBlocks = useMemo(() => courseToContentBlocks(course), [course]);
  const visibleBlocks = useMemo(() => getVisibleBlocks(allBlocks), [allBlocks]);
  const modules = useMemo(() => groupBlocksIntoModules(visibleBlocks), [visibleBlocks]);

  const [activeId, setActiveId] = useState(visibleBlocks[0]?.id || null);
  const [expandedSections, setExpandedSections] = useState(() => new Set());
  const [answers, setAnswers] = useState({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState({});
  const [completedIds, setCompletedIds] = useState(() =>
    course?.id ? loadCompletedIds(course.id) : new Set()
  );

  useEffect(() => {
    if (course?.id) {
      setCompletedIds(loadCompletedIds(course.id));
    }
  }, [course?.id]);

  useEffect(() => {
    if (visibleBlocks.length && !visibleBlocks.some((b) => b.id === activeId)) {
      setActiveId(visibleBlocks[0].id);
    }
  }, [visibleBlocks, activeId]);

  useEffect(() => {
    const sec = findSectionForBlock(modules, activeId);
    if (sec) {
      setExpandedSections((prev) => new Set([...prev, sec.id]));
    }
  }, [activeId, modules]);

  const toggleSection = (secId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(secId)) next.delete(secId);
      else next.add(secId);
      return next;
    });
  };

  const activeBlock = visibleBlocks.find((b) => b.id === activeId) || visibleBlocks[0];
  const activeIndex = visibleBlocks.findIndex((b) => b.id === activeBlock?.id);
  const prevBlock = activeIndex > 0 ? visibleBlocks[activeIndex - 1] : null;
  const nextBlock =
    activeIndex >= 0 && activeIndex < visibleBlocks.length - 1
      ? visibleBlocks[activeIndex + 1]
      : null;

  const isCurrentComplete = activeBlock && completedIds.has(activeBlock.id);
  const readMinutes = estimateReadMinutes(activeBlock);

  const lessonTitle =
    activeBlock?.type === 'markdown'
      ? activeBlock.navTitle?.trim() || getBlockNavLabel(activeBlock, activeIndex)
      : getBlockNavLabel(activeBlock, activeIndex);

  const markdownLesson = useMemo(() => {
    if (activeBlock?.type !== 'markdown') {
      return { title: null, body: '' };
    }
    const { title, body } = splitMarkdownLeadingTitle(activeBlock.content);
    return {
      title: title || lessonTitle,
      body: title ? body : activeBlock.content || '',
    };
  }, [activeBlock, lessonTitle]);

  const toggleComplete = useCallback(() => {
    if (!activeBlock?.id || !course?.id) return;
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(activeBlock.id)) next.delete(activeBlock.id);
      else next.add(activeBlock.id);
      saveCompletedIds(course.id, next);
      return next;
    });
  }, [activeBlock?.id, course?.id]);

  const goToBlock = useCallback((blockId) => {
    if (blockId) setActiveId(blockId);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.target.closest('input, textarea, select, [contenteditable]')) return;
      if (e.key === 'ArrowLeft' && prevBlock) {
        e.preventDefault();
        goToBlock(prevBlock.id);
      }
      if (e.key === 'ArrowRight' && nextBlock) {
        e.preventDefault();
        goToBlock(nextBlock.id);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [prevBlock, nextBlock, goToBlock]);

  if (!visibleBlocks.length) {
    return (
      <div className="lesson-empty">
        <p>This course has no published lessons yet.</p>
      </div>
    );
  }

  const handleQuizSubmit = (blockId) => (e) => {
    e.preventDefault();
    setSubmittedQuizzes((prev) => ({ ...prev, [blockId]: true }));
    if (course?.id) {
      setCompletedIds((prev) => {
        const next = new Set([...prev, blockId]);
        saveCompletedIds(course.id, next);
        return next;
      });
    }
  };

  return (
    <div className="lesson-layout">
      <div className="lesson-sidebar-pin">
        <aside className="lesson-sidebar open">
        <nav className="lesson-nav lesson-nav--accordion" aria-label="Lessons">
          <CourseOutlineNav
            modules={modules}
            blocksForIndex={visibleBlocks}
            activeBlockId={activeId}
            onSelectBlock={setActiveId}
            expandedModules={new Set(modules.map((m) => m.id))}
            onToggleModule={() => {}}
            expandedSections={expandedSections}
            onToggleSection={toggleSection}
            completedBlockIds={completedIds}
            hideModuleHeaders
            lessonGroupNav
            navItemClassName="lesson-nav-item lesson-nav-item--child"
            moduleBtnClassName="lesson-module-btn"
            moduleItemsClassName="lesson-module-items"
            sectionBtnClassName="lesson-section-btn"
            sectionItemsClassName="lesson-section-items"
            moduleClassName="lesson-module"
          />
        </nav>
        </aside>
      </div>

      <main className="lesson-main">
        <div className="lesson-main-top-bar" aria-hidden="true" />
        <header
          className={`lesson-header${
            activeBlock?.type === 'markdown' ? ' lesson-header--content-title' : ''
          }`}
        >
          {activeBlock?.type === 'markdown' ? <h1>{markdownLesson.title}</h1> : null}
          {activeBlock?.type === 'quiz' ? <h1>{lessonTitle}</h1> : null}

          <div className="lesson-meta">
            {readMinutes && activeBlock?.type === 'markdown' ? (
              <span className="lesson-meta__item">
                <Clock size={15} aria-hidden />
                {readMinutes} min read
              </span>
            ) : null}
            <span className="lesson-meta__item">
              <BookOpen size={15} aria-hidden />
              Updated {formatCourseDate(course.updated_at)}
            </span>
            <button
              type="button"
              className={`lesson-complete-btn${isCurrentComplete ? ' is-done' : ''}`}
              onClick={toggleComplete}
              aria-pressed={isCurrentComplete}
            >
              <CircleCheck size={16} aria-hidden />
              {isCurrentComplete ? 'Completed' : 'Mark as complete'}
            </button>
          </div>
        </header>

        <article className="lesson-article">
          <div className="lesson-body">
            {activeBlock?.type === 'markdown' && (
              <div className="lesson-prose prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownLesson.body}</ReactMarkdown>
              </div>
            )}

            {activeBlock?.type === 'quiz' && (
              <QuizPanel
                block={activeBlock}
                picked={answers[activeBlock.id]}
                submitted={submittedQuizzes[activeBlock.id]}
                onAnswer={(optIndex) =>
                  setAnswers((prev) => ({ ...prev, [activeBlock.id]: optIndex }))
                }
                onSubmit={handleQuizSubmit(activeBlock.id)}
              />
            )}
          </div>

          <footer className="lesson-pager">
            <button
              type="button"
              className="lesson-pager-btn lesson-pager-btn--prev"
              disabled={!prevBlock}
              onClick={() => goToBlock(prevBlock?.id)}
            >
              <span className="lesson-pager-btn__label">← Previous</span>
            </button>

            <span className="lesson-pager-count">
              {activeIndex + 1} / {visibleBlocks.length}
            </span>

            <button
              type="button"
              className="lesson-pager-btn lesson-pager-btn--preview"
              disabled={!nextBlock}
              onClick={() => goToBlock(nextBlock?.id)}
            >
              <span className="lesson-pager-btn__label">Preview →</span>
            </button>
          </footer>
        </article>
      </main>
    </div>
  );
};

function QuizPanel({ block, picked, submitted, onAnswer, onSubmit }) {
  const isCorrect = submitted && picked === block.correctIndex;
  const isWrong = submitted && picked !== undefined && picked !== block.correctIndex;

  return (
    <div className="lesson-quiz">
      <h2 className="lesson-quiz-title">{block.question}</h2>
      <form onSubmit={onSubmit}>
        {(block.options || []).map((opt, optIndex) => (
          <label
            key={optIndex}
            className={`quiz-take-option${picked === optIndex ? ' selected' : ''}${
              submitted && optIndex === block.correctIndex ? ' correct' : ''
            }${submitted && picked === optIndex && optIndex !== block.correctIndex ? ' wrong' : ''}`}
          >
            <input
              type="radio"
              name={block.id}
              checked={picked === optIndex}
              disabled={submitted}
              onChange={() => onAnswer(optIndex)}
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
        {!submitted ? (
          <button type="submit" className="quiz-submit-btn">
            Check answer
          </button>
        ) : null}
      </form>
    </div>
  );
}

export default CourseLessonLayout;
