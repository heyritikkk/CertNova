import { Fragment, useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronDown as ChevronDownIcon,
  Pencil,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import {
  getBlockNavLabel,
  getSectionParentBlock,
  getSectionSubLessonBlocks,
  groupModuleItemsIntoSections,
  sectionContainsBlock,
} from '../lib/contentBlocks';

/**
 * Renders module → optional section → lesson tree (public + admin editable).
 */
export function CourseOutlineNav({
  modules,
  blocksForIndex,
  activeBlockId,
  onSelectBlock,
  expandedModules,
  onToggleModule,
  expandedSections,
  onToggleSection,
  navItemClassName = 'course-outline-nav-item',
  moduleBtnClassName = 'course-outline-module-btn',
  moduleItemsClassName = 'course-outline-module-items',
  sectionBtnClassName = 'course-outline-section-btn',
  sectionItemsClassName = 'course-outline-section-items',
  moduleClassName = 'course-outline-module',
  editable = false,
  onAddLessonInModule,
  onAddSubLessonInSection,
  onAddSubLessonUnderFlat,
  onRenameBlock,
  onRenameSection,
  onDeleteBlock,
  onDeleteSection,
  onMoveBlock,
  completedBlockIds,
  hideModuleHeaders = false,
  lessonGroupNav = false,
}) {
  return (
    <>
      {modules.map((mod) => {
        const isModuleExpanded = hideModuleHeaders || expandedModules.has(mod.id);
        const sectionNodes = groupModuleItemsIntoSections(mod.items);

        return (
          <div
            key={mod.id}
            className={`${moduleClassName}${isModuleExpanded ? ' is-expanded' : ''}${hideModuleHeaders ? ' is-flat' : ''}`}
          >
            {!hideModuleHeaders && (
              <button
                type="button"
                className={moduleBtnClassName}
                onClick={() => onToggleModule(mod.id)}
                aria-expanded={isModuleExpanded}
              >
                <span>{mod.title}</span>
                {isModuleExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
            )}
            {isModuleExpanded && (
              <div className={moduleItemsClassName}>
                {sectionNodes.map((node, sectionIndex) => {
                  if (node.type === 'lesson') {
                    return (
                      <OutlineNavRow
                        key={node.block.id}
                        block={node.block}
                        blocksForIndex={blocksForIndex}
                        activeBlockId={activeBlockId}
                        onSelectBlock={onSelectBlock}
                        navItemClassName={navItemClassName}
                        completedBlockIds={completedBlockIds}
                        editable={editable}
                        showAddSubLesson
                        onAddSubLesson={() => onAddSubLessonUnderFlat?.(node.block.id)}
                        onRename={(label) => onRenameBlock?.(node.block.id, label)}
                        onDelete={() => onDeleteBlock?.(node.block.id)}
                        onMoveUp={() => onMoveBlock?.(node.block.id, -1)}
                        onMoveDown={() => onMoveBlock?.(node.block.id, 1)}
                      />
                    );
                  }

                  const isSectionExpanded = expandedSections.has(node.id);
                  const parentBlock = lessonGroupNav ? getSectionParentBlock(node) : null;
                  const sectionItems = lessonGroupNav
                    ? getSectionSubLessonBlocks(node)
                    : node.items;
                  const isSectionActive =
                    lessonGroupNav &&
                    (activeBlockId === parentBlock?.id || sectionContainsBlock(node, activeBlockId));

                  return (
                    <Fragment key={node.id}>
                      {lessonGroupNav && sectionIndex > 0 ? (
                        <hr className="lesson-outline-divider" aria-hidden="true" />
                      ) : null}
                      <div
                        className={`course-outline-section${lessonGroupNav ? ' lesson-outline-section' : ''}${
                          isSectionExpanded ? ' is-expanded' : ''
                        }`}
                      >
                      <OutlineSectionHeader
                        title={node.title}
                        isExpanded={isSectionExpanded}
                        sectionBtnClassName={sectionBtnClassName}
                        onToggle={() => onToggleSection(node.id)}
                        editable={editable}
                        onRename={(newTitle) => onRenameSection?.(mod, node.title, newTitle)}
                        onAddSubLesson={() =>
                          onAddSubLessonInSection?.(mod, node.title, node.items[node.items.length - 1]?.id)
                        }
                        onDelete={() => onDeleteSection?.(mod, node.title)}
                        learnGroupHeader={lessonGroupNav}
                        parentBlockId={parentBlock?.id}
                        isSectionActive={isSectionActive}
                        onSelectParent={onSelectBlock}
                      />
                      {isSectionExpanded && (
                        <div className={sectionItemsClassName}>
                          {sectionItems.map((block) => (
                            <OutlineNavRow
                              key={block.id}
                              block={block}
                              blocksForIndex={blocksForIndex}
                              activeBlockId={activeBlockId}
                              onSelectBlock={onSelectBlock}
                              navItemClassName={`${navItemClassName} is-sub-lesson`}
                              completedBlockIds={completedBlockIds}
                              isNested
                              editable={editable}
                              onRename={(label) => onRenameBlock?.(block.id, label)}
                              onDelete={() => onDeleteBlock?.(block.id)}
                              onMoveUp={() => onMoveBlock?.(block.id, -1)}
                              onMoveDown={() => onMoveBlock?.(block.id, 1)}
                            />
                          ))}
                          {editable && (
                            <button
                              type="button"
                              className="outline-inline-add"
                              onClick={() =>
                                onAddSubLessonInSection?.(mod, node.title, node.items[node.items.length - 1]?.id)
                              }
                            >
                              <Plus size={14} /> Sub-lesson
                            </button>
                          )}
                        </div>
                      )}
                      </div>
                    </Fragment>
                  );
                })}
                {editable && (
                  <button
                    type="button"
                    className="outline-inline-add outline-inline-add--module"
                    onClick={() => onAddLessonInModule?.(mod)}
                  >
                    <Plus size={14} /> Lesson
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}

function OutlineSectionHeader({
  title,
  isExpanded,
  sectionBtnClassName,
  onToggle,
  editable,
  onRename,
  onAddSubLesson,
  onDelete,
  learnGroupHeader = false,
  parentBlockId,
  isSectionActive = false,
  onSelectParent,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(title);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!editing) setDraft(title);
  }, [title, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitRename = () => {
    const next = draft.trim();
    if (next && next !== title) onRename?.(next);
    setEditing(false);
  };

  if (learnGroupHeader && !editable) {
    return (
      <div className={`lesson-group-header${isSectionActive ? ' is-active' : ''}`}>
        <button
          type="button"
          className="lesson-group-header__main"
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={`${title}, ${isExpanded ? 'collapse' : 'expand'} sub-lessons`}
        >
          <span className="lesson-group-header__title">
            {title}
          </span>
          <span className="lesson-group-header__chevron" aria-hidden>
            {isExpanded ? <ChevronDown size={16} strokeWidth={2.25} /> : <ChevronRight size={16} strokeWidth={2.25} />}
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className={`outline-section-head${editable ? ' is-editable' : ''}`}>
      {editing ? (
        <input
          ref={inputRef}
          className="outline-rename-input outline-rename-input--section"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') {
              setDraft(title);
              setEditing(false);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className={sectionBtnClassName}
          onClick={onToggle}
          aria-expanded={isExpanded}
        >
          <span>{title}</span>
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      )}
      {editable && !editing && (
        <div className="outline-row-actions">
          <button type="button" className="outline-icon-btn" title="Add sub-lesson" onClick={onAddSubLesson}>
            <Plus size={14} />
          </button>
          <button
            type="button"
            className="outline-icon-btn"
            title="Rename parent lesson"
            onClick={() => setEditing(true)}
          >
            <Pencil size={13} />
          </button>
          <button type="button" className="outline-icon-btn danger" title="Delete group" onClick={onDelete}>
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

function OutlineNavRow({
  block,
  blocksForIndex,
  activeBlockId,
  onSelectBlock,
  navItemClassName,
  isNested = false,
  editable = false,
  showAddSubLesson = false,
  onAddSubLesson,
  onRename,
  onDelete,
  onMoveUp,
  onMoveDown,
  completedBlockIds,
}) {
  const idx = blocksForIndex.findIndex((b) => b.id === block.id);
  const label = getBlockNavLabel(block, idx);
  const isQuiz = block.type === 'quiz';
  const isActive = activeBlockId === block.id;
  const isComplete = completedBlockIds?.has?.(block.id);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(
    block.type === 'markdown' ? block.navTitle || '' : block.question || ''
  );
  const inputRef = useRef(null);

  useEffect(() => {
    if (!editing) {
      setDraft(block.type === 'markdown' ? block.navTitle || '' : block.question || '');
    }
  }, [block, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commitRename = () => {
    const next = draft.trim();
    if (next) onRename?.(next);
    setEditing(false);
  };

  return (
    <div className={`outline-nav-row${isActive ? ' active' : ''}${editable ? ' is-editable' : ''}`}>
      {editing ? (
        <input
          ref={inputRef}
          className="outline-rename-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitRename();
            if (e.key === 'Escape') {
              setDraft(block.type === 'markdown' ? block.navTitle || '' : block.question || '');
              setEditing(false);
            }
          }}
        />
      ) : (
        <button
          type="button"
          className={`${navItemClassName}${isActive ? ' active' : ''}${isQuiz ? ' is-quiz' : ''}${
            isNested ? ' is-nested' : ''
          }${isComplete ? ' is-complete' : ''}`}
          onClick={() => onSelectBlock(block.id)}
          onDoubleClick={() => editable && setEditing(true)}
        >
          {isComplete && !editable ? (
            <Check size={14} className="outline-nav-complete-icon" aria-hidden />
          ) : null}
          <span className="outline-nav-label">{label}</span>
        </button>
      )}
      {editable && !editing && (
        <div className="outline-row-actions">
          {showAddSubLesson && !block.sectionTitle?.trim() && (
            <button type="button" className="outline-icon-btn" title="Add sub-lesson" onClick={onAddSubLesson}>
              <Plus size={14} />
            </button>
          )}
          <button type="button" className="outline-icon-btn" title="Move up" onClick={onMoveUp}>
            <ChevronUp size={14} />
          </button>
          <button type="button" className="outline-icon-btn" title="Move down" onClick={onMoveDown}>
            <ChevronDownIcon size={14} />
          </button>
          <button type="button" className="outline-icon-btn" title="Rename" onClick={() => setEditing(true)}>
            <Pencil size={13} />
          </button>
          <button type="button" className="outline-icon-btn danger" title="Delete" onClick={onDelete}>
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
