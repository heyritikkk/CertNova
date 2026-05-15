/**
 * Applies a toolbar action to markdown text and returns updated text + selection.
 */
export function applyMarkdownAction(text, start, end, action) {
  const safeStart = Math.max(0, Math.min(start, text.length));
  const safeEnd = Math.max(safeStart, Math.min(end, text.length));
  const selected = text.slice(safeStart, safeEnd);

  if (action.type === 'insert') {
    const insert = action.value;
    const next = text.slice(0, safeStart) + insert + text.slice(safeEnd);
    let selStart = safeStart + insert.length;
    let selEnd = selStart;

    if (action.selectOffset != null && action.selectLength != null) {
      selStart = safeStart + action.selectOffset;
      selEnd = selStart + action.selectLength;
    }

    return { text: next, selectionStart: selStart, selectionEnd: selEnd };
  }

  if (action.type === 'linePrefix') {
    const lineStart = text.lastIndexOf('\n', safeStart - 1) + 1;
    const lineEnd = text.indexOf('\n', safeEnd);
    const actualLineEnd = lineEnd === -1 ? text.length : lineEnd;
    const line = text.slice(lineStart, actualLineEnd);
    const prefix = action.prefix;

    if (line.startsWith(prefix)) {
      const next =
        text.slice(0, lineStart) + line.slice(prefix.length) + text.slice(actualLineEnd);
      const delta = -prefix.length;
      return {
        text: next,
        selectionStart: Math.max(lineStart, safeStart + delta),
        selectionEnd: Math.max(lineStart, safeEnd + delta),
      };
    }

    const next =
      text.slice(0, lineStart) + prefix + text.slice(lineStart);
    return {
      text: next,
      selectionStart: safeStart + prefix.length,
      selectionEnd: safeEnd + prefix.length,
    };
  }

  if (action.type === 'wrap') {
    const { before, after, placeholder = '' } = action;
    const inner = selected || placeholder;

    if (
      selected &&
      selected.startsWith(before) &&
      selected.endsWith(after) &&
      selected.length >= before.length + after.length
    ) {
      const unwrapped = selected.slice(before.length, selected.length - after.length);
      const next = text.slice(0, safeStart) + unwrapped + text.slice(safeEnd);
      return {
        text: next,
        selectionStart: safeStart,
        selectionEnd: safeStart + unwrapped.length,
      };
    }

    const wrapped = before + inner + after;
    const next = text.slice(0, safeStart) + wrapped + text.slice(safeEnd);

    if (!selected) {
      const cursor = safeStart + before.length;
      return {
        text: next,
        selectionStart: cursor,
        selectionEnd: cursor + (placeholder?.length || 0),
      };
    }

    return {
      text: next,
      selectionStart: safeStart + before.length,
      selectionEnd: safeStart + before.length + inner.length,
    };
  }

  if (action.type === 'link') {
    const label = selected || 'link text';
    const url =
      typeof window !== 'undefined'
        ? window.prompt('Enter link URL', 'https://')
        : 'https://';
    if (url == null || url === '') {
      return { text, selectionStart: safeStart, selectionEnd: safeEnd };
    }
    const md = `[${label}](${url.trim()})`;
    const next = text.slice(0, safeStart) + md + text.slice(safeEnd);
    return {
      text: next,
      selectionStart: safeStart + md.length,
      selectionEnd: safeStart + md.length,
    };
  }

  return { text, selectionStart: safeStart, selectionEnd: safeEnd };
}

export const MARKDOWN_TOOLBAR_ACTIONS = [
  { key: 'bold', label: 'Bold', type: 'wrap', before: '**', after: '**', placeholder: 'bold text' },
  { key: 'italic', label: 'Italic', type: 'wrap', before: '*', after: '*', placeholder: 'italic text' },
  { key: 'strike', label: 'Strikethrough', type: 'wrap', before: '~~', after: '~~', placeholder: 'text' },
  { key: 'h1', label: 'Heading 1', type: 'linePrefix', prefix: '# ' },
  { key: 'h2', label: 'Heading 2', type: 'linePrefix', prefix: '## ' },
  { key: 'h3', label: 'Heading 3', type: 'linePrefix', prefix: '### ' },
  { key: 'link', label: 'Insert link', type: 'link' },
  { key: 'quote', label: 'Quote', type: 'linePrefix', prefix: '> ' },
  { key: 'code', label: 'Inline code', type: 'wrap', before: '`', after: '`', placeholder: 'code' },
  {
    key: 'codeblock',
    label: 'Code block',
    type: 'insert',
    value: '```\n\n```',
    selectOffset: 4,
    selectLength: 0,
  },
  { key: 'ul', label: 'Bullet list', type: 'linePrefix', prefix: '- ' },
  { key: 'ol', label: 'Numbered list', type: 'linePrefix', prefix: '1. ' },
  {
    key: 'image',
    label: 'Image',
    type: 'insert',
    value: '![description](https://)',
    selectOffset: 2,
    selectLength: 11,
  },
  { key: 'hr', label: 'Divider', type: 'insert', value: '\n\n---\n\n' },
];
