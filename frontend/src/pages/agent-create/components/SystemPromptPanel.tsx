import React from 'react';
import { Input, Typography, Card } from 'antd';
import { EditOutlined } from '@ant-design/icons';

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
  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden">
      {/* 头部 */}
      <div className="p-8 pb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <EditOutlined className="text-purple-600 text-sm" />
          </div>
          <Title level={4} className="m-0 text-gray-900 font-medium">
            System Instructions
          </Title>
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
            maxLength={2000}
          />
        </div>
      </div>
    </div>
  );
};

export default SystemPromptPanel; 