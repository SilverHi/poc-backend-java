import React from 'react';
import { Card, Typography, Button } from 'antd';
import { PlayCircleOutlined, CheckCircleOutlined, LoadingOutlined, ClockCircleOutlined, ExclamationCircleOutlined, RedoOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface StepCardProps {
  id: string;
  content: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  timestamp: Date;
  onRetry?: (stepId: string) => void;
  retryData?: any; // 重试所需的数据
}

const StepCard: React.FC<StepCardProps> = ({
  id,
  content,
  status,
  timestamp,
  onRetry,
  retryData
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'waiting':
        return <ClockCircleOutlined className="text-gray-400" />;
      case 'processing':
        return <LoadingOutlined className="text-blue-500" spin />;
      case 'completed':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'error':
        return <ExclamationCircleOutlined className="text-red-500" />;
      default:
        return <ClockCircleOutlined className="text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'waiting':
        return 'border-gray-200 bg-gray-50';
      case 'processing':
        return 'border-blue-200 bg-blue-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const handleRetry = () => {
    if (onRetry) {
      onRetry(id);
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

            {/* 重试按钮 - 只在错误状态且有重试回调时显示 */}
            {status === 'error' && onRetry && (
              <div className="flex-shrink-0">
                <Button
                  type="text"
                  size="small"
                  icon={<RedoOutlined />}
                  onClick={handleRetry}
                  className="text-red-600 hover:text-red-700 hover:bg-red-100 border-0 px-2"
                  title="Retry this step"
                >
                  Retry
                </Button>
              </div>
            )}
            
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