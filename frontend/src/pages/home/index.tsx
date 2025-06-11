import React, { useState } from 'react';
import { Layout } from 'antd';
import { Navigation } from '../../components/common';
import { ResourcePanel } from './components/resource';
import { ChatArea } from './components/chat';
import { AgentsPanel } from './components/agents';

const { Content } = Layout;

// 定义接口
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

const Home: React.FC = () => {
  // 全局状态管理
  const [referencedDocuments, setReferencedDocuments] = useState<ReferencedDocument[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<SelectedAgent | null>(null);

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

  // 处理移除文档引用
  const handleRemoveDocument = (docId: string) => {
    setReferencedDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  // 处理选择Agent
  const handleSelectAgent = (agent: any) => {
    const newAgent: SelectedAgent = {
      id: agent.id,
      name: agent.name,
      type: agent.type || 'tool',
      description: agent.description
    };
    setSelectedAgent(newAgent);
  };

  // 处理清除Agent选择
  const handleClearAgent = () => {
    setSelectedAgent(null);
  };

  return (
    <Layout className="h-screen overflow-hidden bg-gray-50">
      {/* 导航栏 */}
      <Navigation />
      
      {/* 主要内容区域 */}
      <Content className="flex h-[calc(100vh-64px)] overflow-hidden gap-6 p-6">
        {/* 左侧资源选择区 */}
        <div className="w-80 flex-shrink-0 h-full bg-white rounded-xl shadow-sm border border-gray-200">
          <ResourcePanel onDocumentSelect={handleAddDocument} />
        </div>
        
        {/* 中间对话区 */}
        <div className="flex-1 h-full min-w-0 bg-white rounded-xl shadow-sm border border-gray-200">
          <ChatArea 
            referencedDocuments={referencedDocuments}
            selectedAgent={selectedAgent}
            onRemoveDocument={handleRemoveDocument}
            onClearAgent={handleClearAgent}
          />
        </div>
        
        {/* 右侧Agents选择区 */}
        <div className="w-80 flex-shrink-0 h-full bg-white rounded-xl shadow-sm border border-gray-200">
          <AgentsPanel onAgentSelect={handleSelectAgent} />
        </div>
      </Content>
    </Layout>
  );
};

export default Home; 