import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <>
      <style>{`
        .markdown-content {
          line-height: 1.6;
          color: #374151;
        }
        .markdown-content h1,
        .markdown-content h2,
        .markdown-content h3 {
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .markdown-content p {
          margin-bottom: 1rem;
        }
        .markdown-content ul,
        .markdown-content ol {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .markdown-content li {
          margin-bottom: 0.25rem;
        }
        .markdown-content blockquote {
          margin: 1rem 0;
        }
        .markdown-content table {
          margin: 1rem 0;
        }
        .markdown-content hr {
          margin: 1.5rem 0;
        }
        .markdown-content pre {
          margin: 0.5rem 0;
        }
        .markdown-content code {
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        }
      `}</style>
      <div className={`markdown-content ${className}`}>
        <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // 代码块渲染
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            
            return !inline && language ? (
              <SyntaxHighlighter
                style={oneDark}
                language={language}
                PreTag="div"
                className="rounded-lg"
                customStyle={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code 
                className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800" 
                {...props}
              >
                {children}
              </code>
            );
          },
          // 标题渲染
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mb-3 mt-4 text-gray-900 border-b border-gray-200 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-bold mb-2 mt-3 text-gray-900">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-bold mb-2 mt-3 text-gray-900">
              {children}
            </h3>
          ),
          // 段落渲染
          p: ({ children }) => (
            <p className="mb-3 leading-relaxed text-gray-800">
              {children}
            </p>
          ),
          // 列表渲染
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-3 space-y-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-3 space-y-1">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-800">
              {children}
            </li>
          ),
          // 引用块渲染
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-3 bg-gray-50 italic text-gray-700">
              {children}
            </blockquote>
          ),
          // 表格渲染
          table: ({ children }) => (
            <div className="overflow-x-auto my-3">
              <table className="min-w-full border-collapse border border-gray-300">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-100">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody>
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-gray-200">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 px-3 py-2 text-left font-semibold text-gray-900">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-3 py-2 text-gray-800">
              {children}
            </td>
          ),
          // 链接渲染
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {children}
            </a>
          ),
          // 强调渲染
          strong: ({ children }) => (
            <strong className="font-bold text-gray-900">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-gray-800">
              {children}
            </em>
          ),
          // 分割线
          hr: () => (
            <hr className="border-t border-gray-300 my-4" />
          ),
          // 删除线（GFM扩展）
          del: ({ children }) => (
            <del className="line-through text-gray-600">
              {children}
            </del>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
    </>
  );
};

export default MarkdownRenderer; 