import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft,
  BookOpen,
  CircleCheck,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import {
  courseToContentBlocks,
  formatCourseDate,
  findModuleForBlock,
  findSectionForBlock,
  getBlockNavLabel,
  getBlockOutlinePath,
  getVisibleBlocks,
  groupBlocksIntoModules,
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
  const [expandedModules, setExpandedModules] = useState(() => new Set());
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
    const mod = findModuleForBlock(modules, activeId);
    if (mod) {
      setExpandedModules((prev) => new Set([...prev, mod.id]));
    }
    const sec = findSectionForBlock(modules, activeId);
    if (sec) {
      setExpandedSections((prev) => new Set([...prev, sec.id]));
    }
  }, [activeId, modules]);

  useEffect(() => {
    if (modules.length && expandedModules.size === 0) {
      setExpandedModules(new Set([modules[0].id]));
    }
  }, [modules, expandedModules.size]);

  const activeBlock = visibleBlocks.find((b) => b.id === activeId) || visibleBlocks[0];
  const activeIndex = visibleBlocks.findIndex((b) => b.id === activeBlock?.id);
  const activeModule = findModuleForBlock(modules, activeBlock?.id);
  const activeSection = findSectionForBlock(modules, activeBlock?.id);
  const prevBlock = activeIndex > 0 ? visibleBlocks[activeIndex - 1] : null;
  const nextBlock =
    activeIndex >= 0 && activeIndex < visibleBlocks.length - 1
      ? visibleBlocks[activeIndex + 1]
      : null;

  const progressPct =
    visibleBlocks.length > 0
      ? Math.round((completedIds.size / visibleBlocks.length) * 100)
      : 0;

  const isCurrentComplete = activeBlock && completedIds.has(activeBlock.id);
  const readMinutes = estimateReadMinutes(activeBlock);

  const lessonTitle =
    activeBlock?.type === 'markdown'
      ? activeBlock.navTitle?.trim() || getBlockNavLabel(activeBlock, activeIndex)
      : getBlockNavLabel(activeBlock, activeIndex);

  const outlinePath = activeBlock
    ? getBlockOutlinePath(visibleBlocks, activeBlock.id)
    : { parts: [] };

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

  const toggleModule = (modId) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(modId)) next.delete(modId);
      else next.add(modId);
      return next;
    });
  };

  const toggleSection = (secId) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(secId)) next.delete(secId);
      else next.add(secId);
      return next;
    });
  };

  const lessonTypeLabel =
    activeBlock?.type === 'quiz'
      ? 'Knowledge check'
      : activeSection
        ? 'Sub-lesson'
        : 'Lesson';

  return (
    <div className="lesson-layout">
      <aside className="lesson-sidebar open">
        <div className="lesson-sidebar-top">
          <Link to={`/courses/${course.slug}`} className="lesson-back-link">
            <ArrowLeft size={16} aria-hidden />
            Course overview
          </Link>

          <div className="lesson-progress" aria-label="Course progress">
            <div className="lesson-progress__labels">
              <span>Your progress</span>
              <strong>
                {completedIds.size} / {visibleBlocks.length}
              </strong>
            </div>
            <div
              className="lesson-progress__track"
              role="progressbar"
              aria-valuenow={progressPct}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span className="lesson-progress__bar" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        <div className="lesson-sidebar-head">
          <p className="lesson-sidebar-label">Course content</p>
          <h2 className="lesson-sidebar-title">{course.title}</h2>
        </div>

        <nav className="lesson-nav lesson-nav--accordion" aria-label="Lessons">
            <CourseOutlineNav
              modules={modules}
              blocksForIndex={visibleBlocks}
              activeBlockId={activeId}
              onSelectBlock={setActiveId}
              expandedModules={expandedModules}
              onToggleModule={toggleModule}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
              completedBlockIds={completedIds}
              navItemClassName="lesson-nav-item lesson-nav-item--child"
              moduleBtnClassName="lesson-module-btn"
              moduleItemsClassName="lesson-module-items"
              sectionBtnClassName="lesson-section-btn"
              sectionItemsClassName="lesson-section-items"
              moduleClassName="lesson-module"
            />
        </nav>
      </aside>

      <main className="lesson-main">
        <header className="lesson-header">
          <div className="lesson-header__row">
            <nav className="lesson-breadcrumb" aria-label="Breadcrumb">
              <Link to={`/courses/${course.slug}`}>{course.title}</Link>
              {outlinePath.parts.slice(0, -1).map((part) => (
                <span key={part}>
                  <span className="lesson-breadcrumb__sep" aria-hidden>
                    /
                  </span>
                  <span>{part}</span>
                </span>
              ))}
            </nav>
          </div>

          <p className="lesson-eyebrow">
            {activeModule?.title || 'Course'}
            <span className="lesson-eyebrow__dot" aria-hidden>
              ·
            </span>
            {lessonTypeLabel} {activeIndex + 1} of {visibleBlocks.length}
          </p>

          <h1>{lessonTitle}</h1>

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

          {activeIndex === 0 && course.description ? (
            <p className="lesson-intro">{course.description}</p>
          ) : null}
        </header>

        <article className="lesson-article">
          <div className="lesson-body">
            {activeBlock?.type === 'markdown' && (
              <div className="lesson-prose prose">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeBlock.content}</ReactMarkdown>
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
              <span className="lesson-pager-btn__dir">← Previous</span>
              {prevBlock ? (
                <span className="lesson-pager-btn__title">
                  {getBlockNavLabel(prevBlock, activeIndex - 1)}
                </span>
              ) : null}
            </button>

            <span className="lesson-pager-count">
              {activeIndex + 1} / {visibleBlocks.length}
            </span>

            <button
              type="button"
              className="lesson-pager-btn lesson-pager-btn--next"
              disabled={!nextBlock}
              onClick={() => goToBlock(nextBlock?.id)}
            >
              <span className="lesson-pager-btn__dir">Next →</span>
              {nextBlock ? (
                <span className="lesson-pager-btn__title">
                  {getBlockNavLabel(nextBlock, activeIndex + 1)}
                </span>
              ) : null}
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
        {isWrong ? <p className="quiz-feedback wrong">Not quite — review the lesson.</p> : null}
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
