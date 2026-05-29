import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CertnovaMarkdown from './CertnovaMarkdown';
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
import SuggestedQuiz from './SuggestedQuiz';
import CourseProgressStrip from './CourseProgressStrip';
import { getSuggestedQuizForBlock } from '../lib/suggestedQuiz';
import ModuleExamPortal from './ModuleExamPortal';
import KnowledgeCheckPortal from './KnowledgeCheckPortal';
import {
  LESSON_SIDEBAR_DEFAULT,
  LESSON_SIDEBAR_MAX,
  LESSON_SIDEBAR_MIN,
  clampSidebarWidth,
  isSidebarCollapsed,
  loadLessonSidebarWidth,
  saveLessonSidebarWidth,
} from '../lib/lessonSidebarWidth';
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

const certStorageKey = (courseId) => `certnova-course-certificate-${courseId}`;

function saveCompletionDate(courseId) {
  const existing = localStorage.getItem(certStorageKey(courseId));
  if (existing) return;
  localStorage.setItem(certStorageKey(courseId), JSON.stringify({
    date: new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    }),
  }));
}

function estimateReadMinutes(block) {
  if (!block || block.type !== 'markdown') return null;
  const text = block.content || '';
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (!words) return 1;
  return Math.max(1, Math.ceil(words / 200));
}

const CourseLessonLayout = ({ course }) => {
  if (course?.slug === 'knowledge-check') {
    return (
      <KnowledgeCheckPortal 
        courseId={course.id}
        isCompleted={loadCompletedIds(course.id).has(`knowledge-check-${course.id}`)}
        onComplete={(id) => {
          const ids = loadCompletedIds(course.id);
          ids.add(id);
          saveCompletedIds(course.id, ids);
          saveCompletionDate(course.id);
        }}
      />
    );
  }

  const allBlocks = useMemo(() => courseToContentBlocks(course), [course]);
  const visibleBlocks = useMemo(() => {
    const rawVisible = getVisibleBlocks(allBlocks);
    return rawVisible.filter((b) => {
      const sec = b.sectionTitle?.trim();
      const nav = b.navTitle?.trim();
      const isParent = b.type === 'markdown' && sec && nav && sec === nav;
      return !isParent;
    });
  }, [allBlocks]);
  const modules = useMemo(() => groupBlocksIntoModules(visibleBlocks), [visibleBlocks]);

  // Unified sequence list (lessons + module quizzes as first-class steps)
  const navigableItems = useMemo(() => {
    const list = [];
    modules.forEach((mod) => {
      list.push(...mod.items);
      list.push({
        id: `module-quiz-${mod.id}`,
        type: 'module-quiz',
        moduleId: mod.id,
        moduleTitle: mod.title,
      });
    });
    return list;
  }, [modules]);

  const [activeId, setActiveId] = useState(navigableItems[0]?.id || null);
  const [expandedSections, setExpandedSections] = useState(() => new Set());
  const [answers, setAnswers] = useState({});
  const [submittedQuizzes, setSubmittedQuizzes] = useState({});
  const [completedIds, setCompletedIds] = useState(() =>
    course?.id ? loadCompletedIds(course.id) : new Set()
  );
  const [sidebarWidth, setSidebarWidth] = useState(loadLessonSidebarWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [hideHeaderLine, setHideHeaderLine] = useState(false);
  const layoutRef = useRef(null);
  const lessonScrollRef = useRef(null);
  const sidebarWidthRef = useRef(sidebarWidth);
  sidebarWidthRef.current = sidebarWidth;

  const sidebarCollapsed = isSidebarCollapsed(sidebarWidth);

  const startSidebarResize = useCallback((clientX) => {
    if (!layoutRef.current) return;
    const startX = clientX;
    const startW = sidebarWidthRef.current;

    setIsResizing(true);

    const onMove = (x) => {
      const delta = x - startX;
      const next = clampSidebarWidth(startW + delta);
      setSidebarWidth(next);
    };

    const onMouseMove = (e) => onMove(e.clientX);
    const onTouchMove = (e) => {
      if (e.touches[0]) onMove(e.touches[0].clientX);
    };

    const end = () => {
      setIsResizing(false);
      saveLessonSidebarWidth(sidebarWidthRef.current);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', end);
      document.body.classList.remove('lesson-sidebar-resizing');
    };

    document.body.classList.add('lesson-sidebar-resizing');
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', end);
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', end);
  }, []);

  const onResizeHandleMouseDown = (e) => {
    e.preventDefault();
    startSidebarResize(e.clientX);
  };

  const onResizeHandleDoubleClick = () => {
    const next = sidebarCollapsed ? LESSON_SIDEBAR_DEFAULT : LESSON_SIDEBAR_MIN;
    setSidebarWidth(next);
    saveLessonSidebarWidth(next);
  };

  const onResizeHandleKeyDown = (e) => {
    let delta = 0;
    if (e.key === 'ArrowLeft') delta = -16;
    if (e.key === 'ArrowRight') delta = 16;
    if (!delta) return;
    e.preventDefault();
    const next = clampSidebarWidth(sidebarWidth + delta);
    setSidebarWidth(next);
    saveLessonSidebarWidth(next);
  };

  useEffect(() => {
    if (course?.id) {
      setCompletedIds(loadCompletedIds(course.id));
    }
  }, [course?.id]);

  useEffect(() => {
    if (navigableItems.length && !navigableItems.some((item) => item.id === activeId)) {
      setActiveId(navigableItems[0].id);
    }
  }, [navigableItems, activeId]);

  useEffect(() => {
    const el = lessonScrollRef.current;
    if (el) el.scrollTop = 0;
    setHideHeaderLine(false);
  }, [activeId]);

  const handleLessonScroll = useCallback(() => {
    const el = lessonScrollRef.current;
    if (!el) return;
    setHideHeaderLine(el.scrollTop > 16);
    
    // Notify the navbar of the scroll position within the lesson container
    window.dispatchEvent(new CustomEvent('lessonScroll', { detail: el.scrollTop }));
  }, []);

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

  // Resolve module quiz specifics
  const isModuleQuizActive = String(activeId).startsWith('module-quiz-');
  const activeModuleId = isModuleQuizActive ? String(activeId).replace('module-quiz-', '') : null;
  const activeModule = isModuleQuizActive ? modules.find((m) => m.id === activeModuleId) : null;
  const activeModuleTitle = activeModule ? activeModule.title : 'Module Practice Exam';

  const activeBlock = isModuleQuizActive ? null : (visibleBlocks.find((b) => b.id === activeId) || visibleBlocks[0]);
  const activeIndex = navigableItems.findIndex((item) => item.id === activeId);
  const prevBlock = activeIndex > 0 ? navigableItems[activeIndex - 1] : null;
  const nextBlock =
    activeIndex >= 0 && activeIndex < navigableItems.length - 1
      ? navigableItems[activeIndex + 1]
      : null;

  const isCurrentComplete = isModuleQuizActive
    ? completedIds.has(activeId)
    : activeBlock && completedIds.has(activeBlock.id);

  const isCourseComplete = navigableItems.length > 0 && navigableItems.every((item) => completedIds.has(item.id));

  useEffect(() => {
    if (isCourseComplete && course?.id) {
      saveCompletionDate(course.id);
    }
  }, [isCourseComplete, course?.id]);

  useEffect(() => {
    if (course?.id && (activeBlock || isModuleQuizActive)) {
      const progressPercent = navigableItems.length > 0
        ? Math.round((completedIds.size / navigableItems.length) * 100)
        : 0;

      const lastActivity = {
        courseId: course.id,
        courseTitle: course.title,
        courseSlug: course.slug,
        lessonId: activeId,
        lessonTitle: isModuleQuizActive ? `${activeModuleTitle} Exam` : (activeBlock.navTitle?.trim() || activeBlock.title || 'Lesson'),
        lessonHash: `#${activeId}`,
        progressPercent: progressPercent > 100 ? 100 : progressPercent
      };
      
      localStorage.setItem('certnova-last-activity', JSON.stringify(lastActivity));
      window.dispatchEvent(new Event('lastActivityUpdated'));

      // Send analytics update for active lesson learning
      const visitorId = localStorage.getItem('certnova_visitor_id') || 'v_anonymous';
      const email = localStorage.getItem('userEmail') || localStorage.getItem('userName') || 'learner@certnova.com';
      const name = localStorage.getItem('userName') || 'Learner';
      const activeLessonTitle = isModuleQuizActive ? `${activeModuleTitle} Exam` : (activeBlock.navTitle?.trim() || activeBlock.title || 'Lesson');

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      fetch(`${API_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId,
          email,
          name,
          courseSlug: course.slug,
          lessonTitle: `${course.title} - ${activeLessonTitle}`,
          action: 'learn'
        })
      }).catch(err => console.error('Analytics tracking lesson failed:', err));
    }
  }, [course, activeId, activeBlock, isModuleQuizActive, activeModuleTitle, completedIds.size, navigableItems.length]);

  const readMinutes = activeBlock ? estimateReadMinutes(activeBlock) : null;

  const lessonTitle = isModuleQuizActive
    ? `${activeModuleTitle} Practice Exam`
    : activeBlock?.type === 'markdown'
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

  const suggestedQuizQuestions = useMemo(() => {
    if (activeBlock?.type !== 'markdown') return [];
    return getSuggestedQuizForBlock(activeBlock);
  }, [activeBlock]);

  const toggleComplete = useCallback(() => {
    const idToToggle = isModuleQuizActive ? activeId : activeBlock?.id;
    if (!idToToggle || !course?.id) return;
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(idToToggle)) next.delete(idToToggle);
      else next.add(idToToggle);
      saveCompletedIds(course.id, next);
      return next;
    });
  }, [isModuleQuizActive, activeId, activeBlock?.id, course?.id]);

  const handleQuizComplete = useCallback((completedId) => {
    if (!completedId || !course?.id) return;
    setCompletedIds((prev) => {
      const next = new Set([...prev, completedId]);
      saveCompletedIds(course.id, next);
      return next;
    });
  }, [course?.id]);

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
    <>
    <CourseProgressStrip
      courseTitle={course?.title || 'Course'}
      courseSlug={course?.slug}
      currentLessonTitle={lessonTitle}
      totalLessons={navigableItems.length}
      completedCount={completedIds.size}
    />
    <div
      ref={layoutRef}
      className={`lesson-layout lesson-layout--resizable${isResizing ? ' is-resizing' : ''}${
        sidebarCollapsed ? ' lesson-layout--sidebar-narrow' : ''
      }${isModuleQuizActive ? ' lesson-layout--full-screen' : ''}`}
      style={{ '--lesson-sidebar-col': isModuleQuizActive ? '0px' : `${sidebarWidth}px` }}
    >
      <div
        className={`lesson-sidebar-pin${sidebarCollapsed ? ' lesson-sidebar-pin--collapsed' : ''}`}
      >
        <aside className="lesson-sidebar open">
        <nav className="lesson-nav lesson-nav--accordion" aria-label="Lessons">
          <CourseOutlineNav
            modules={modules}
            blocksForIndex={navigableItems}
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

      <button
        type="button"
        className="lesson-resize-handle"
        title="Drag to resize sidebar. Double-click to collapse or expand."
        aria-label="Drag to resize lesson navigation. Double-click to collapse or expand."
        aria-valuemin={LESSON_SIDEBAR_MIN}
        aria-valuemax={LESSON_SIDEBAR_MAX}
        aria-valuenow={Math.round(sidebarWidth)}
        onMouseDown={onResizeHandleMouseDown}
        onTouchStart={(e) => {
          if (e.touches[0]) {
            e.preventDefault();
            startSidebarResize(e.touches[0].clientX);
          }
        }}
        onDoubleClick={onResizeHandleDoubleClick}
        onKeyDown={onResizeHandleKeyDown}
      />

      <main className="lesson-main">
        <div className="lesson-main-top-bar" aria-hidden="true" />
        <div
          ref={lessonScrollRef}
          className={`lesson-scroll${hideHeaderLine ? ' lesson-scroll--past-header' : ''}`}
          onScroll={handleLessonScroll}
        >
          <header
            className={`lesson-header${
              activeBlock?.type === 'markdown' ? ' lesson-header--content-title' : ''
            }`}
            style={{ display: isModuleQuizActive ? 'none' : '' }}
          >
            {activeBlock?.type === 'markdown' ? <h1>{markdownLesson.title}</h1> : null}
            {activeBlock?.type === 'quiz' ? <h1>{lessonTitle}</h1> : null}
            {isModuleQuizActive ? <h1>{lessonTitle}</h1> : null}

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
          <div className="lesson-header-boundary" aria-hidden="true" />

          <article className="lesson-article">
          <div className="lesson-body">
            {activeBlock?.type === 'markdown' && (
              <>
                <div className="lesson-prose">
                  <CertnovaMarkdown>{markdownLesson.body}</CertnovaMarkdown>
                </div>
                <div className="lesson-suggested-quiz">
                  <SuggestedQuiz
                    key={activeBlock.id}
                    questions={suggestedQuizQuestions}
                    lessonTitle={markdownLesson.title}
                  />
                </div>
              </>
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

            {isModuleQuizActive && (
              <ModuleExamPortal
                moduleId={activeModuleId}
                moduleTitle={activeModuleTitle}
                courseId={course.id}
                onComplete={handleQuizComplete}
                isCompleted={isCurrentComplete}
              />
            )}
          </div>

          {isCourseComplete && (
            <div className="lesson-complete-banner">
              <div className="lesson-complete-banner__icon">🎉</div>
              <div className="lesson-complete-banner__text">
                <strong>Course Complete!</strong>
                <span>You&apos;ve finished all lessons.</span>
              </div>
              <Link to={`/certificate/${course?.slug}`} className="lesson-cert-btn">
                Get Certificate
              </Link>
            </div>
          )}

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
              {activeIndex + 1} / {navigableItems.length}
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
        </div>
      </main>
    </div>
    </>
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
