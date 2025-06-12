import React from 'react';
import { Button } from 'antd';
import { EditOutlined, CheckOutlined } from '@ant-design/icons';

interface EditButtonProps {
  size?: 'small' | 'middle' | 'large';
  className?: string;
  tooltip?: string;
  onEdit?: () => void;
  onSave?: () => void;
  isEditable?: boolean;
  isEditing?: boolean;
  saving?: boolean;
}

const EditButton: React.FC<EditButtonProps> = ({ 
  size = 'small', 
  className = '',
  tooltip = '编辑',
  onEdit,
  onSave,
  isEditable = false,
  isEditing = false,
  saving = false
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isEditing && onEdit) {
      onEdit();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditing && onSave) {
      onSave();
    }
  };

  // 如果不可编辑，不显示按钮
  if (!isEditable) {
    return null;
  }

  // 显示编辑/保存按钮
  return (
    <Button
      type="text"
      size={size}
      icon={isEditing ? <CheckOutlined /> : <EditOutlined />}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      loading={saving}
      className={`
        transition-all duration-200 
        ${isEditing 
          ? 'text-green-600 hover:text-green-700 hover:bg-green-50' 
          : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
        }
        border-none shadow-none
        ${className}
      `}
      title={isEditing ? '保存' : tooltip}
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

export default EditButton; 