import React from 'react';
import { Card, Avatar, Tag, Typography } from 'antd';

const { Text } = Typography;

interface Workflow {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  steps: string[];
  agents: string[];
  estimatedTime: string;
  category: string;
  callCount: number;
}

interface WorkflowCardProps {
  workflow: Workflow;
  isSelected: boolean;
  onSelect: (id: string) => void;
  formatCallCount: (count: number) => string;
  getIcon: (iconName: string) => React.ReactNode;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
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
          ? 'border-green-500 shadow-md bg-green-50' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      bodyStyle={{ padding: '12px' }}
      onClick={() => onSelect(workflow.id)}
    >
      <div className="flex items-start space-x-3">
        <div className="relative">
          <Avatar 
            icon={getIcon(workflow.icon)} 
            size={32}
            className={`${
              isSelected 
                ? 'bg-green-500' 
                : 'bg-gray-500'
            }`}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="mb-1">
            <Text className="font-medium text-gray-800 truncate text-sm">
              {workflow.name}
            </Text>
          </div>
          
          <Text className="text-xs text-gray-500 block mb-1">
            {workflow.description}
          </Text>
          
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-green-600 font-medium">
                执行 {formatCallCount(workflow.callCount)} 次
              </span>
            </div>
            <Text className="text-xs text-gray-400">
              {workflow.estimatedTime}
            </Text>
          </div>
        
          {isSelected && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <Text className="text-xs text-gray-600 block mb-1">
                执行步骤：
              </Text>
              <div className="space-y-1 mb-2">
                {workflow.steps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full text-xs flex items-center justify-center">
                      {index + 1}
                    </span>
                    <Text className="text-xs text-gray-600">{step}</Text>
                  </div>
                ))}
              </div>
              <Text className="text-xs text-gray-600 block mb-1">
                关联Agent：
              </Text>
              <div className="flex flex-wrap gap-1">
                {workflow.agents.map((agent, index) => (
                  <Tag key={index} color="green" className="text-xs">
                    {agent}
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

export default WorkflowCard; 