import React from 'react';
import { Card, Avatar, Button, Tag, Typography } from 'antd';
import { ToolOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Tool {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  features: string[];
  compatibility: string[];
  category: string;
  callCount: number;
}

interface ToolCardProps {
  tool: Tool;
  isSelected: boolean;
  executing: boolean;
  onSelect: (id: string) => void;
  onUse: (id: string) => void;
  formatCallCount: (count: number) => string;
  getIcon: (iconName: string) => React.ReactNode;
}

const ToolCard: React.FC<ToolCardProps> = ({
  tool,
  isSelected,
  executing,
  onSelect,
  onUse,
  formatCallCount,
  getIcon
}) => {
  return (
    <Card
      hoverable
      className={`cursor-pointer transition-all duration-200 border rounded-lg ${
        isSelected
          ? 'border-purple-500 shadow-md bg-purple-50' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      bodyStyle={{ padding: '16px' }}
      onClick={() => onSelect(tool.id)}
    >
      <div className="flex items-start space-x-3">
        <div className="relative">
          <Avatar 
            icon={getIcon(tool.icon)} 
            size={40}
            className={`${
              isSelected 
                ? 'bg-purple-500' 
                : 'bg-gray-500'
            }`}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <Text className="font-medium text-gray-800 truncate text-sm">
              {tool.name}
            </Text>
            <Button 
              type="primary" 
              size="small" 
              icon={<ToolOutlined />}
              loading={executing}
              onClick={(e) => {
                e.stopPropagation();
                onUse(tool.id);
              }}
            >
              使用
            </Button>
          </div>
          
          <Text className="text-xs text-gray-500 block mb-2">
            {tool.description}
          </Text>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-purple-600 font-medium">
                使用 {formatCallCount(tool.callCount)} 次
              </span>
            </div>
            <Text className="text-xs text-gray-400">
              {tool.type}
            </Text>
          </div>
        
          {isSelected && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <Text className="text-xs text-gray-600 block mb-2">
                功能特性：
              </Text>
              <div className="flex flex-wrap gap-1 mb-3">
                {tool.features.map((feature, index) => (
                  <Tag key={index} color="purple" className="text-xs">
                    {feature}
                  </Tag>
                ))}
              </div>
              <Text className="text-xs text-gray-600 block mb-1">
                兼容性：
              </Text>
              <div className="flex flex-wrap gap-1">
                {tool.compatibility.map((comp, index) => (
                  <Tag key={index} color="default" className="text-xs">
                    {comp}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ToolCard; 