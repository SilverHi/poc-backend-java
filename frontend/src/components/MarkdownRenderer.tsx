import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import CopyButton from './CopyButton';
import TableWithCopy from './TableWithCopy';

import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

// CSV解析和转换函数
const parseCSVToMarkdownTable = (csvText: string): string => {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return csvText; // 至少需要标题行和一行数据
  
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // 跳过下一个引号
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };
  
  try {
    const rows = lines.map(line => parseCSVLine(line));
    
    // 检查所有行是否有相同的列数
    const columnCount = rows[0].length;
    if (!rows.every(row => row.length === columnCount)) {
      return csvText; // 如果列数不一致，不转换
    }
    
    // 转换为markdown表格
    let markdownTable = '';
    
    // 标题行
    markdownTable += '| ' + rows[0].map(cell => cell.replace(/\|/g, '\\|')).join(' | ') + ' |\n';
    
    // 分割线
    markdownTable += '| ' + rows[0].map(() => '---').join(' | ') + ' |\n';
    
    // 数据行
    for (let i = 1; i < rows.length; i++) {
      markdownTable += '| ' + rows[i].map(cell => cell.replace(/\|/g, '\\|')).join(' | ') + ' |\n';
    }
    
    return markdownTable;
  } catch (error) {
    console.warn('CSV解析失败:', error);
    return csvText;
  }
};

// 检测并转换CSV内容
const processContentWithCSV = (content: string): string => {
  // 匹配可能的CSV块（简单启发式检测）
  const csvBlockRegex = /```csv\n([\s\S]*?)```/g;
  
  let processedContent = content;
  
  // 处理```csv代码块
  processedContent = processedContent.replace(csvBlockRegex, (match, csvContent) => {
    console.log('找到CSV代码块:', csvContent);
    const markdownTable = parseCSVToMarkdownTable(csvContent);
    console.log('转换后的表格:', markdownTable);
    return markdownTable;
  });
  
  return processedContent;
};



const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  // 预处理内容，将CSV转换为markdown表格
  const processedContent = processContentWithCSV(content);
  
  // 调试：打印转换前后的内容
  if (content !== processedContent) {
    console.log('CSV转换前:', content);
    console.log('CSV转换后:', processedContent);
  }
  
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
          border-radius: 8px;
        }
        .markdown-content .table-container {
          margin: 1rem 0;
          overflow: hidden;
          max-width: 100%;
        }
        .markdown-content .table-container::-webkit-scrollbar {
          height: 8px;
        }
        .markdown-content .table-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .markdown-content .table-container::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        .markdown-content .table-container::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        .markdown-content th {
          font-weight: 600;
          max-width: 200px;
          min-width: 80px;
          word-wrap: break-word;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .markdown-content td {
          font-size: 14px;
          max-width: 200px;
          min-width: 80px;
          word-wrap: break-word;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          position: relative;
        }
        .markdown-content td:hover {
          white-space: normal;
          overflow: visible;
          background-color: #f9f9f9;
          z-index: 1;
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
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeContent = String(children).replace(/\n$/, '');
            
            return !inline && language ? (
              <div className="relative group">
                <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <CopyButton 
                    text={codeContent} 
                    tooltip={`复制${language}代码`}
                    className="bg-gray-800 hover:bg-gray-700 text-white hover:text-white"
                  />
                </div>
                <SyntaxHighlighter
                  style={oneDark}
                  language={language}
                  PreTag="div"
                  className="rounded-lg"
                  customStyle={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}
                >
                  {codeContent}
                </SyntaxHighlighter>
              </div>
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
          table: ({ children, ...props }) => (
            <TableWithCopy {...props}>
              {children}
            </TableWithCopy>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-gray-300 hover:bg-gray-50">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="border border-gray-400 px-4 py-3 text-left font-semibold text-gray-900 bg-gray-100" title={typeof children === 'string' ? children : String(children)}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 px-4 py-3 text-gray-800" title={typeof children === 'string' ? children : String(children)}>
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
        {processedContent}
      </ReactMarkdown>
    </div>
    </>
  );
};

export default MarkdownRenderer; 