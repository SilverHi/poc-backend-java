import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Typography, Card, Tag, Space } from 'antd';
import { SendOutlined, PaperClipOutlined, AudioOutlined, CloseOutlined, FileTextOutlined, ToolOutlined } from '@ant-design/icons';
import MessageCard from './MessageCard';
import StepCard from './StepCard';

const { TextArea } = Input;
const { Text } = Typography;

interface ChatMessage {
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
  isTyping?: boolean;
}

interface ProcessStep {
  id: string;
  content: string;
  status: 'processing' | 'completed' | 'running';
  timestamp: Date;
}

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

interface ChatAreaProps {
  referencedDocuments?: ReferencedDocument[];
  selectedAgent?: SelectedAgent | null;
  onRemoveDocument?: (docId: string) => void;
  onClearAgent?: () => void;
}


const ChatArea: React.FC<ChatAreaProps> = ({
  referencedDocuments = [],
  selectedAgent = null,
  onRemoveDocument,
  onClearAgent
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAiResponse, setLastAiResponse] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // 创建用户消息
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      userInput: inputValue,
      previousAiOutput: lastAiResponse || undefined,
      referencedDocuments: referencedDocuments.length > 0 ? referencedDocuments : undefined,
      selectedAgent: selectedAgent || undefined,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setProcessSteps([]);

    // 模拟处理步骤
    setTimeout(() => {
      setProcessSteps([
        {
          id: 'step1',
          content: 'Agent开始处理...',
          status: 'processing',
          timestamp: new Date()
        }
      ]);
    }, 500);

    setTimeout(() => {
      setProcessSteps(prev => [
        ...prev,
        {
          id: 'step2',
          content: '正在解析文档内容...',
          status: 'processing',
          timestamp: new Date()
        }
      ]);
    }, 1000);

    setTimeout(() => {
      setProcessSteps(prev => [
        ...prev,
        {
          id: 'step3',
          content: '分析代码结构...',
          status: 'processing',
          timestamp: new Date()
        }
      ]);
    }, 1500);

    // 模拟AI回复
    setTimeout(() => {
      const aiResponse = `这是对"${userMessage.userInput}"的回复。在实际应用中，这里会连接到真正的AI API来生成智能回复。目前这只是一个演示界面，展示了OpenAI风格的对话体验。`;
      
      const assistantReply: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        aiResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantReply]);
      setLastAiResponse(aiResponse);
      setIsLoading(false);
      // 保留步骤显示，不清空
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const removeReferencedDocument = (docId: string) => {
    onRemoveDocument?.(docId);
  };

  const clearSelectedAgent = () => {
    onClearAgent?.();
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 聊天区域 */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* 空状态提示 */}
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-gray-400 text-lg font-medium">
                  开始你的AI对话
                </div>
                <div className="text-gray-300 text-sm space-y-1">
                  <p>选择文档资源和AI助手</p>
                  <p>输入你的问题开始对话</p>
                  <p>体验智能工作流程</p>
                </div>
              </div>
            </div>
          )}
          
          {/* 工作流链式显示 */}
          {messages.length > 0 && (
            <div className="space-y-8">
              {messages.map((message, index) => (
              <div key={message.id} className="relative">
                {/* 消息卡片 */}
                <div className="relative">
                  <MessageCard
                    id={message.id}
                    type={message.type}
                    timestamp={message.timestamp}
                    userInput={message.userInput}
                    previousAiOutput={message.previousAiOutput}
                    referencedDocuments={message.referencedDocuments}
                    selectedAgent={message.selectedAgent}
                    aiResponse={message.aiResponse}
                    isTyping={message.isTyping}
                  />
                  
                  {/* 连接线 */}
                  {(index < messages.length - 1 || (message.type === 'user' && processSteps.length > 0)) && (
                    <div className="absolute left-1/2 -bottom-4 transform -translate-x-1/2">
                      <div className="w-0.5 h-8 bg-gray-300"></div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 如果是用户消息，显示对应的处理步骤 */}
                {message.type === 'user' && processSteps.length > 0 && (
                  <div className="mt-8 space-y-4">
                    {processSteps.map((step, stepIndex) => (
                      <div key={step.id} className="relative">
                        <StepCard
                          id={step.id}
                          content={step.content}
                          status={step.status}
                          timestamp={step.timestamp}
                        />
                        
                        {/* Step之间的连接线 */}
                        {stepIndex < processSteps.length - 1 && (
                          <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2">
                            <div className="w-0.5 h-4 bg-blue-300"></div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1">
                              <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                            </div>
                          </div>
                        )}
                        
                        {/* 最后一个step到下一个消息的连接线 */}
                        {stepIndex === processSteps.length - 1 && 
                         index < messages.length - 1 && (
                          <div className="absolute left-1/2 -bottom-4 transform -translate-x-1/2">
                            <div className="w-0.5 h-8 bg-gray-300"></div>
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -translate-y-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto p-4">
          {/* Agent选择卡片头部 */}
          {selectedAgent && (
            <Card 
              className="mb-3 border border-blue-200 bg-blue-50"
              bodyStyle={{ padding: '8px 12px' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ToolOutlined className="text-blue-600" />
                  <div>
                    <Text className="font-medium text-blue-800">{selectedAgent.name}</Text>
                    {selectedAgent.description && (
                      <Text className="text-xs text-blue-600 ml-2">{selectedAgent.description}</Text>
                    )}
                  </div>
                  <Tag color="blue" className="ml-2">
                    {selectedAgent.type === 'workflow' ? 'Workflow' : 'Tool'}
                  </Tag>
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={clearSelectedAgent}
                  className="text-blue-600 hover:text-blue-800"
                />
              </div>
            </Card>
          )}

          {/* 主输入卡片 */}
          <Card className="shadow-lg border-0" bodyStyle={{ padding: '12px' }}>
            {/* 引用文档区域 */}
            {referencedDocuments.length > 0 && (
              <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                  <FileTextOutlined className="text-gray-600 mr-2" />
                  <Text className="text-sm text-gray-600 font-medium">引用文档</Text>
                </div>
                <Space wrap>
                  {referencedDocuments.map((doc) => (
                    <Tag
                      key={doc.id}
                      closable
                      onClose={() => removeReferencedDocument(doc.id)}
                      className="flex items-center space-x-1 px-2 py-1 bg-white border border-gray-300"
                    >
                      <FileTextOutlined className="text-gray-500" />
                      <span className="text-sm">{doc.name}</span>
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {/* 输入框区域 */}
            <div className="flex items-end space-x-3">
              <div className="flex space-x-2">
                <Button 
                  type="text" 
                  icon={<PaperClipOutlined />}
                  className="text-gray-400 hover:text-gray-600"
                  size="small"
                  title="添加文档引用"
                />
                <Button 
                  type="text" 
                  icon={<AudioOutlined />}
                  className="text-gray-400 hover:text-gray-600"
                  size="small"
                  title="语音输入"
                />
              </div>
              
              <div className="flex-1">
                <TextArea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    selectedAgent 
                      ? `使用 ${selectedAgent.name} 发送消息...`
                      : referencedDocuments.length > 0
                        ? "基于选择的文档提问..."
                        : "发送消息给ChatGPT..."
                  }
                  autoSize={{ minRows: 1, maxRows: 6 }}
                  className="border-0 resize-none focus:shadow-none"
                  style={{ 
                    boxShadow: 'none',
                    padding: '8px 0'
                  }}
                  disabled={isLoading}
                />
              </div>
              
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600 rounded-lg"
                size="large"
              />
            </div>
          </Card>
          
          <div className="mt-2 text-center">
            <Text className="text-xs text-gray-500">
              ChatGPT可能会犯错。请核实重要信息。
            </Text>
          </div>


        </div>
      </div>
    </div>
  );
};

export default ChatArea; 