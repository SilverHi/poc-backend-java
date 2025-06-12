import React from 'react';
import { Card, Typography } from 'antd';
import { LinkOutlined, FileTextOutlined, BugOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ExternalSystem {
  id: string;
  name: string;
  type: 'confluence' | 'jira';
  description: string;
  url?: string;
}

interface ExternalSystemCardProps {
  system: ExternalSystem;
  isSelected: boolean;
  onSelect: (system: ExternalSystem) => void;
}

const ExternalSystemCard: React.FC<ExternalSystemCardProps> = ({
  system,
  isSelected,
  onSelect
}) => {
  const getSystemIcon = (type: string) => {
    switch (type) {
      case 'confluence':
        return <FileTextOutlined className="text-blue-600" />;
      case 'jira':
        return <BugOutlined className="text-blue-600" />;
      default:
        return <LinkOutlined className="text-blue-600" />;
    }
  };

  const getSystemColor = (type: string) => {
    switch (type) {
      case 'confluence':
        return 'border-blue-500 bg-blue-50';
      case 'jira':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <Card
      hoverable
      className={`cursor-pointer transition-all duration-200 border rounded-lg ${
        isSelected 
          ? `${getSystemColor(system.type)} shadow-md` 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
      }`}
      bodyStyle={{ padding: '12px' }}
      onClick={() => onSelect(system)}
    >
      <div className="flex items-start space-x-3">
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
          {getSystemIcon(system.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <Text className="font-medium text-gray-900 truncate text-sm">
              {system.name}
            </Text>
            <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
              <LinkOutlined className="text-xs text-gray-400" />
              <Text className="text-xs text-gray-500 uppercase font-medium">
                {system.type}
              </Text>
            </div>
          </div>
          <Text className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-1">
            {system.description}
          </Text>
          <Text className="text-xs text-gray-400">
            External System Reference
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default ExternalSystemCard; 