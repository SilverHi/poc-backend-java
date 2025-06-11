import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Typography, Avatar, Spin, message } from 'antd';
import { SendOutlined, PlayCircleOutlined, ClearOutlined, RobotOutlined } from '@ant-design/icons';
import type { AgentFormData } from '../index';

const { Text, Title } = Typography;
const { TextArea } = Input;

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PreviewChatPanelProps {
  agentConfig: AgentFormData;
}

const PreviewChatPanel: React.FC<PreviewChatPanelProps> = ({
  agentConfig
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 调用Agent测试API
  const callAgentTest = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch('http://localhost:8080/api/chatbycard/agent/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelName: agentConfig.modelName,
          systemPrompt: agentConfig.systemPrompt,
          temperature: agentConfig.temperature,
          maxTokens: agentConfig.maxTokens,
          userInput: userMessage
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data.content;
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (error) {
      console.error('Agent test API error:', error);
      throw error;
    }
  };

  // 发送消息
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const assistantResponse = await callAgentTest(inputMessage);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      message.error('Failed to send message, please check network connection and backend service');
      console.error('Send message error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 清空对话
  const handleClearChat = () => {
    setMessages([]);
  };

  // 开始测试（添加欢迎消息）
  const handleStartTest = () => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      type: 'assistant',
      content: `Hello! I am ${agentConfig.name || 'Unnamed Agent'}. ${agentConfig.description || 'I can help you answer questions.'}`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  // 格式化时间
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden">
      {/* 头部 */}
      <div className="p-8 pb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <PlayCircleOutlined className="text-green-600 text-sm" />
            </div>
            <Title level={4} className="m-0 text-gray-900 font-medium">
              Preview & Test
            </Title>
          </div>
          <Button 
            type="text" 
            size="small" 
            icon={<ClearOutlined />}
            onClick={handleClearChat}
            disabled={messages.length === 0}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            Clear
          </Button>
        </div>
        <Text className="text-gray-500 text-sm leading-relaxed">
          Test your agent's conversational abilities and response quality.
        </Text>
      </div>

      {/* Agent信息卡片 */}
      <div className="px-8 py-4 bg-gray-50 rounded-lg mx-8 mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <RobotOutlined className="text-white text-sm" />
          </div>
          <div className="flex-1">
            <Text className="font-medium text-gray-900 block">
              {agentConfig.name || 'Untitled Agent'}
            </Text>
            <Text className="text-xs text-gray-500">
              {agentConfig.modelName} • Temperature: {agentConfig.temperature}
            </Text>
          </div>
        </div>
      </div>

      {/* 对话区域 */}
      <div className="flex-1 overflow-auto px-8">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <PlayCircleOutlined className="text-2xl text-gray-400" />
            </div>
            <Text className="text-gray-500 mb-4">
              Click start test to experience agent conversation
            </Text>
            <Button 
              type="primary" 
              icon={<PlayCircleOutlined />}
              onClick={handleStartTest}
            >
              Start Test
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <Avatar 
                    size={32}
                    className={`${message.type === 'user' ? 'bg-blue-500 ml-2' : 'bg-purple-500 mr-2'}`}
                    icon={message.type === 'user' ? '👤' : <RobotOutlined />}
                  />
                  <div className={`rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <Text className={message.type === 'user' ? 'text-white' : 'text-gray-800'}>
                      {message.content}
                    </Text>
                    <div className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-400'
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex">
                  <Avatar 
                    size={32}
                    className="bg-purple-500 mr-2"
                    icon={<RobotOutlined />}
                  />
                  <div className="bg-gray-100 rounded-lg p-3">
                    <Spin size="small" />
                    <Text className="text-gray-600 ml-2">Thinking...</Text>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div className="p-8 pt-4">
        <div className="flex space-x-3">
          <TextArea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Message your agent..."
            autoSize={{ minRows: 1, maxRows: 3 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            className="border-gray-300 rounded-lg hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black transition-colors"
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="flex-shrink-0 h-auto bg-black hover:bg-gray-800 border-black rounded-lg px-4"
          >
            Send
          </Button>
        </div>
        <Text className="text-xs text-gray-400 mt-2">
          Press Enter to send, Shift + Enter for new line
        </Text>
      </div>
    </div>
  );
};

export default PreviewChatPanel; 