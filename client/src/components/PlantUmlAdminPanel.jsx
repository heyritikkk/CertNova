import { useState } from 'react';
import { X, Copy, ArrowDownToLine } from 'lucide-react';
import { PlantUMLRenderer } from './PlantUMLRenderer';
import { PLANTUML_STARTER, toPlantUmlMarkdownBlock } from '../lib/plantUmlMarkdown';
import './PlantUmlAdminPanel.css';

export default function PlantUmlAdminPanel({ onInsert, onClose }) {
  const [code, setCode] = useState(PLANTUML_STARTER);
  const [copyHint, setCopyHint] = useState('');

  const handleInsert = () => {
    const block = toPlantUmlMarkdownBlock(code);
    if (!block) return;
    onInsert(block);
  };

  const handleCopyMarkdown = async () => {
    const block = toPlantUmlMarkdownBlock(code);
    if (!block) return;
    try {
      await navigator.clipboard.writeText(block.trim());
      setCopyHint('Markdown block copied');
      window.setTimeout(() => setCopyHint(''), 2400);
    } catch {
      setCopyHint('Copy failed — use Insert instead');
      window.setTimeout(() => setCopyHint(''), 2400);
    }
  };

  return (
    <section className="plantuml-admin-panel" aria-label="PlantUML diagram editor">
      <header className="plantuml-admin-panel__head">
        <div>
          <h5>PlantUML diagram</h5>
          <p>
            Paste or edit code below, preview the diagram, then insert into the lesson. Students see
            the same output on the learn page.
          </p>
        </div>
        <button type="button" className="plantuml-admin-panel__close" onClick={onClose} title="Close">
          <X size={18} />
        </button>
      </header>

      <div className="plantuml-admin-panel__body">
        <div className="plantuml-admin-panel__editor">
          <label htmlFor="plantuml-admin-code">PlantUML source</label>
          <textarea
            id="plantuml-admin-code"
            className="plantuml-admin-panel__code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={14}
          />
          <p className="plantuml-admin-panel__note">
            You can also type{' '}
            <code>{'```plantuml'}</code> directly in the lesson markdown — both methods work.
          </p>
        </div>

        <div className="plantuml-admin-panel__preview">
          <span className="plantuml-admin-panel__preview-label">Live preview</span>
          {code.trim() ? (
            <PlantUMLRenderer code={code} />
          ) : (
            <p className="plantuml-admin-panel__preview-empty">Add diagram code to see a preview.</p>
          )}
        </div>
      </div>

      <footer className="plantuml-admin-panel__actions">
        <button
          type="button"
          className="plantuml-admin-panel__btn plantuml-admin-panel__btn--primary"
          disabled={!code.trim()}
          onClick={handleInsert}
        >
          <ArrowDownToLine size={16} />
          Insert into lesson
        </button>
        <button
          type="button"
          className="plantuml-admin-panel__btn"
          disabled={!code.trim()}
          onClick={handleCopyMarkdown}
        >
          <Copy size={16} />
          Copy markdown block
        </button>
        <button
          type="button"
          className="plantuml-admin-panel__btn plantuml-admin-panel__btn--ghost"
          onClick={() => setCode(PLANTUML_STARTER)}
        >
          Reset template
        </button>
        {copyHint ? <span className="plantuml-admin-panel__copy-hint">{copyHint}</span> : null}
      </footer>
    </section>
  );
}
