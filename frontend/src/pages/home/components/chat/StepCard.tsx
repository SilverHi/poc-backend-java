import React from 'react';
import { Card, Typography } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface StepCardProps {
  id: string;
  content: string;
  status: 'processing' | 'completed' | 'running';
  timestamp: Date;
}

const StepCard: React.FC<StepCardProps> = ({
  id,
  content,
  status,
  timestamp
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <LoadingOutlined className="text-blue-500" spin />;
      case 'completed':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'running':
        return <PlayCircleOutlined className="text-orange-500" />;
      default:
        return <PlayCircleOutlined className="text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'running':
        return 'border-orange-200 bg-orange-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl">
        <Card 
          className={`border ${getStatusColor()} shadow-md rounded-lg`}
          bodyStyle={{ padding: '12px 16px' }}
          size="small"
        >
          <div className="flex items-center space-x-4">
            {/* 状态图标 */}
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-sm">
              {getStatusIcon()}
            </div>
            
            {/* 步骤内容 */}
            <div className="flex-1 min-w-0">
              <Text className="text-sm font-medium text-gray-800">
                {content}
              </Text>
            </div>
            
            {/* 时间戳 */}
            <div className="flex-shrink-0">
              <Text className="text-xs text-gray-500">
                {timestamp.toLocaleTimeString()}
              </Text>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StepCard; 