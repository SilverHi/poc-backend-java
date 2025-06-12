import React from 'react';
import { Card, Typography, Tag, Space } from 'antd';
import { UserOutlined, RobotOutlined, FileTextOutlined, ToolOutlined, LinkOutlined, BugOutlined } from '@ant-design/icons';
import MarkdownRenderer from '../../../../components/MarkdownRenderer';
import CopyButton from '../../../../components/CopyButton';

const { Text } = Typography;

interface ReferencedDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'txt' | 'md' | 'external';
  externalType?: 'confluence' | 'jira'; // 外部系统类型
}

interface SelectedAgent {
  id: string;
  name: string;
  type: 'workflow' | 'tool';
  description?: string;
}

interface MessageCardProps {
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
  
  // 状态
  isTyping?: boolean;
}

const MessageCard: React.FC<MessageCardProps> = ({
  id,
  type,
  timestamp,
  userInput,
  previousAiOutput,
  referencedDocuments = [],
  selectedAgent,
  aiResponse,
  isTyping = false
}) => {
  const isUserMessage = type === 'user';
  const hasReferencedDocuments = referencedDocuments.length > 0;
  const hasSelectedAgent = !!selectedAgent;
  const hasPreviousAiOutput = !!previousAiOutput;

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
                    <Text className="text-sm font-medium text-gray-700">Previous Reply</Text>
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
                      {hasPreviousAiOutput ? 'Current Input' : 'User Input'}
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
                    <Text className="text-sm font-medium text-gray-700">Referenced Documents</Text>
                  </div>
                  <Space wrap>
                    {referencedDocuments.map((doc) => {
                      const getDocIcon = (doc: ReferencedDocument) => {
                        if (doc.type === 'external') {
                          switch (doc.externalType) {
                            case 'confluence':
                              return <FileTextOutlined className="mr-1" />;
                            case 'jira':
                              return <BugOutlined className="mr-1" />;
                            default:
                              return <LinkOutlined className="mr-1" />;
                          }
                        }
                        return <FileTextOutlined className="mr-1" />;
                      };

                      const getTagColor = (doc: ReferencedDocument) => {
                        if (doc.type === 'external') {
                          return "bg-white border border-blue-300 text-blue-700";
                        }
                        return "bg-white border border-orange-300 text-orange-700";
                      };

                      return (
                        <Tag
                          key={doc.id}
                          className={getTagColor(doc)}
                        >
                          {getDocIcon(doc)}
                          {doc.name}
                          {doc.type === 'external' && (
                            <span className="ml-1 text-xs opacity-75">
                              ({doc.externalType?.toUpperCase()})
                            </span>
                          )}
                        </Tag>
                      );
                    })}
                  </Space>
                </div>
              )}

              {/* 选择的Agent */}
              {hasSelectedAgent && (
                <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-400">
                  <div className="flex items-center mb-2">
                    <ToolOutlined className="text-purple-600 mr-2" />
                    <Text className="text-sm font-medium text-gray-700">Using Agent</Text>
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
                  <Text className="text-sm">Thinking...</Text>
                </div>
              ) : (
                <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400 relative group">
                  <div className="flex items-center mb-2 justify-between">
                    <div className="flex items-center">
                      <RobotOutlined className="text-green-600 mr-2" />
                      <Text className="text-sm font-medium text-gray-700">AI回复</Text>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <CopyButton 
                        text={aiResponse || ''}
                        tooltip="复制AI回复"
                        className="bg-white hover:bg-gray-50 border border-gray-300 shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="text-sm text-gray-800">
                    <MarkdownRenderer content={aiResponse || ''} />
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
    </div>
  );
};

export default MessageCard; 