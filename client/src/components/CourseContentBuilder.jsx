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
} from 'lucide-react';
import { getBlockOutlinePath } from '../lib/contentBlocks';
import { applyMarkdownAction, MARKDOWN_TOOLBAR_ACTIONS } from '../lib/markdownToolbar';
import './CourseContentBuilder.css';

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
          <ContentToolbar canFormat={canFormat} applyToolbar={applyToolbar} />
          <p className={`content-builder-toolbar-hint${toolbarHint ? ' is-alert' : ''}`}>
            {toolbarHint || 'Structure lives in the left outline ? write lesson content here.'}
          </p>
        </div>

        {!activeBlock ? (
          <div className="content-builder-empty-editor">
            <p>Select a lesson or quiz from the outline on the left.</p>
          </div>
        ) : (
          <div className="content-builder-panel">
            <div className="content-builder-panel-head">
              <div className="content-builder-panel-head-main">
                <h4>{activeBlock.type === 'quiz' ? 'Quiz content' : 'Lesson content'}</h4>
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
                />
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

function ContentToolbar({ canFormat, applyToolbar }) {
  return (
    <div className="content-builder-toolbar">
      {MARKDOWN_TOOLBAR_ACTIONS.map((action) => {
        const Icon = ICONS[action.key];
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
  return (
    <>
      <div className="form-group content-section-title">
        <label htmlFor={`sec-${block.id}`}>Parent lesson</label>
        <input
          id={`sec-${block.id}`}
          value={block.sectionTitle || ''}
          onChange={(e) => updateBlock(block.id, { sectionTitle: e.target.value })}
          placeholder="e.g. Lesson 1"
        />
      </div>
      <div className="form-group content-nav-title">
        <label htmlFor={`nav-${block.id}`}>Sidebar title</label>
        <input
          id={`nav-${block.id}`}
          value={block.navTitle || ''}
          onChange={(e) => updateBlock(block.id, { navTitle: e.target.value })}
          placeholder="e.g. Introduction"
        />
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