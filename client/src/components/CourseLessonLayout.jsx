import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChevronDown, ChevronRight, Pencil, CheckCircle2, XCircle } from 'lucide-react';
import {
  courseToContentBlocks,
  formatCourseDate,
  findModuleForBlock,
  findSectionForBlock,
  getBlockNavLabel,
  getVisibleBlocks,
  groupBlocksIntoModules,
} from '../lib/contentBlocks';
import { CourseOutlineNav } from './CourseOutlineNav';
import './CourseLessonLayout.css';

const CourseLessonLayout = ({ course }) => {
  const allBlocks = useMemo(() => courseToContentBlocks(course), [course]);
  const visibleBlocks = useMemo(() => getVisibleBlocks(allBlocks), [allBlocks]);
  const modules = useMemo(() => groupBlocksIntoModules(visibleBlocks), [visibleBlocks]);

  const [activeId, setActiveId] = useState(visibleBlocks[0]?.id || null);
  const [expandedModules, setExpandedModules] = useState(() => new Set());
  const [expandedSections, setExpandedSections] = useState(() => new Set());
  const [answers, setAnswers] = useState({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isAdmin = localStorage.getItem('adminAuth') === 'true';

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

  const sectionTitle =
    activeBlock?.type === 'markdown'
      ? activeBlock.navTitle?.trim() || getBlockNavLabel(activeBlock, activeIndex)
      : getBlockNavLabel(activeBlock, activeIndex);

  return (
    <div className="lesson-layout">
      <aside className={`lesson-sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="lesson-sidebar-head">
          <button
            type="button"
            className="lesson-sidebar-toggle"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
          {sidebarOpen && <h2 className="lesson-sidebar-title">{course.title}</h2>}
        </div>

        {sidebarOpen && (
          <nav className="lesson-nav lesson-nav--accordion">
            <CourseOutlineNav
              modules={modules}
              blocksForIndex={visibleBlocks}
              activeBlockId={activeId}
              onSelectBlock={setActiveId}
              expandedModules={expandedModules}
              onToggleModule={toggleModule}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
              navItemClassName="lesson-nav-item lesson-nav-item--child"
              moduleBtnClassName="lesson-module-btn"
              moduleItemsClassName="lesson-module-items"
              sectionBtnClassName="lesson-section-btn"
              sectionItemsClassName="lesson-section-items"
              moduleClassName="lesson-module"
            />
          </nav>
        )}
      </aside>

      <main className="lesson-main">
        <header className="lesson-header">
          <div className="lesson-header-top">
            <span className="lesson-course-tag">
              {activeModule?.title || course.level}
            </span>
            <LessonHeaderActions isAdmin={isAdmin} courseId={course.id} />
          </div>
          <h1>{sectionTitle}</h1>
          <p className="lesson-updated">Last updated : {formatCourseDate(course.updated_at)}</p>
          {activeIndex === 0 && course.description ? (
            <p className="lesson-intro">{course.description}</p>
          ) : null}
        </header>

        <article className="lesson-article">
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

          <footer className="lesson-pager">
            <button
              type="button"
              className="lesson-pager-btn"
              disabled={activeIndex <= 0}
              onClick={() => setActiveId(visibleBlocks[activeIndex - 1].id)}
            >
              ← Previous
            </button>
            <span className="lesson-pager-count">
              {activeIndex + 1} / {visibleBlocks.length}
            </span>
            <button
              type="button"
              className="lesson-pager-btn"
              disabled={activeIndex >= visibleBlocks.length - 1}
              onClick={() => setActiveId(visibleBlocks[activeIndex + 1].id)}
            >
              Next →
            </button>
          </footer>
        </article>
      </main>
    </div>
  );
};

function motionLessonEmpty({ children }) {
  return <div className="lesson-empty">{children}</div>;
}

function motionAccordionModule({ mod, isExpanded, children }) {
  return <div className={`lesson-module${isExpanded ? ' is-expanded' : ''}`}>{children}</div>;
}

function LessonHeaderActions({ isAdmin, courseId }) {
  if (!isAdmin || !courseId) return <div className="lesson-header-actions" />;
  return (
    <div className="lesson-header-actions">
      <Link to="/admin" className="lesson-action-btn" title="Edit in admin">
        <Pencil size={18} />
      </Link>
    </div>
  );
}

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
