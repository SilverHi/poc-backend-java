import React, { useState, useEffect } from 'react';
import { Typography, Tabs, message, Spin } from 'antd';
import { 
  RobotOutlined, 
  ApartmentOutlined,
  ToolOutlined,
  CodeOutlined, 
  BulbOutlined, 
  BarChartOutlined, 
  UserOutlined, 
  FileOutlined, 
  TranslationOutlined, 
  ApiOutlined, 
  PictureOutlined
} from '@ant-design/icons';
import { getAgents, getWorkflows, getTools, executeWorkflow, executeTool, type Agent, type Workflow, type Tool } from '../../../../api';
import { AgentCard, WorkflowCard, ToolCard } from './cards';

// 自定义滚动条样式
const scrollbarStyles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #d1d5db #f3f4f6;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f9fafb;
    border-radius: 4px;
    margin: 2px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
    transition: background 0.3s ease;
    min-height: 20px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  
  .custom-scrollbar-blue::-webkit-scrollbar-thumb {
    background: #3b82f6;
    opacity: 0.7;
  }
  
  .custom-scrollbar-blue::-webkit-scrollbar-thumb:hover {
    background: #2563eb;
    opacity: 0.9;
  }
  
  .custom-scrollbar-green::-webkit-scrollbar-thumb {
    background: #10b981;
    opacity: 0.7;
  }
  
  .custom-scrollbar-green::-webkit-scrollbar-thumb:hover {
    background: #059669;
    opacity: 0.9;
  }
  
  .custom-scrollbar-purple::-webkit-scrollbar-thumb {
    background: #8b5cf6;
    opacity: 0.7;
  }
  
  .custom-scrollbar-purple::-webkit-scrollbar-thumb:hover {
    background: #7c3aed;
    opacity: 0.9;
  }
  
  .custom-scrollbar::-webkit-scrollbar-corner {
    background: transparent;
  }
`;

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface AgentsPanelProps {
  onAgentSelect?: (agent: Agent | Workflow | Tool) => void;
}

const AgentsPanel: React.FC<AgentsPanelProps> = ({ onAgentSelect }) => {
  const [activeTab, setActiveTab] = useState<string>('agents');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>('');
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);

  // 加载数据
  const loadData = async () => {
    setLoading(true);
    try {
      const [agentsResult, workflowsResult, toolsResult] = await Promise.all([
        getAgents(),
        getWorkflows(),
        getTools()
      ]);

      if (agentsResult.success && agentsResult.data) {
        setAgents(agentsResult.data);
        if (agentsResult.data.length > 0) {
          setSelectedAgent(agentsResult.data[0].id);
        }
      }

      if (workflowsResult.success && workflowsResult.data) {
        setWorkflows(workflowsResult.data);
        if (workflowsResult.data.length > 0) {
          setSelectedWorkflow(workflowsResult.data[0].id);
        }
      }

      if (toolsResult.success && toolsResult.data) {
        setTools(toolsResult.data);
        if (toolsResult.data.length > 0) {
          setSelectedTool(toolsResult.data[0].id);
        }
      }
    } catch (error) {
      message.error('加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // 注入自定义滚动条样式
    const styleElement = document.createElement('style');
    styleElement.textContent = scrollbarStyles;
    styleElement.setAttribute('data-scrollbar', 'agents-panel');
    document.head.appendChild(styleElement);
    
    return () => {
      // 清理样式
      const existingStyle = document.head.querySelector('style[data-scrollbar="agents-panel"]');
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []);

  // 图标映射
  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      robot: <RobotOutlined />,
      code: <CodeOutlined />,
      bulb: <BulbOutlined />,
      chart: <BarChartOutlined />,
      user: <UserOutlined />,
      workflow: <ApartmentOutlined />,
      'code-review': <CodeOutlined />,
      creative: <BulbOutlined />,
      service: <UserOutlined />,
      'file-pdf': <FileOutlined />,
      'code-format': <CodeOutlined />,
      'chart-bar': <BarChartOutlined />,
      translate: <TranslationOutlined />,
      api: <ApiOutlined />,
      image: <PictureOutlined />,
    };
    return iconMap[iconName] || <ToolOutlined />;
  };

  // 格式化调用次数
  const formatCallCount = (count: number): string => {
    if (count >= 10000) {
      return `${(count / 1000).toFixed(1)}k`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  // 处理Agent选择
  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
    const agent = agents.find(a => a.id === agentId);
    if (agent && onAgentSelect) {
      onAgentSelect({ ...agent, type: 'agent' as any });
    }
  };

  // 处理Workflow选择
  const handleWorkflowSelect = (workflowId: string) => {
    setSelectedWorkflow(workflowId);
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow && onAgentSelect) {
      onAgentSelect({ ...workflow, type: 'workflow' as any });
    }
  };

  // 处理Tool选择
  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    const tool = tools.find(t => t.id === toolId);
    if (tool && onAgentSelect) {
      onAgentSelect({ ...tool, type: 'tool' as any });
    }
  };

  // 执行工作流
  const handleExecuteWorkflow = async (workflowId: string) => {
    setExecuting(true);
    try {
      const result = await executeWorkflow(workflowId);
      if (result.success) {
        message.success(`工作流启动成功，任务ID: ${result.data?.jobId}`);
      } else {
        message.error(result.error || '执行失败');
      }
    } catch (error) {
      message.error('执行过程中发生错误');
    } finally {
      setExecuting(false);
    }
  };

  // 使用工具
  const handleUseTool = async (toolId: string) => {
    setExecuting(true);
    try {
      const result = await executeTool(toolId);
      if (result.success) {
        message.success(result.data?.result || '工具使用成功');
      } else {
        message.error(result.error || '使用失败');
      }
    } catch (error) {
      message.error('使用过程中发生错误');
    } finally {
      setExecuting(false);
    }
  };

  // Agents标签页内容
  const renderAgents = () => (
    <div className="space-y-3">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          isSelected={selectedAgent === agent.id}
          onSelect={handleAgentSelect}
          formatCallCount={formatCallCount}
          getIcon={getIcon}
        />
      ))}
    </div>
  );

  // Workflows标签页内容
  const renderWorkflows = () => (
    <div className="space-y-3">
      {workflows.map((workflow) => (
        <WorkflowCard
          key={workflow.id}
          workflow={workflow}
          isSelected={selectedWorkflow === workflow.id}
          executing={executing}
          onSelect={handleWorkflowSelect}
          onExecute={handleExecuteWorkflow}
          formatCallCount={formatCallCount}
          getIcon={getIcon}
        />
      ))}
    </div>
  );

  // Tools标签页内容
  const renderTools = () => (
    <div className="space-y-3">
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          tool={tool}
          isSelected={selectedTool === tool.id}
          executing={executing}
          onSelect={handleToolSelect}
          onUse={handleUseTool}
          formatCallCount={formatCallCount}
          getIcon={getIcon}
        />
      ))}
    </div>
  );

  return (
    <div className="h-full bg-white border border-gray-200 rounded-lg flex flex-col">
      {/* 头部区域 */}
      <div className="p-6 border-b border-gray-200">
        <Title level={4} className="text-gray-900 mb-2 font-semibold">
          智能助手中心
        </Title>
        <Text className="text-gray-600 text-sm">
          选择AI助手、工作流或工具来完成您的任务
        </Text>
      </div>

      {/* 标签页内容 */}
      <div className="flex-1 overflow-hidden">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="h-full flex flex-col"
          size="small"
          centered
          tabBarStyle={{ 
            paddingLeft: '16px', 
            paddingRight: '16px', 
            marginBottom: 0,
            minHeight: '40px',
            fontSize: '14px',
            flexShrink: 0
          }}
          tabBarGutter={24}
        >
          <TabPane 
            tab={
              <span className="flex items-center gap-1">
                <RobotOutlined className="text-xs" />
                <span className="text-xs">Agents</span>
              </span>
            }
            key="agents"
            className="h-full flex flex-col"
          >
            <div className="flex-1 p-4 overflow-auto">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Spin size="large" />
                </div>
              ) : (
                renderAgents()
              )}
            </div>
          </TabPane>
          
          <TabPane 
            tab={
              <span className="flex items-center gap-1">
                <ApartmentOutlined className="text-xs" />
                <span className="text-xs">Workflows</span>
              </span>
            }
            key="workflows"
            className="h-full flex flex-col"
          >
            <div className="flex-1 p-4 overflow-auto">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Spin size="large" />
                </div>
              ) : (
                renderWorkflows()
              )}
            </div>
          </TabPane>
          
          <TabPane 
            tab={
              <span className="flex items-center gap-1">
                <ToolOutlined className="text-xs" />
                <span className="text-xs">Tools</span>
              </span>
            }
            key="tools"
            className="h-full flex flex-col"
          >
            <div className="flex-1 p-4 overflow-auto">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Spin size="large" />
                </div>
              ) : (
                renderTools()
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default AgentsPanel; 