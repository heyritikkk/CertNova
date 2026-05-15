import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import './MarkdownEditor.css';

const MarkdownEditor = ({ value, onChange, placeholder }) => (
  <div className="markdown-editor-wrap" data-color-mode="light">
    <MDEditor
      value={value || ''}
      onChange={(val) => onChange(val ?? '')}
      preview="edit"
      height={420}
      textareaProps={{ placeholder: placeholder || 'Write full course content in Markdown…' }}
      visibleDragbar={false}
    />
  </div>
);

export default MarkdownEditor;
