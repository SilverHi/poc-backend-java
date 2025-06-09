import agentsData from './agents.json';

// 接口定义
export interface Agent {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  model: string;
  capability: string[];
  category: 'agent';
  callCount: number;
}

export interface Workflow {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  steps: string[];
  agents: string[];
  estimatedTime: string;
  category: 'workflow';
  callCount: number;
}

export interface Tool {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  features: string[];
  compatibility: string[];
  category: 'tool';
  callCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock数据存储
const mockAgents: Agent[] = agentsData.agents as Agent[];
const mockWorkflows: Workflow[] = agentsData.workflows as Workflow[];
const mockTools: Tool[] = agentsData.tools as Tool[];

// ==================== Mock API 实现 ====================

/**
 * 获取所有Agents
 */
export const mockGetAgents = async (): Promise<ApiResponse<Agent[]>> => {
  await delay(400);
  return {
    success: true,
    data: [...mockAgents],
  };
};

/**
 * 获取所有Workflows
 */
export const mockGetWorkflows = async (): Promise<ApiResponse<Workflow[]>> => {
  await delay(500);
  return {
    success: true,
    data: [...mockWorkflows],
  };
};

/**
 * 获取所有Tools
 */
export const mockGetTools = async (): Promise<ApiResponse<Tool[]>> => {
  await delay(300);
  return {
    success: true,
    data: [...mockTools],
  };
};

/**
 * 根据ID获取Agent
 */
export const mockGetAgentById = async (id: string): Promise<ApiResponse<Agent | null>> => {
  await delay(200);
  const agent = mockAgents.find(agent => agent.id === id) || null;
  return {
    success: true,
    data: agent,
  };
};

/**
 * 根据ID获取Workflow
 */
export const mockGetWorkflowById = async (id: string): Promise<ApiResponse<Workflow | null>> => {
  await delay(200);
  const workflow = mockWorkflows.find(workflow => workflow.id === id) || null;
  return {
    success: true,
    data: workflow,
  };
};

/**
 * 根据ID获取Tool
 */
export const mockGetToolById = async (id: string): Promise<ApiResponse<Tool | null>> => {
  await delay(200);
  const tool = mockTools.find(tool => tool.id === id) || null;
  return {
    success: true,
    data: tool,
  };
};

/**
 * 搜索Agents
 */
export const mockSearchAgents = async (query: string): Promise<ApiResponse<Agent[]>> => {
  await delay(400);
  if (!query.trim()) {
    return {
      success: true,
      data: mockAgents,
    };
  }
  
  const results = mockAgents.filter(agent => 
    agent.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
    agent.description.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
    agent.type.toLowerCase().indexOf(query.toLowerCase()) !== -1
  );
  
  return {
    success: true,
    data: results,
  };
};

/**
 * 执行Workflow
 */
export const mockExecuteWorkflow = async (workflowId: string, params?: any): Promise<ApiResponse<{ jobId: string; status: string }>> => {
  await delay(1000);
  
  const workflow = mockWorkflows.find(w => w.id === workflowId);
  if (!workflow) {
    return {
      success: false,
      error: '工作流不存在',
    };
  }
  
  return {
    success: true,
    data: {
      jobId: `job_${Date.now()}`,
      status: 'started',
    },
  };
};

/**
 * 使用Tool
 */
export const mockExecuteTool = async (toolId: string, params?: any): Promise<ApiResponse<{ result: string; status: string }>> => {
  await delay(800);
  
  const tool = mockTools.find(t => t.id === toolId);
  if (!tool) {
    return {
      success: false,
      error: '工具不存在',
    };
  }
  
  return {
    success: true,
    data: {
      result: `工具 ${tool.name} 执行成功`,
      status: 'completed',
    },
  };
}; 