import React, { useRef } from 'react';
import CopyButton from './CopyButton';

interface TableWithCopyProps {
  children: React.ReactNode;
  [key: string]: any;
}

const TableWithCopy: React.FC<TableWithCopyProps> = ({ children, ...props }) => {
  const tableRef = useRef<HTMLTableElement>(null);

  return (
    <div className="table-container overflow-x-auto my-4 relative group border border-gray-300 rounded-lg">
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <CopyButton 
          tooltip="复制表格数据"
          className="bg-white hover:bg-gray-50 border border-gray-300 shadow-sm"
          onCopy={() => {
            if (tableRef.current) {
              const rows = Array.from(tableRef.current.querySelectorAll('tr'));
              return rows.map(row => {
                const cells = Array.from(row.querySelectorAll('th, td'));
                return cells.map(cell => {
                  const text = cell.textContent || '';
                  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
                    return `"${text.replace(/"/g, '""')}"`;
                  }
                  return text;
                }).join(',');
              }).join('\n');
            }
            return '';
          }}
        />
      </div>
      <table 
        ref={tableRef}
        className="w-max min-w-full border-collapse bg-white"
        style={{
          tableLayout: 'fixed'
        }}
        {...props}
      >
        {children}
      </table>
    </div>
  );
};

export default TableWithCopy; 