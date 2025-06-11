import React from 'react';
import { Card, Typography } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  preview: string;
  uploadTime: string;
}

interface ResourceCardProps {
  document: Document;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  document,
  isSelected,
  onSelect
}) => {
  const getFileIcon = (type: string) => {
    return <FileTextOutlined className="text-blue-500" />;
  };

  return (
    <Card
      hoverable
      className={`cursor-pointer transition-all duration-200 border rounded-lg ${
        isSelected 
          ? 'border-black shadow-md bg-gray-50' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      bodyStyle={{ padding: '12px' }}
      onClick={() => onSelect(document.id)}
    >
      <div className="flex items-start space-x-3">
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
          {getFileIcon(document.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <Text className="font-medium text-gray-900 truncate text-sm">
              {document.name}
            </Text>
            <Text className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {document.size}
            </Text>
          </div>
          <Text className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-1">
            {document.preview}
          </Text>
          <Text className="text-xs text-gray-400">
            {document.uploadTime}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default ResourceCard; 