import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Link,
  Quote,
  Code,
  Braces,
  List,
  ListOrdered,
  Image,
  Minus,
  Trash2,
  Workflow,
} from 'lucide-react';
import { getBlockOutlinePath } from '../lib/contentBlocks';
import { normalizeNavTitle, NAV_TITLE_MAX_WORDS } from '../lib/navTitleWords';
import { applyMarkdownAction, MARKDOWN_TOOLBAR_ACTIONS } from '../lib/markdownToolbar';
import PlantUmlAdminPanel from './PlantUmlAdminPanel';
import SuggestedQuizEditor from './SuggestedQuizEditor';
import CertnovaMarkdown from './CertnovaMarkdown';
import './CourseContentBuilder.css';
import './PlantUmlAdminPanel.css';

const ICONS = {
  bold: Bold,
  italic: Italic,
  strike: Strikethrough,
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  link: Link,
  quote: Quote,
  code: Code,
  codeblock: Braces,
  ul: List,
  ol: ListOrdered,
  image: Image,
  hr: Minus,
};

const CourseContentBuilder = ({
  blocks,
  onChange,
  activeBlockId: controlledActiveId,
  onActiveBlockChange,
}) => {
  const [internalActiveId, setInternalActiveId] = useState(
    () => blocks.find((b) => b.type === 'markdown')?.id || blocks[0]?.id || null
  );
  const [toolbarHint, setToolbarHint] = useState('');
  const [plantUmlPanelOpen, setPlantUmlPanelOpen] = useState(false);
  const textareaRefs = useRef({});

  const activeBlockId = controlledActiveId ?? internalActiveId;
  const setActiveBlockId = onActiveBlockChange ?? setInternalActiveId;

  const activeBlock = blocks.find((b) => b.id === activeBlockId);
  const canFormat = activeBlock?.type === 'markdown';
  const outlinePath = useMemo(
    () => (activeBlockId ? getBlockOutlinePath(blocks, activeBlockId) : null),
    [blocks, activeBlockId]
  );

  useEffect(() => {
    if (!blocks.some((b) => b.id === activeBlockId)) {
      const fallback = blocks.find((b) => b.type === 'markdown') || blocks[0];
      setActiveBlockId(fallback?.id || null);
    }
  }, [blocks, activeBlockId, setActiveBlockId]);

  const setBlocks = (next) => onChange(next);

  const updateBlock = (id, patch) => {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const flashHint = (message) => {
    setToolbarHint(message);
    window.setTimeout(() => setToolbarHint(''), 2800);
  };

  // Live Preview Resizing
  const [previewWidth, setPreviewWidth] = useState(() => {
    const saved = localStorage.getItem('certnova_admin_editor_preview_width');
    return saved ? parseInt(saved, 10) : 480;
  });
  const [isResizingPreview, setIsResizingPreview] = useState(false);

  const handlePreviewResizeDown = (e) => {
    e.preventDefault();
    setIsResizingPreview(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePreviewResizeMove = (e) => {
    if (!isResizingPreview) return;
    const container = e.currentTarget.parentElement;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const newWidth = Math.max(280, Math.min(rect.width - 280, rect.right - e.clientX));
    setPreviewWidth(newWidth);
  };

  const handlePreviewResizeUp = (e) => {
    if (!isResizingPreview) return;
    setIsResizingPreview(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    const container = e.currentTarget.parentElement;
    if (container) {
      const rect = container.getBoundingClientRect();
      const finalWidth = Math.max(280, Math.min(rect.width - 280, rect.right - e.clientX));
      setPreviewWidth(finalWidth);
      localStorage.setItem('certnova_admin_editor_preview_width', finalWidth);
    }
  };

  const removeBlock = (id) => {
    if (blocks.length <= 1) return;
    const next = blocks.filter((b) => b.id !== id);
    setBlocks(next);
    if (activeBlockId === id) {
      setActiveBlockId(next.find((b) => b.type === 'markdown')?.id || next[0]?.id);
    }
  };

  const applyToolbar = (actionDef) => {
    const id = activeBlockId;
    const block = blocks.find((b) => b.id === id && b.type === 'markdown');
    if (!block) {
      flashHint('Select a lesson (not a quiz) before using formatting.');
      return;
    }

    const el = textareaRefs.current[id];
    if (!el) {
      flashHint('Click inside the content area first.');
      return;
    }

    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const result = applyMarkdownAction(block.content || '', start, end, actionDef);
    updateBlock(id, { content: result.text });

    requestAnimationFrame(() => {
      const target = textareaRefs.current[id];
      if (!target) return;
      target.focus();
      target.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  const insertMarkdownAtCursor = (markdownChunk) => {
    const id = activeBlockId;
    const block = blocks.find((b) => b.id === id && b.type === 'markdown');
    if (!block) {
      flashHint('Select a lesson before inserting a diagram.');
      return;
    }

    const el = textareaRefs.current[id];
    const start = el?.selectionStart ?? block.content?.length ?? 0;
    const end = el?.selectionEnd ?? start;
    const before = (block.content || '').slice(0, start);
    const after = (block.content || '').slice(end);
    const next = `${before}${markdownChunk}${after}`;
    updateBlock(id, { content: next });

    requestAnimationFrame(() => {
      const target = textareaRefs.current[id];
      if (!target) return;
      target.focus();
      const pos = start + markdownChunk.length;
      target.setSelectionRange(pos, pos);
    });

    flashHint('PlantUML block inserted into lesson.');
    setPlantUmlPanelOpen(false);
  };

  const handlePlantUmlInsert = (markdownChunk) => {
    insertMarkdownAtCursor(markdownChunk);
  };

  const updateQuizOption = (blockId, optIndex, value) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block || block.type !== 'quiz') return;
    const options = [...block.options];
    options[optIndex] = value;
    updateBlock(blockId, { options });
  };

  const addQuizOption = (blockId) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block || block.type !== 'quiz') return;
    updateBlock(blockId, { options: [...block.options, ''] });
  };

  const removeQuizOption = (blockId, optIndex) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block || block.type !== 'quiz' || block.options.length <= 2) return;
    const options = block.options.filter((_, i) => i !== optIndex);
    const correctIndex =
      block.correctIndex >= options.length ? options.length - 1 : block.correctIndex;
    updateBlock(blockId, { options, correctIndex });
  };

  return (
    <div className="content-builder content-builder--embedded">
      <div className="content-builder-editor content-builder-editor--full">
        <div className="content-builder-toolbar-wrap">
          <ContentToolbar
            canFormat={canFormat}
            applyToolbar={applyToolbar}
            plantUmlPanelOpen={plantUmlPanelOpen}
            onTogglePlantUml={() => {
              if (!canFormat) {
                flashHint('Select a lesson (not a quiz) to add PlantUML.');
                return;
              }
              setPlantUmlPanelOpen((open) => !open);
            }}
          />
          <p className={`content-builder-toolbar-hint${toolbarHint ? ' is-alert' : ''}`}>
            {toolbarHint ||
              'Structure lives in the left outline - write sub-lesson content here. Use PlantUML for diagrams.'}
          </p>
        </div>

        {plantUmlPanelOpen && canFormat && (
          <PlantUmlAdminPanel
            onInsert={handlePlantUmlInsert}
            onClose={() => setPlantUmlPanelOpen(false)}
          />
        )}

        {!activeBlock ? (
          <div className="content-builder-empty-editor">
            <p>Select a sub-lesson or quiz from the outline on the left.</p>
          </div>
        ) : (
          <div className="content-builder-panel">
            <div className="content-builder-panel-head">
              <div className="content-builder-panel-head-main">
                <h4>{activeBlock.type === 'quiz' ? 'Quiz content' : 'Sub-lesson content'}</h4>
                {outlinePath && <BlockOutlineBreadcrumb parts={outlinePath.parts} />}
              </div>
              {blocks.length > 1 && (
                <button
                  type="button"
                  className="content-block-remove"
                  onClick={() => removeBlock(activeBlock.id)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              )}
            </div>

            {activeBlock.type === 'markdown' ? (
              <>
                <BlockPlacementDetails block={activeBlock} updateBlock={updateBlock} />
                <div 
                  className="content-builder-markdown-split"
                  style={{ '--preview-width': `${previewWidth}px` }}
                >
                  <textarea
                    ref={(el) => {
                      textareaRefs.current[activeBlock.id] = el;
                    }}
                    className="content-block-textarea content-block-textarea--editor"
                    value={activeBlock.content}
                    onChange={(e) => updateBlock(activeBlock.id, { content: e.target.value })}
                    onFocus={() => setActiveBlockId(activeBlock.id)}
                    placeholder="Write course content in Markdown..."
                    rows={16}
                    aria-label="Lesson markdown source"
                  />
                  <div
                    className={`editor-split-resize-handle ${isResizingPreview ? 'is-resizing' : ''}`}
                    onPointerDown={handlePreviewResizeDown}
                    onPointerMove={handlePreviewResizeMove}
                    onPointerUp={handlePreviewResizeUp}
                  />
                  <aside className="admin-lesson-preview" aria-label="Lesson preview">
                    <p className="admin-lesson-preview__label">Live preview</p>
                    <div className="admin-lesson-preview__body">
                      <CertnovaMarkdown>{activeBlock.content}</CertnovaMarkdown>
                    </div>
                  </aside>
                </div>
                <SuggestedQuizEditor block={activeBlock} updateBlock={updateBlock} />
              </>
            ) : (
              <QuizEditor
                block={activeBlock}
                outlinePath={outlinePath}
                updateBlock={updateBlock}
                updateQuizOption={updateQuizOption}
                addQuizOption={addQuizOption}
                removeQuizOption={removeQuizOption}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

function ContentToolbar({ canFormat, applyToolbar, plantUmlPanelOpen, onTogglePlantUml }) {
  return (
    <div className="content-builder-toolbar">
      {MARKDOWN_TOOLBAR_ACTIONS.map((action) => {
        const Icon = ICONS[action.key];
        if (action.key === 'plantuml') {
          return (
            <button
              key={action.key}
              type="button"
              className="toolbar-btn toolbar-btn--plantuml"
              title={action.label}
              disabled={!canFormat}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => applyToolbar(action)}
            >
              <Workflow size={17} />
            </button>
          );
        }
        return (
          <button
            key={action.key}
            type="button"
            className="toolbar-btn"
            title={action.label}
            disabled={!canFormat}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => applyToolbar(action)}
          >
            {Icon ? <Icon size={17} /> : null}
          </button>
        );
      })}
      <span className="toolbar-divider" aria-hidden />
      <button
        type="button"
        className={`toolbar-btn toolbar-btn--plantuml-panel${plantUmlPanelOpen ? ' is-active' : ''}`}
        title="Open PlantUML editor with live preview"
        disabled={!canFormat}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onTogglePlantUml}
      >
        <Workflow size={17} />
        <span>PlantUML</span>
      </button>
    </div>
  );
}

function BlockOutlineBreadcrumb({ parts }) {
  return (
    <nav className="content-outline-breadcrumb" aria-label="Position in course outline">
      <ol>
        {parts.map((part, i) => (
          <li key={`${part}-${i}`} className={i === parts.length - 1 ? 'is-current' : undefined}>
            {part}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function BlockPlacementDetails({ block, updateBlock }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="content-placement">
      <p className="content-placement-hint">
        Use the left outline to rename, reorder, or add sub-lessons. This area is for writing content.
      </p>
      <button
        type="button"
        className="content-placement-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide' : 'Advanced'} placement
      </button>
      {open && (
        <div className="content-placement-fields">
          <div className="form-group content-module-title">
            <label htmlFor={`mod-${block.id}`}>Module</label>
            <input
              id={`mod-${block.id}`}
              value={block.moduleTitle || ''}
              onChange={(e) => updateBlock(block.id, { moduleTitle: e.target.value })}
              placeholder="e.g. Basics"
            />
          </div>
          <motionContentBuilderPlacementSection block={block} updateBlock={updateBlock} />
        </div>
      )}
    </div>
  );
}

function motionContentBuilderPlacementSection({ block, updateBlock }) {
  const navHint = `Use ${NAV_TITLE_MAX_WORDS} words or fewer (e.g. 1.1 Security Introduction).`;

  const commitNavField = (field, raw) => {
    updateBlock(block.id, { [field]: normalizeNavTitle(raw) });
  };

  return (
    <>
      <div className="form-group content-section-title">
        <label htmlFor={`sec-${block.id}`}>Lesson</label>
        <input
          id={`sec-${block.id}`}
          value={block.sectionTitle || ''}
          onChange={(e) => updateBlock(block.id, { sectionTitle: e.target.value })}
          onBlur={(e) => commitNavField('sectionTitle', e.target.value)}
          placeholder="e.g. 01 Network Foundations"
        />
        <small className="content-nav-hint">{navHint}</small>
      </div>
      <div className="form-group content-nav-title">
        <label htmlFor={`nav-${block.id}`}>Sub-lesson title</label>
        <input
          id={`nav-${block.id}`}
          value={block.navTitle || ''}
          onChange={(e) => updateBlock(block.id, { navTitle: e.target.value })}
          onBlur={(e) => commitNavField('navTitle', e.target.value)}
          placeholder="e.g. 1.1 Security Introduction"
        />
        <small className="content-nav-hint">{navHint}</small>
      </div>
    </>
  );
}

function QuizEditor({ block, outlinePath, updateBlock, updateQuizOption, addQuizOption, removeQuizOption }) {
  return (
    <div className="content-block-quiz">
      {outlinePath && <BlockOutlineBreadcrumb parts={outlinePath.parts} />}
      <p className="content-placement-hint">The outline label follows the question text.</p>
      <section className="quiz-section">
        <h4>Question</h4>
        <textarea
          value={block.question}
          onChange={(e) => updateBlock(block.id, { question: e.target.value })}
          placeholder="Enter your quiz question"
          rows={3}
        />
      </section>
      <section className="quiz-section">
        <h4>Options</h4>
        <p className="quiz-section-hint">Select the radio button for the correct answer.</p>
        {block.options.map((opt, optIndex) => (
          <div className="quiz-option-row" key={optIndex}>
            <input
              type="radio"
              name={`correct-${block.id}`}
              checked={block.correctIndex === optIndex}
              onChange={() => updateBlock(block.id, { correctIndex: optIndex })}
              title="Correct answer"
            />
            <input
              type="text"
              value={opt}
              onChange={(e) => updateQuizOption(block.id, optIndex, e.target.value)}
              placeholder={`Option ${optIndex + 1}`}
            />
            <button
              type="button"
              className="quiz-option-remove"
              disabled={block.options.length <= 2}
              onClick={() => removeQuizOption(block.id, optIndex)}
              aria-label="Remove option"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
        <button type="button" className="quiz-add-option" onClick={() => addQuizOption(block.id)}>
          + Add option
        </button>
      </section>
    </div>
  );
}

export default CourseContentBuilder;