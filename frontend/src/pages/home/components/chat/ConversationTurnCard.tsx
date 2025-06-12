import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Button, Input } from 'antd';
import { 
  UserOutlined, 
  RobotOutlined, 
  FileTextOutlined, 
  ToolOutlined, 
  LinkOutlined, 
  BugOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import MarkdownRenderer from '../../../../components/MarkdownRenderer';
import CopyButton from '../../../../components/CopyButton';
import { ConversationTurn, ReferencedDocument, SelectedAgent } from './types';

const { Text } = Typography;
const { TextArea } = Input;

interface ConversationTurnCardProps {
  turn: ConversationTurn;
  onEditAiResponse?: (turnId: string, newContent: string) => void;
}

const ConversationTurnCard: React.FC<ConversationTurnCardProps> = ({
  turn,
  onEditAiResponse
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(turn.aiResponse.content);
  
  const { userInput, aiResponse } = turn;
  
  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(aiResponse.content);
  };
  
  const handleSaveEdit = () => {
    onEditAiResponse?.(turn.id, editContent);
    setIsEditing(false);
  };
  
  const handleCancelEdit = () => {
    setEditContent(aiResponse.content);
    setIsEditing(false);
  };

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
    <div className="w-full">
      <Card 
        className="border border-gray-200 shadow-md"
        bodyStyle={{ padding: '20px' }}
      >
        {/* 对话回合标识 */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <Text className="text-sm text-gray-500">对话回合 #{turn.turnIndex + 1}</Text>
            <Text className="text-xs text-gray-400">
              {turn.timestamp.toLocaleString()}
            </Text>
          </div>
          <Text className="text-xs text-gray-400">ID: {turn.id}</Text>
        </div>

        {/* 用户输入部分 */}
        <div className="space-y-4 mb-6">
          {/* 上次AI输出（对话延续时） */}
          {userInput.previousAiOutput && (
            <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-green-400">
              <div className="flex items-center mb-2">
                <RobotOutlined className="text-green-600 mr-2" />
                <Text className="text-sm font-medium text-gray-700">延续上次回复</Text>
              </div>
              <div className="text-sm text-gray-600">
                <MarkdownRenderer content={userInput.previousAiOutput} />
              </div>
            </div>
          )}

          {/* 本次用户输入 */}
          {userInput.content && (
            <div className="bg-blue-50 rounded-lg p-3 border-l-4 border-blue-400">
              <div className="flex items-center mb-2">
                <UserOutlined className="text-blue-600 mr-2" />
                <Text className="text-sm font-medium text-gray-700">用户输入</Text>
              </div>
              <div className="text-sm text-gray-800">
                <MarkdownRenderer content={userInput.content} />
              </div>
            </div>
          )}

          {/* 引用文档 */}
          {userInput.referencedDocuments && userInput.referencedDocuments.length > 0 && (
            <div className="bg-orange-50 rounded-lg p-3 border-l-4 border-orange-400">
              <div className="flex items-center mb-2">
                <FileTextOutlined className="text-orange-600 mr-2" />
                <Text className="text-sm font-medium text-gray-700">引用文档</Text>
              </div>
              <Space wrap>
                {userInput.referencedDocuments.map((doc) => (
                  <Tag key={doc.id} className={getTagColor(doc)}>
                    {getDocIcon(doc)}
                    {doc.name}
                    {doc.type === 'external' && (
                      <span className="ml-1 text-xs opacity-75">
                        ({doc.externalType?.toUpperCase()})
                      </span>
                    )}
                  </Tag>
                ))}
              </Space>
            </div>
          )}

          {/* 选择的Agent */}
          {userInput.selectedAgent && (
            <div className="bg-purple-50 rounded-lg p-3 border-l-4 border-purple-400">
              <div className="flex items-center mb-2">
                <ToolOutlined className="text-purple-600 mr-2" />
                <Text className="text-sm font-medium text-gray-700">使用的Agent</Text>
              </div>
              <div className="flex items-center space-x-2">
                <Tag color="purple">
                  {userInput.selectedAgent.type === 'workflow' ? 'Workflow' : 'Tool'}
                </Tag>
                <Text className="text-sm font-medium text-gray-800">{userInput.selectedAgent.name}</Text>
                {userInput.selectedAgent.description && (
                  <Text className="text-xs text-gray-600">• {userInput.selectedAgent.description}</Text>
                )}
              </div>
            </div>
          )}
        </div>

        {/* AI回复部分 */}
        <div>
          {aiResponse.status === 'pending' || aiResponse.status === 'streaming' ? (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <Text className="text-sm">AI正在思考...</Text>
            </div>
          ) : (
            <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-400 relative group">
              <div className="flex items-center mb-2 justify-between">
                <div className="flex items-center">
                  <RobotOutlined className="text-green-600 mr-2" />
                  <Text className="text-sm font-medium text-gray-700">AI回复</Text>
                  {aiResponse.timestamp && (
                    <Text className="text-xs text-gray-400 ml-2">
                      {aiResponse.timestamp.toLocaleTimeString()}
                    </Text>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {/* 编辑按钮 - 只在可编辑时显示 */}
                  {aiResponse.isEditable && !isEditing && (
                    <Button
                      type="text"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={handleStartEdit}
                      className="text-gray-600 hover:text-blue-600"
                      title="编辑AI回复"
                    />
                  )}
                  
                  {/* 编辑模式下的操作按钮 */}
                  {isEditing && (
                    <div className="flex space-x-1">
                      <Button
                        type="text"
                        size="small"
                        icon={<SaveOutlined />}
                        onClick={handleSaveEdit}
                        className="text-green-600 hover:text-green-700"
                        title="保存编辑"
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<CloseOutlined />}
                        onClick={handleCancelEdit}
                        className="text-gray-600 hover:text-red-600"
                        title="取消编辑"
                      />
                    </div>
                  )}
                  
                  {/* 复制按钮 */}
                  {!isEditing && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <CopyButton 
                        text={aiResponse.content || ''}
                        tooltip="复制AI回复"
                        className="bg-white hover:bg-gray-50 border border-gray-300 shadow-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* AI回复内容 */}
              <div className="text-sm text-gray-800">
                {isEditing ? (
                  <TextArea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    autoSize={{ minRows: 3, maxRows: 10 }}
                    className="border-gray-300 focus:border-blue-500"
                  />
                ) : (
                  <MarkdownRenderer content={aiResponse.content || ''} />
                )}
              </div>
              
              {/* 状态指示 */}
              {aiResponse.status === 'error' && (
                <div className="mt-2 text-red-600 text-xs">
                  回复生成失败
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ConversationTurnCard; 