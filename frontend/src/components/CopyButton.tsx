import React, { useState } from 'react';
import { Button, message } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

interface CopyButtonProps {
  text?: string;
  size?: 'small' | 'middle' | 'large';
  className?: string;
  tooltip?: string;
  onCopy?: () => string; // 自定义复制函数
}

const CopyButton: React.FC<CopyButtonProps> = ({ 
  text, 
  size = 'small', 
  className = '',
  tooltip = '复制',
  onCopy
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      let copyText = text;
      if (onCopy) {
        copyText = onCopy();
      }
      
      if (copyText) {
        await navigator.clipboard.writeText(copyText);
        setCopied(true);
        message.success('已复制到剪贴板');
        
        // 2秒后重置状态
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      }
    } catch (error) {
      console.error('复制失败:', error);
      message.error('复制失败');
    }
  };

  return (
    <Button
      type="text"
      size={size}
      icon={copied ? <CheckOutlined /> : <CopyOutlined />}
      onClick={handleCopy}
      className={`
        transition-all duration-200 
        text-gray-500 hover:text-gray-700 hover:bg-gray-100
        border-none shadow-none
        ${copied ? 'text-green-600 hover:text-green-700' : ''}
        ${className}
      `}
      title={copied ? '已复制!' : tooltip}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '32px',
        height: '32px',
        borderRadius: '6px',
      }}
    />
  );
};

export default CopyButton; 