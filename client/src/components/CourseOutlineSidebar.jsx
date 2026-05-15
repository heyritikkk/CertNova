import { useEffect, useMemo, useState } from 'react';
import { HelpCircle, Plus } from 'lucide-react';
import {
  addSubLesson,
  addSubLessonUnderFlat,
  addTopLevelLesson,
  createQuizBlock,
  findModuleForBlock,
  findSectionForBlock,
  groupBlocksIntoModules,
  moduleTitleForStorage,
  moveBlockInList,
  removeBlockFromList,
  removeSectionFromModule,
  renameSectionInModule,
  updateBlockInList,
} from '../lib/contentBlocks';
import { CourseOutlineNav } from './CourseOutlineNav';
import './CourseOutlineSidebar.css';

const CourseOutlineSidebar = ({
  blocks,
  activeBlockId,
  onSelectBlock,
  onBlocksChange,
  onBack,
  courseTitle,
  onLogout,
}) => {
  const [expandedModules, setExpandedModules] = useState(() => new Set());
  const [expandedSections, setExpandedSections] = useState(() => new Set());
  const modules = useMemo(() => groupBlocksIntoModules(blocks), [blocks]);

  useEffect(() => {
    const mod = findModuleForBlock(modules, activeBlockId);
    if (mod) {
      setExpandedModules((prev) => new Set([...prev, mod.id]));
    }
    const sec = findSectionForBlock(modules, activeBlockId);
    if (sec) {
      setExpandedSections((prev) => new Set([...prev, sec.id]));
    }
  }, [activeBlockId, modules]);

  useEffect(() => {
    if (modules.length && expandedModules.size === 0) {
      setExpandedModules(new Set([modules[0].id]));
    }
  }, [modules, expandedModules.size]);

  const applyBlocks = (next, selectId) => {
    onBlocksChange(next);
    if (selectId) onSelectBlock(selectId);
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

  const handleAddLessonInModule = (mod) => {
    const { blocks: next, block } = addTopLevelLesson(blocks, mod);
    setExpandedModules((prev) => new Set([...prev, mod.id]));
    applyBlocks(next, block.id);
  };

  const handleAddSubLessonInSection = (mod, sectionTitle, afterId) => {
    const { blocks: next, block } = addSubLesson(blocks, {
      moduleTitle: moduleTitleForStorage(mod),
      sectionTitle,
      afterId,
    });
    const sec = findSectionForBlock(groupBlocksIntoModules(next), block.id);
    if (sec) setExpandedSections((prev) => new Set([...prev, sec.id]));
    applyBlocks(next, block.id);
  };

  const handleAddSubLessonUnderFlat = (blockId) => {
    const { blocks: next, block } = addSubLessonUnderFlat(blocks, blockId);
    const sec = findSectionForBlock(groupBlocksIntoModules(next), block.id);
    if (sec) setExpandedSections((prev) => new Set([...prev, sec.id]));
    applyBlocks(next, block.id);
  };

  const handleRenameBlock = (blockId, label) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;
    const patch =
      block.type === 'markdown' ? { navTitle: label } : { question: label };
    applyBlocks(updateBlockInList(blocks, blockId, patch), blockId);
  };

  const handleRenameSection = (mod, oldTitle, newTitle) => {
    applyBlocks(renameSectionInModule(blocks, mod, oldTitle, newTitle));
  };

  const handleDeleteBlock = (blockId) => {
    if (blocks.length <= 1) {
      window.alert('A course needs at least one lesson.');
      return;
    }
    if (!window.confirm('Delete this lesson?')) return;
    const next = removeBlockFromList(blocks, blockId);
    const fallback = next.find((b) => b.type === 'markdown') || next[0];
    applyBlocks(next, fallback?.id);
  };

  const handleDeleteSection = (mod, sectionTitle) => {
    const count = mod.items.filter((b) => b.sectionTitle?.trim() === sectionTitle?.trim()).length;
    if (
      !window.confirm(
        `Delete "${sectionTitle}" and all ${count} sub-lesson(s) inside it?`
      )
    ) {
      return;
    }
    const next = removeSectionFromModule(blocks, mod, sectionTitle);
    if (next.length === 0) return;
    const fallback = next.find((b) => b.type === 'markdown') || next[0];
    applyBlocks(next, fallback?.id);
  };

  const handleMoveBlock = (blockId, delta) => {
    applyBlocks(moveBlockInList(blocks, blockId, delta), blockId);
  };

  const addQuizBlock = () => {
    const block = createQuizBlock();
    applyBlocks([...blocks, block], block.id);
  };

  return (
    <aside className="course-outline-sidebar">
      <OutlineSidebarHead courseTitle={courseTitle} onBack={onBack} />

      <nav className="course-outline-nav course-outline-nav--editable">
        <CourseOutlineNav
          modules={modules}
          blocksForIndex={blocks}
          activeBlockId={activeBlockId}
          onSelectBlock={onSelectBlock}
          expandedModules={expandedModules}
          onToggleModule={toggleModule}
          expandedSections={expandedSections}
          onToggleSection={toggleSection}
          editable
          onAddLessonInModule={handleAddLessonInModule}
          onAddSubLessonInSection={handleAddSubLessonInSection}
          onAddSubLessonUnderFlat={handleAddSubLessonUnderFlat}
          onRenameBlock={handleRenameBlock}
          onRenameSection={handleRenameSection}
          onDeleteBlock={handleDeleteBlock}
          onDeleteSection={handleDeleteSection}
          onMoveBlock={handleMoveBlock}
        />
      </nav>

      <div className="course-outline-sidebar-footer">
        <button type="button" className="outline-action outline-action--quiz" onClick={addQuizBlock}>
          <HelpCircle size={16} /> Add quiz
        </button>
        {onLogout && (
          <button type="button" className="course-outline-logout" onClick={onLogout}>
            Log out
          </button>
        )}
      </div>
    </aside>
  );
};

function OutlineSidebarHead({ courseTitle, onBack }) {
  return (
    <div className="course-outline-sidebar-head">
      {onBack && (
        <button type="button" className="course-outline-back" onClick={onBack}>
          ← All courses
        </button>
      )}
      <h3>{courseTitle || 'Course outline'}</h3>
      <p>Add, rename, and reorder lessons here. Double-click a name to edit.</p>
    </div>
  );
}

export default CourseOutlineSidebar;
