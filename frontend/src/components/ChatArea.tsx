import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Typography, Avatar, Card } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined, PaperClipOutlined, AudioOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const ChatArea: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: '你好！我是AI助手，我可以帮助你回答问题、编写代码、创作内容等。有什么我可以帮助你的吗？',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsLoading(true);

    // 模拟AI思考过程
    const typingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, typingMessage]);

    // 模拟AI回复
    setTimeout(() => {
      const assistantReply: Message = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        content: `这是对"${newMessage.content}"的回复。在实际应用中，这里会连接到后端Java服务来生成智能回复。目前这只是一个演示界面，展示了AI助手的对话体验。`,
        timestamp: new Date()
      };
      
      setMessages(prev => prev.filter(msg => !msg.isTyping).concat(assistantReply));
      setIsLoading(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 聊天区域 */}
      <div className="flex-1 overflow-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-4">
              <div className="flex-shrink-0">
                <Avatar 
                  size={32}
                  icon={message.type === 'user' ? <UserOutlined /> : <RobotOutlined />}
                  className={message.type === 'user' ? 'bg-blue-500' : 'bg-green-500'}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <Text className="font-medium text-gray-900">
                    {message.type === 'user' ? '你' : 'AI助手'}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </Text>
                </div>
                
                {message.isTyping ? (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <Text className="text-sm">正在思考...</Text>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <Text className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-lg border-0" bodyStyle={{ padding: '12px' }}>
            <div className="flex items-end space-x-3">
              <div className="flex space-x-2">
                <Button 
                  type="text" 
                  icon={<PaperClipOutlined />}
                  className="text-gray-400 hover:text-gray-600"
                  size="small"
                />
                <Button 
                  type="text" 
                  icon={<AudioOutlined />}
                  className="text-gray-400 hover:text-gray-600"
                  size="small"
                />
              </div>
              
              <div className="flex-1">
                <TextArea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="发送消息给AI助手..."
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
          
          
        </div>
      </div>
    </div>
  );
};

export default ChatArea; 