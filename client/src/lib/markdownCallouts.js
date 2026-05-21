/** Detect Professor Tip vs Real life example blockquotes for styling. */
export function getCalloutVariant(text) {
  const t = String(text || '').toLowerCase();
  if (/professor['\u2019]?s tip/.test(t)) return 'tip';
  if (/real[-\s]?life example/.test(t)) return 'example';
  return 'default';
}

export function flattenMarkdownChildren(children) {
  if (children == null) return '';
  if (typeof children === 'string') return children;
  if (Array.isArray(children)) return children.map(flattenMarkdownChildren).join('');
  if (children?.props?.children) return flattenMarkdownChildren(children.props.children);
  return '';
}
