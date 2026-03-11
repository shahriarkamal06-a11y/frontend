import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] || []), 'style', 'id', 'title'],
    a: [...(defaultSchema.attributes?.a || []), 'target', 'rel'],
    img: [...(defaultSchema.attributes?.img || []), 'loading', 'width', 'height'],
  },
};

const defaultComponents = {
  h1: ({ ...props }) => <h1 className="mt-8 mb-4 text-3xl font-bold text-slate-950" {...props} />,
  h2: ({ ...props }) => <h2 className="mt-8 mb-4 text-2xl font-semibold text-slate-950" {...props} />,
  h3: ({ ...props }) => <h3 className="mt-6 mb-3 text-xl font-semibold text-slate-950" {...props} />,
  h4: ({ ...props }) => <h4 className="mt-5 mb-3 text-lg font-semibold text-slate-900" {...props} />,
  p: ({ ...props }) => <p className="mb-4 leading-7 text-slate-700" {...props} />,
  ul: ({ ...props }) => <ul className="mb-5 list-disc space-y-2 pl-5 text-slate-700" {...props} />,
  ol: ({ ...props }) => <ol className="mb-5 list-decimal space-y-2 pl-5 text-slate-700" {...props} />,
  li: ({ ...props }) => <li className="leading-7" {...props} />,
  blockquote: ({ ...props }) => <blockquote className="my-6 border-l-4 border-violet-300 bg-violet-50/50 px-4 py-3 italic text-slate-700" {...props} />,
  a: ({ href, ...props }) => (
    <a
      href={href}
      target={href?.startsWith('http') ? '_blank' : undefined}
      rel={href?.startsWith('http') ? 'noreferrer' : undefined}
      className="font-medium text-violet-700 underline underline-offset-4 hover:text-violet-800"
      {...props}
    />
  ),
  code: ({ inline, className, children, ...props }) => (
    inline ? (
      <code className="rounded bg-slate-100 px-1.5 py-0.5 text-sm text-slate-800" {...props}>
        {children}
      </code>
    ) : (
      <code className={`block overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm text-slate-100 ${className || ''}`} {...props}>
        {children}
      </code>
    )
  ),
  pre: ({ ...props }) => <pre className="mb-5 overflow-x-auto" {...props} />,
  hr: ({ ...props }) => <hr className="my-8 border-slate-200" {...props} />,
  table: ({ ...props }) => (
    <div className="mb-6 overflow-x-auto">
      <table className="min-w-full border border-slate-200 text-left text-sm" {...props} />
    </div>
  ),
  thead: ({ ...props }) => <thead className="bg-slate-100" {...props} />,
  th: ({ ...props }) => <th className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-900" {...props} />,
  td: ({ ...props }) => <td className="border-b border-slate-100 px-4 py-3 align-top text-slate-700" {...props} />,
  img: ({ alt, ...props }) => <img alt={alt || ''} className="mx-auto my-6 max-w-2xl rounded-3xl border border-slate-200" {...props} />,
};

const RichContent = ({
  content,
  className = '',
  containerClassName = 'mx-auto max-w-3xl',
  components = {},
}) => (
  <div className={`${containerClassName} ${className}`.trim()}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[
        rehypeRaw,
        [rehypeSanitize, sanitizeSchema],
      ]}
      components={{ ...defaultComponents, ...components }}
    >
      {content || ''}
    </ReactMarkdown>
  </div>
);

export default RichContent;
