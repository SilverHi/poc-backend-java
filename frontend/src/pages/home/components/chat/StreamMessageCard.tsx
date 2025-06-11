import React, { useState, useEffect } from 'react';
import { Card, Typography, Tag, Space } from 'antd';
import { UserOutlined, RobotOutlined, FileTextOutlined, ToolOutlined } from '@ant-design/icons';
import MarkdownRenderer from '../../../../components/MarkdownRenderer';

const { Text } = Typography;

interface ReferencedDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'txt' | 'md';
}

interface SelectedAgent {
  id: string;
  name: string;
  type: 'workflow' | 'tool';
  description?: string;
}

interface StreamMessageCardProps {
  id: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  
  // 用户消息相关
  userInput?: string;
  previousAiOutput?: string;
  referencedDocuments?: ReferencedDocument[];
  selectedAgent?: SelectedAgent;
  
  // AI回复相关
  aiResponse?: string;
  isStreaming?: boolean;
  streamingContent?: string;
  
  // 状态
  isTyping?: boolean;
}

const StreamMessageCard: React.FC<StreamMessageCardProps> = ({
  id,
  type,
  timestamp,
  userInput,
  previousAiOutput,
  referencedDocuments = [],
  selectedAgent,
  aiResponse,
  isStreaming = false,
  streamingContent = '',
  isTyping = false
}) => {
  const [displayContent, setDisplayContent] = useState('');
  const [showCursor, setShowCursor] = useState(false);

  const isUserMessage = type === 'user';
  const hasReferencedDocuments = referencedDocuments.length > 0;
  const hasSelectedAgent = !!selectedAgent;
  const hasPreviousAiOutput = !!previousAiOutput;

  // 管理光标闪烁效果
  useEffect(() => {
    if (isStreaming) {
      const interval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setShowCursor(false);
    }
  }, [isStreaming]);

  // 更新显示内容
  useEffect(() => {
    if (isStreaming) {
      setDisplayContent(streamingContent);
    } else if (aiResponse) {
      setDisplayContent(aiResponse);
    }
  }, [isStreaming, streamingContent, aiResponse]);

  return (
    <div className="w-full">
      {/* 消息卡片 */}
      <Card 
        className="border border-gray-200 shadow-md"
        bodyStyle={{ padding: '20px' }}
      >
          {/* 用户消息内容 */}
          {isUserMessage && (
            <div className="space-y-4">
              {/* 上次AI输出（对话延续时） */}
              {hasPreviousAiOutput && (
                <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-green-400">
                  <div className="flex items-center mb-2">
                    <RobotOutlined className="text-green-600 mr-2" />
                    <Text className="text-sm font-medium text-gray-700">上次回复</Text>
                  </div>
                  <div className="text-sm text-gray-600">
                    <MarkdownRenderer content={previousAiOutput} />
                  </div>
                </div>
              )}

              {/* 本次用户输入 */}
              {userInput && (
                <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
                  <div className="flex items-center mb-2">
                    <UserOutlined className="text-blue-600 mr-2" />
                    <Text className="text-sm font-medium text-gray-700">
                      {hasPreviousAiOutput ? '本次输入' : '用户输入'}
                    </Text>
                  </div>
                  <div className="text-sm text-gray-800">
                    <MarkdownRenderer content={userInput} />
                  </div>
                </div>
              )}

              {/* 引用文档 */}
              {hasReferencedDocuments && (
                <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-400">
                  <div className="flex items-center mb-2">
                    <FileTextOutlined className="text-orange-600 mr-2" />
                    <Text className="text-sm font-medium text-gray-700">引用文档</Text>
                  </div>
                  <Space wrap>
                    {referencedDocuments.map((doc) => (
                      <Tag
                        key={doc.id}
                        className="bg-white border border-orange-300 text-orange-700"
                      >
                        <FileTextOutlined className="mr-1" />
                        {doc.name}
                      </Tag>
                    ))}
                  </Space>
                </div>
              )}

              {/* 选择的Agent */}
              {hasSelectedAgent && (
                <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-400">
                  <div className="flex items-center mb-2">
                    <ToolOutlined className="text-purple-600 mr-2" />
                    <Text className="text-sm font-medium text-gray-700">使用Agent</Text>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tag color="purple">
                      {selectedAgent.type === 'workflow' ? 'Workflow' : 'Tool'}
                    </Tag>
                    <Text className="text-sm font-medium text-gray-800">{selectedAgent.name}</Text>
                    {selectedAgent.description && (
                      <Text className="text-xs text-gray-600">• {selectedAgent.description}</Text>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI回复内容 */}
          {!isUserMessage && (
            <div>
              {isTyping ? (
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <Text className="text-sm">正在思考...</Text>
                </div>
              ) : (
                <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400">
                  <div className="flex items-center mb-2">
                    <RobotOutlined className="text-green-600 mr-2" />
                    <Text className="text-sm font-medium text-gray-700">
                      AI回复
                      {isStreaming && (
                        <span className="ml-2 text-xs text-green-500">正在生成...</span>
                      )}
                    </Text>
                  </div>
                  <div className="text-sm text-gray-800 relative">
                    <MarkdownRenderer content={displayContent} />
                    {/* 流式输入光标 */}
                    {isStreaming && (
                      <span 
                        className={`inline-block w-0.5 h-4 bg-green-500 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`}
                        style={{ animation: 'blink 1s infinite' }}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      
      {/* 时间戳 */}
      <div className="mt-2 text-center">
        <Text className="text-xs text-gray-500">
          {timestamp.toLocaleTimeString()}
        </Text>
      </div>

      {/* 添加光标闪烁动画的样式 */}
      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default StreamMessageCard; 