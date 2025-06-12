import React, { useState, useEffect } from 'react';
import { Typography, Tabs, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
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
  PictureOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { getAgents, getWorkflows, getTools, executeTool, getWorkflowFrontendUrl, type Agent, type Workflow, type Tool } from '../../../../api';
import { AgentCard, WorkflowCard, ToolCard } from './cards';

// 自定义滚动条样式
const scrollbarStyles = `
  .agents-panel-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #d1d5db #f3f4f6;
  }
  
  .agents-panel-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  .agents-panel-scrollbar::-webkit-scrollbar-track {
    background: #f9fafb;
    border-radius: 3px;
  }
  
  .agents-panel-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;
    transition: background 0.3s ease;
  }
  
  .agents-panel-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  
  .agents-panel-scrollbar-blue::-webkit-scrollbar-thumb {
    background: #3b82f6;
  }
  
  .agents-panel-scrollbar-blue::-webkit-scrollbar-thumb:hover {
    background: #2563eb;
  }
  
  .agents-panel-scrollbar-green::-webkit-scrollbar-thumb {
    background: #10b981;
  }
  
  .agents-panel-scrollbar-green::-webkit-scrollbar-thumb:hover {
    background: #059669;
  }
  
  .agents-panel-scrollbar-purple::-webkit-scrollbar-thumb {
    background: #8b5cf6;
  }
  
  .agents-panel-scrollbar-purple::-webkit-scrollbar-thumb:hover {
    background: #7c3aed;
  }
  
  .agents-panel-scrollbar::-webkit-scrollbar-corner {
    background: transparent;
  }
  
  /* 确保Ant Design Tabs的样式不会覆盖滚动条 */
  .agents-panel-tabs {
    display: flex !important;
    flex-direction: column !important;
    height: 100% !important;
  }
  
  .agents-panel-tabs .ant-tabs-content-holder {
    flex: 1 !important;
    overflow: hidden !important;
  }
  
  .agents-panel-tabs .ant-tabs-content {
    height: 100% !important;
  }
  
  .agents-panel-tabs .ant-tabs-tabpane-active {
    height: 100% !important;
    display: flex !important;
    flex-direction: column !important;
  }
`;

const { Text, Title } = Typography;
const { TabPane } = Tabs;

interface AgentsPanelProps {
  onAgentSelect?: (agent: Agent | Tool) => void;
  onWorkflowSelect?: (workflow: Workflow) => void;
}

const AgentsPanel: React.FC<AgentsPanelProps> = ({ onAgentSelect, onWorkflowSelect }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('agents');
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [selectedTool, setSelectedTool] = useState<string>('');
  
  const [agents, setAgents] = useState<Agent[]>([]);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [workflowsLoading, setWorkflowsLoading] = useState<boolean>(false);
  const [workflowsLoaded, setWorkflowsLoaded] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);

  // 加载初始数据（只加载agents和tools）
  const loadData = async () => {
    setLoading(true);
    try {
      const [agentsResult, toolsResult] = await Promise.all([
        getAgents(),
        getTools()
      ]);

      if (agentsResult.success && agentsResult.data) {
        setAgents(agentsResult.data);
        if (agentsResult.data.length > 0) {
          setSelectedAgent(agentsResult.data[0].id);
        }
      }

      if (toolsResult.success && toolsResult.data) {
        setTools(toolsResult.data);
        if (toolsResult.data.length > 0) {
          setSelectedTool(toolsResult.data[0].id);
        }
      }
    } catch (error) {
              message.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // 加载workflows数据
  const loadWorkflows = async () => {
    if (workflowsLoaded) return; // Don't reload if already loaded
    
    setWorkflowsLoading(true);
    try {
      const workflowsResult = await getWorkflows();

      if (workflowsResult.success && workflowsResult.data) {
        setWorkflows(workflowsResult.data);
        if (workflowsResult.data.length > 0) {
          setSelectedWorkflow(workflowsResult.data[0].id);
        }
        setWorkflowsLoaded(true);
      } else {
        message.error(workflowsResult.error || 'Failed to load workflows');
      }
    } catch (error) {
              message.error('Error occurred while loading workflows');
    } finally {
      setWorkflowsLoading(false);
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
    if (workflow && onWorkflowSelect) {
      onWorkflowSelect(workflow);
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


  // 使用工具
  const handleUseTool = async (toolId: string) => {
    setExecuting(true);
    try {
      const result = await executeTool(toolId);
      if (result.success) {
        message.success(result.data?.result || 'Tool used successfully');
      } else {
        message.error(result.error || 'Usage failed');
      }
    } catch (error) {
      message.error('Error occurred during usage');
    } finally {
      setExecuting(false);
    }
  };

  // 处理添加新Agent
  const handleAddAgent = () => {
    navigate('/agent-create');
  };

  // 处理添加新Workflow
  const handleAddWorkflow = async () => {
    try {
      const result = await getWorkflowFrontendUrl();
      if (result.success && result.data) {
        window.open(result.data, '_blank');
      } else {
        message.error(result.error || '获取跳转URL失败');
      }
    } catch (error) {
      message.error('获取跳转URL时发生错误');
      console.error('Get workflow frontend URL error:', error);
    }
  };

  // 处理tab切换
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    
    // Load workflows data if switching to workflows tab and not loaded yet
    if (key === 'workflows' && !workflowsLoaded) {
      loadWorkflows();
    }
  };

  // Agents标签页内容
  const renderAgents = () => (
    <div className="space-y-3">
      {/* 添加Agent按钮卡片 */}
      <div 
        onClick={handleAddAgent}
        className="cursor-pointer transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:shadow-sm rounded-lg p-3 bg-gray-50 hover:bg-gray-100"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200 flex-shrink-0">
            <PlusOutlined className="text-gray-600 hover:text-gray-700 text-sm" />
          </div>
          <div className="flex-1">
            <span className="text-sm text-gray-700 hover:text-gray-900 font-medium block">
              Create New Agent
            </span>
            <span className="text-xs text-gray-500">
              Build your custom AI assistant
            </span>
          </div>
        </div>
      </div>
      
      {/* 现有的agents列表 */}
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          isSelected={selectedAgent === agent.id}
          onSelect={handleAgentSelect}
          formatCallCount={formatCallCount}
          getIcon={getIcon}
          onAgentUpdate={loadData} // 传递刷新函数
        />
      ))}
    </div>
  );

  // Workflows标签页内容
  const renderWorkflows = () => {
    if (workflowsLoading) {
      return (
        <div className="flex justify-center items-center h-32">
          <Spin size="large" />
        </div>
      );
    }

    if (!workflowsLoaded && workflows.length === 0) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="text-center">
            <div className="text-gray-400 mb-2">Click this tab to load workflow list</div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {/* 添加Workflow按钮卡片 */}
        <div 
          onClick={handleAddWorkflow}
          className="cursor-pointer transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:shadow-sm rounded-lg p-3 bg-gray-50 hover:bg-gray-100"
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200 flex-shrink-0">
              <PlusOutlined className="text-gray-600 hover:text-gray-700 text-sm" />
            </div>
            <div className="flex-1">
              <span className="text-sm text-gray-700 hover:text-gray-900 font-medium block">
                Create New Workflow
              </span>
              <span className="text-xs text-gray-500">
                Build your custom automation workflow
              </span>
            </div>
          </div>
        </div>
        
        {/* 现有的workflows列表 */}
        {workflows.map((workflow) => (
          <WorkflowCard
            key={workflow.id}
            workflow={workflow}
            isSelected={selectedWorkflow === workflow.id}
            onSelect={handleWorkflowSelect}
            formatCallCount={formatCallCount}
            getIcon={getIcon}
          />
        ))}
      </div>
    );
  };

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
    <div className="h-full flex flex-col rounded-xl overflow-hidden">
      {/* 头部区域 */}
      <div className="p-8 pb-6">
        <Title level={4} className="text-gray-900 mb-3 font-medium">
          AI Assistants
        </Title>
        <Text className="text-gray-500 text-sm leading-relaxed">
          Choose from intelligent agents, workflows, and tools to enhance your productivity.
        </Text>
      </div>

      {/* 标签页内容 */}
      <div className="flex-1 overflow-hidden">
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          className="h-full agents-panel-tabs"
          size="small"
          centered
          tabBarStyle={{ 
            paddingLeft: '32px', 
            paddingRight: '32px', 
            marginBottom: 0,
            minHeight: '48px',
            fontSize: '14px',
            flexShrink: 0,
            backgroundColor: 'transparent'
          }}
          tabBarGutter={32}
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
            <div className="flex-1 px-8 pb-8 overflow-auto agents-panel-scrollbar agents-panel-scrollbar-blue">
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
            <div className="flex-1 px-8 pb-8 overflow-auto agents-panel-scrollbar agents-panel-scrollbar-green">
              {renderWorkflows()}
            </div>
          </TabPane>
          
          {/* <TabPane 
            tab={
              <span className="flex items-center gap-1">
                <ToolOutlined className="text-xs" />
                <span className="text-xs">Tools</span>
              </span>
            }
            key="tools"
            className="h-full flex flex-col"
          >
            <div className="flex-1 px-8 pb-8 overflow-auto agents-panel-scrollbar agents-panel-scrollbar-purple">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <Spin size="large" />
                </div>
              ) : (
                renderTools()
              )}
            </div>
          </TabPane> */}
        </Tabs>
      </div>
    </div>
  );
};

export default AgentsPanel; 