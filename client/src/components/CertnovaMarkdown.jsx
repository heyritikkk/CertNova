import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PlantUMLRenderer } from './PlantUMLRenderer';
import { flattenMarkdownChildren, getCalloutVariant } from '../lib/markdownCallouts';

const markdownComponents = {
  blockquote({ children }) {
    const text = flattenMarkdownChildren(children);
    const variant = getCalloutVariant(text);
    const className =
      variant === 'default' ? undefined : `prose-callout prose-callout--${variant}`;
    return <blockquote className={className}>{children}</blockquote>;
  },
  code({ inline, className, children, ...props }) {
    const match = /language-(plantuml|puml)/i.exec(className || '');
    if (!inline && match) {
      return <PlantUMLRenderer code={String(children).replace(/\n$/, '')} />;
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
};

/**
 * Renders course lesson markdown with shared CertNova typography (see certnova-prose.css).
 */
export default function CertnovaMarkdown({ children }) {
  const content = children?.trim() ? children : '_Nothing to preview yet._';

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
}
