import React from 'react';
import { Card, Avatar, Button, Tag, Typography } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Agent {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  model: string;
  capability: string[];
  category: string;
  callCount: number;
}

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  formatCallCount: (count: number) => string;
  getIcon: (iconName: string) => React.ReactNode;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isSelected,
  onSelect,
  formatCallCount,
  getIcon
}) => {
  return (
    <Card
      hoverable
      className={`cursor-pointer transition-all duration-200 border rounded-lg ${
        isSelected
          ? 'border-blue-500 shadow-md bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      bodyStyle={{ padding: '16px' }}
      onClick={() => onSelect(agent.id)}
    >
      <div className="flex items-start space-x-3">
        <div className="relative">
          <Avatar 
            icon={getIcon(agent.icon)} 
            size={40}
            className={`${
              isSelected 
                ? 'bg-blue-500' 
                : 'bg-gray-500'
            }`}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <Text className="font-medium text-gray-800 truncate text-sm">
              {agent.name}
            </Text>
            <Button 
              type="text" 
              size="small" 
              icon={<MoreOutlined />}
              className="text-gray-400 hover:text-gray-600"
            />
          </div>
          
          <Text className="text-xs text-gray-500 block mb-2">
            {agent.description}
          </Text>
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-green-600 font-medium">
                调用 {formatCallCount(agent.callCount)} 次
              </span>
            </div>
            <Text className="text-xs text-gray-400">
              {agent.model}
            </Text>
          </div>
        
          {isSelected && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <Text className="text-xs text-gray-600 block mb-2">
                能力：
              </Text>
              <div className="flex flex-wrap gap-1">
                {agent.capability.map((cap, index) => (
                  <Tag key={index} color="blue" className="text-xs">
                    {cap}
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

export default AgentCard; 