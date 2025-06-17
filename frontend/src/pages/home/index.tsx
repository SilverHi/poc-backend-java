import React, { useState } from 'react';
import { Layout, Button } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Navigation } from '../../components/common';
import { ResourcePanel } from './components/resource';
import { ChatArea } from './components/chat';
import { AgentsPanel } from './components/agents';
import { ReferencedDocument, SelectedAgent, Workflow } from './components/chat/types';

const { Content } = Layout;

interface ExternalSystem {
  id: string;
  name: string;
  type: 'confluence' | 'jira';
  description: string;
  url?: string;
}

const Home: React.FC = () => {
  // 全局状态管理
  const [referencedDocuments, setReferencedDocuments] = useState<ReferencedDocument[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<SelectedAgent | null>(null);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  // 抽屉状态管理
  const [leftPanelVisible, setLeftPanelVisible] = useState(true);
  const [rightPanelVisible, setRightPanelVisible] = useState(true);

  // 清空对话
  const handleClearConversation = () => {
    setReferencedDocuments([]);
    setSelectedAgent(null);
    setSelectedWorkflow(null);
    // 调用ChatArea内部的清空逻辑
    if ((window as any).clearChatAreaConversation) {
      (window as any).clearChatAreaConversation();
    }
  };

  // 处理添加文档引用
  const handleAddDocument = (document: any) => {
    const newDoc: ReferencedDocument = {
      id: document.id,
      name: document.name || document.title,
      type: document.type || 'txt'
    };
    
    // 检查是否已经添加过
    if (!referencedDocuments.find(doc => doc.id === newDoc.id)) {
      setReferencedDocuments(prev => [...prev, newDoc]);
    }
  };

  // 处理添加外部系统引用
  const handleAddExternalSystem = (system: ExternalSystem) => {
    const newDoc: ReferencedDocument = {
      id: system.id,
      name: system.name,
      type: 'external',
      externalType: system.type
    };
    
    // 检查是否已经添加过
    if (!referencedDocuments.find(doc => doc.id === newDoc.id)) {
      setReferencedDocuments(prev => [...prev, newDoc]);
    }
  };

  // 处理移除文档引用
  const handleRemoveDocument = (docId: string) => {
    setReferencedDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  // 处理选择Agent
  const handleSelectAgent = (agent: any) => {
    const newAgent: SelectedAgent = {
      id: agent.id,
      name: agent.name,
      type: agent.category === 'agent' ? 'agent' : agent.type || 'tool',
      description: agent.description
    };
    setSelectedAgent(newAgent);
    // 清除工作流选择
    setSelectedWorkflow(null);
  };

  // 处理选择Workflow
  const handleSelectWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    // 清除Agent选择
    setSelectedAgent(null);
  };

  // 处理清除Agent选择
  const handleClearAgent = () => {
    setSelectedAgent(null);
  };

  // 处理清除Workflow选择
  const handleClearWorkflow = () => {
    setSelectedWorkflow(null);
  };

  // 处理工作流完成
  const handleWorkflowComplete = () => {
    // 工作流完成后可以选择保持工作流选择或清除
    // 这里我们保持选择，让用户可以再次执行
  };

  return (
    <Layout className="h-screen overflow-hidden bg-gray-50">
      {/* 导航栏 */}
      <Navigation onClearConversation={handleClearConversation} />
      
      {/* 主要内容区域 */}
      <Content className="flex h-[calc(100vh-64px)] overflow-hidden gap-6 p-6 relative">
        {/* 左侧区域包装器 */}
        <div className="relative flex">
          {/* 左侧资源选择区 */}
          <div 
            className={`transition-all duration-300 ease-in-out h-full bg-white rounded-xl shadow-sm border border-gray-200 ${
              leftPanelVisible ? 'w-80 flex-shrink-0' : 'w-0 overflow-hidden'
            }`}
          >
            {leftPanelVisible && (
              <ResourcePanel 
                onDocumentSelect={handleAddDocument}
                onExternalSystemSelect={handleAddExternalSystem}
              />
            )}
          </div>
          {/* 左侧抽屉按钮 - 跟随左面板 */}
          <Button
            type="text"
            icon={leftPanelVisible ? <LeftOutlined /> : <RightOutlined />}
            onClick={() => setLeftPanelVisible(!leftPanelVisible)}
            className={`absolute top-1/2 transform -translate-y-1/2 z-20 bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-300 ${
              leftPanelVisible ? '-right-4' : 'left-2'
            }`}
            style={{ width: '32px', height: '32px' }}
            title={leftPanelVisible ? "隐藏资源面板" : "显示资源面板"}
          />
        </div>
        
        {/* 中间对话区 */}
        <div 
          className={`transition-all duration-300 ease-in-out h-full min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 ${
            leftPanelVisible && rightPanelVisible ? 'flex-1' : 
            leftPanelVisible || rightPanelVisible ? 'flex-1' : 'flex-1'
          }`}
          style={{
            marginLeft: leftPanelVisible ? '0' : '-24px',
            marginRight: rightPanelVisible ? '0' : '-24px'
          }}
        >
          <ChatArea 
            referencedDocuments={referencedDocuments}
            selectedAgent={selectedAgent}
            selectedWorkflow={selectedWorkflow}
            onRemoveDocument={handleRemoveDocument}
            onClearAgent={handleClearAgent}
            onClearWorkflow={handleClearWorkflow}
            onWorkflowComplete={handleWorkflowComplete}
            onClearConversation={handleClearConversation}
          />
        </div>
        
        {/* 右侧区域包装器 */}
        <div className="relative flex">
          {/* 右侧抽屉按钮 - 跟随右面板 */}
          <Button
            type="text"
            icon={rightPanelVisible ? <RightOutlined /> : <LeftOutlined />}
            onClick={() => setRightPanelVisible(!rightPanelVisible)}
            className={`absolute top-1/2 transform -translate-y-1/2 z-20 bg-white shadow-md border border-gray-200 hover:bg-gray-50 transition-all duration-300 ${
              rightPanelVisible ? '-left-4' : '-right-2'
            }`}
            style={{ width: '32px', height: '32px' }}
            title={rightPanelVisible ? "隐藏智能体面板" : "显示智能体面板"}
          />
          {/* 右侧Agents选择区 */}
          <div 
            className={`transition-all duration-300 ease-in-out h-full bg-white rounded-xl shadow-sm border border-gray-200 ${
              rightPanelVisible ? 'w-80 flex-shrink-0' : 'w-0 overflow-hidden'
            }`}
          >
            {rightPanelVisible && (
              <AgentsPanel 
                onAgentSelect={handleSelectAgent}
                onWorkflowSelect={handleSelectWorkflow}
              />
            )}
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default Home; 