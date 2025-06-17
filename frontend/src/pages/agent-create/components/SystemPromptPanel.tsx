import React, { useState } from 'react';
import { Input, Typography, Card, Button, message, Tooltip } from 'antd';
import { EditOutlined, ThunderboltOutlined, LoadingOutlined } from '@ant-design/icons';
import { optimizePrompt, PromptOptimizeRequest } from '../../../api';

const { TextArea } = Input;
const { Title, Text } = Typography;

interface SystemPromptPanelProps {
  systemPrompt: string;
  onSystemPromptChange: (systemPrompt: string) => void;
}

const SystemPromptPanel: React.FC<SystemPromptPanelProps> = ({
  systemPrompt,
  onSystemPromptChange
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Handle prompt optimization
  const handleOptimizePrompt = async () => {
    if (!systemPrompt.trim()) {
      message.warning('Please enter prompt content first');
      return;
    }

    setIsOptimizing(true);
    try {
      const request: PromptOptimizeRequest = {
        originalPrompt: systemPrompt
      };

      const response = await optimizePrompt(request);
      
      if (response.success && response.data) {
        onSystemPromptChange(response.data.optimizedPrompt);
        message.success('Prompt optimized successfully!');
      } else {
        message.error(response.error || 'Failed to optimize prompt');
      }
    } catch (error) {
      message.error('Error occurred while optimizing prompt');
      console.error('Optimize prompt error:', error);
    } finally {
      setIsOptimizing(false);
    }
  };
  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden">
      {/* 头部 */}
      <div className="p-8 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <EditOutlined className="text-purple-600 text-sm" />
            </div>
            <Title level={4} className="m-0 text-gray-900 font-medium">
              System Instructions
            </Title>
          </div>
          
          {/* Optimize Button - OpenAI Style */}
          <Tooltip title="Use AI to optimize your prompt and convert it to proper System Prompt format">
            <Button
              type="text"
              size="small"
              icon={isOptimizing ? <LoadingOutlined /> : <ThunderboltOutlined />}
              onClick={handleOptimizePrompt}
              disabled={isOptimizing || !systemPrompt.trim()}
              className="text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors rounded-lg px-3 py-1.5 h-auto text-xs font-medium"
            >
              {isOptimizing ? 'Optimizing...' : 'Optimize'}
            </Button>
          </Tooltip>
        </div>
        <Text className="text-gray-500 text-sm leading-relaxed">
          Define your agent's role, behavior, and response style. Be specific about the persona and capabilities.
        </Text>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 px-8 pb-8 flex flex-col">
        {/* 提示词编辑器 - 占满剩余高度 */}
        <div className="flex-1">
          <TextArea
            value={systemPrompt}
            onChange={(e) => onSystemPromptChange(e.target.value)}
            placeholder="You are a helpful AI assistant. You should..."
            className="h-full resize-none border-gray-200 rounded-lg hover:border-gray-300 focus:border-black focus:ring-1 focus:ring-black transition-colors"
            showCount
          />
        </div>
      </div>
    </div>
  );
};

export default SystemPromptPanel; 