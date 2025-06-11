import React, { useState } from 'react';
import { Layout, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

import { Navigation } from '../../components/common';
import { SystemPromptPanel, AgentFormPanel, PreviewChatPanel } from './components';

const { Content } = Layout;

// Agent数据接口
export interface AgentFormData {
  name: string;
  description: string;
  type: string;
  icon: string;
  modelName: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  // 扩展字段
  tools: string[];
  workflows: string[];
}

const AgentCreate: React.FC = () => {
  const navigate = useNavigate();
  
  // 表单数据状态
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    description: '',
    type: 'assistant',
    icon: 'robot',
    modelName: 'gpt-3.5-turbo',
    systemPrompt: 'You are a helpful AI assistant. Please provide accurate and useful answers based on user questions.',
    temperature: 0.7,
    maxTokens: 2048,
    tools: [],
    workflows: []
  });

  // 处理表单数据更新
  const handleFormDataChange = (data: Partial<AgentFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  // 处理返回
  const handleGoBack = () => {
    navigate('/');
  };

  // 处理保存Agent
  const handleSaveAgent = async () => {
    try {
      // 验证必填字段
      if (!formData.name.trim()) {
        message.error('Please enter agent name');
        return;
      }
      if (!formData.description.trim()) {
        message.error('Please enter agent description');
        return;
      }
      if (!formData.systemPrompt.trim()) {
        message.error('Please enter system prompt');
        return;
      }

      // 构建请求数据
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        type: formData.type,
        icon: formData.icon,
        modelName: formData.modelName,
        systemPrompt: formData.systemPrompt.trim(),
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
        tools: formData.tools,
        workflows: formData.workflows
      };

      // 调用创建Agent API
      const response = await fetch('http://localhost:8080/api/chatbycard/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        message.success('Agent created successfully!');
        console.log('Created Agent:', result.data);
        
        // 保存成功后跳转回home页面
        navigate('/');
      } else {
        throw new Error(result.message || 'Create agent failed');
      }
      
    } catch (error) {
      console.error('Save agent error:', error);
      message.error('Save failed, please try again: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <Layout className="h-screen overflow-hidden bg-gray-50">
      {/* 导航栏 */}
      <Navigation />
      
      {/* 主要内容区域 */}
      <Content className="flex flex-col h-[calc(100vh-64px)]">
        {/* 头部操作栏 */}
        <div className="bg-white px-8 py-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-gray-900 mb-1">Agent Builder</h1>
            <p className="text-gray-600">Create and configure your intelligent assistant</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={handleGoBack}
              className="h-10 px-6 rounded-lg border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              type="primary" 
              onClick={handleSaveAgent}
              className="h-10 px-6 rounded-lg bg-black hover:bg-gray-800 border-black"
            >
              Create Agent
            </Button>
          </div>
        </div>

        {/* 三栏布局内容区域 */}
        <div className="flex-1 flex gap-6 p-4 overflow-hidden">
          {/* 左侧 - System Prompt */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200">
            <SystemPromptPanel 
              systemPrompt={formData.systemPrompt}
              onSystemPromptChange={(systemPrompt: string) => handleFormDataChange({ systemPrompt })}
            />
          </div>

          {/* 中间 - 表单 */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200">
            <AgentFormPanel 
              formData={formData}
              onFormDataChange={handleFormDataChange}
            />
          </div>

          {/* 右侧 - Preview */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200">
            <PreviewChatPanel 
              agentConfig={formData}
            />
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default AgentCreate; 