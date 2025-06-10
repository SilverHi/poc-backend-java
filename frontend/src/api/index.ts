// 导入类型定义
import type { Document, DocumentUploadResponse, ApiResponse } from '../mock/mockApi';
import type { Agent, Workflow, Tool } from '../mock/agentsMockApi';

// 导入mock API（开发时使用）
import {
  mockGetDocuments,
  mockGetDocumentById,
  mockGetDocumentsByIds,
  mockSearchDocuments,
  mockUploadDocument,
  mockDeleteDocument,
  mockGetDocumentContent,
  mockGetDocumentsContent,
} from '../mock/mockApi';

import {
  mockGetAgents,
  mockGetWorkflows,
  mockGetTools,
  mockGetAgentById,
  mockGetWorkflowById,
  mockGetToolById,
  mockSearchAgents,
  mockExecuteWorkflow,
  mockExecuteTool,
} from '../mock/agentsMockApi';

// API配置
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
  USE_MOCK: false, // 改为使用真实后端API
  TIMEOUT: 10000,
};

// HTTP请求封装
const httpRequest = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '请求失败',
    };
  }
};

// 工具函数：转换后端文档数据为前端格式
const convertBackendDocumentToFrontend = (doc: any, includeContent: boolean = false): Document => {
  return {
    id: doc.id.toString(),
    name: doc.documentName,
    type: doc.documentType as 'txt',
    content: includeContent ? (doc.content || '') : '',
    preview: doc.preview || '暂无预览',
    size: doc.fileSizeFormatted || '0 B',
    uploadTime: doc.uploadTime ? new Date(doc.uploadTime).toISOString().split('T')[0] : '',
    status: 'ready' as const
  };
};

// ==================== 真实API实现 ====================

/**
 * 获取所有文档 - 真实API
 */
const realGetDocuments = async (): Promise<ApiResponse<Document[]>> => {
  const result = await httpRequest<any>('/api/chatbycard/documents');
  if (result.success && result.data && result.data.data && result.data.data.data) {
    // 转换后端数据格式为前端期望的格式（列表不包含内容）
    const documents: Document[] = result.data.data.data.map((doc: any) => 
      convertBackendDocumentToFrontend(doc, false)
    );
    
    return {
      success: true,
      data: documents,
    };
  }
  return {
    success: false,
    error: result.error || '获取文档列表失败'
  };
};

/**
 * 根据ID获取文档 - 真实API
 */
const realGetDocumentById = async (id: string): Promise<ApiResponse<Document | null>> => {
  const result = await httpRequest<any>(`/api/chatbycard/documents/${id}`);
  if (result.success && result.data && result.data.data && result.data.data.data) {
    const document = convertBackendDocumentToFrontend(result.data.data.data, true);
    
    return {
      success: true,
      data: document,
    };
  }
  return {
    success: false,
    error: result.error || '获取文档详情失败',
    data: null
  };
};

/**
 * 根据IDs获取多个文档 - 真实API
 */
const realGetDocumentsByIds = async (ids: string[]): Promise<ApiResponse<Document[]>> => {
  // 由于后端目前没有批量获取接口，我们逐个获取
  const documents: Document[] = [];
  for (const id of ids) {
    const result = await realGetDocumentById(id);
    if (result.success && result.data) {
      documents.push(result.data);
    }
  }
  return {
    success: true,
    data: documents,
  };
};

/**
 * 搜索文档 - 真实API
 */
const realSearchDocuments = async (query: string): Promise<ApiResponse<Document[]>> => {
  const result = await httpRequest<any>(`/api/chatbycard/documents?keyword=${encodeURIComponent(query)}`);
  if (result.success && result.data && result.data.data && result.data.data.data) {
    const documents: Document[] = result.data.data.data.map((doc: any) => 
      convertBackendDocumentToFrontend(doc, false)
    );
    
    return {
      success: true,
      data: documents,
    };
  }
  return {
    success: false,
    error: result.error || '搜索文档失败'
  };
};

/**
 * 上传文档 - 真实API
 */
const realUploadDocument = async (file: File): Promise<DocumentUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/chatbycard/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.document) {
      const document = convertBackendDocumentToFrontend(result.document, true);
      
      return {
        success: true,
        document
      };
    }
    
    return {
      success: false,
      error: result.message || '上传失败'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '上传失败'
    };
  }
};

/**
 * 删除文档 - 真实API
 */
const realDeleteDocument = async (id: string): Promise<ApiResponse<boolean>> => {
  const result = await httpRequest<any>(`/api/chatbycard/documents/${id}`, {
    method: 'DELETE',
  });
  
  return {
    success: result.success,
    data: result.success,
    error: result.error
  };
};

/**
 * 获取文档内容 - 真实API
 */
const realGetDocumentContent = async (id: string): Promise<ApiResponse<string | null>> => {
  const result = await httpRequest<any>(`/api/chatbycard/documents/${id}/content`);
  if (result.success && result.data && result.data.data && result.data.data.data) {
    return {
      success: true,
      data: result.data.data.data,
    };
  }
  return {
    success: false,
    error: result.error || '获取文档内容失败',
    data: null,
  };
};

/**
 * 批量获取文档内容 - 真实API
 */
const realGetDocumentsContent = async (ids: string[]): Promise<ApiResponse<Record<string, string>>> => {
  // 由于后端目前没有批量获取内容接口，我们逐个获取
  const contentMap: Record<string, string> = {};
  
  for (const id of ids) {
    const result = await realGetDocumentContent(id);
    if (result.success && result.data) {
      contentMap[id] = result.data;
    }
  }
  
  return {
    success: true,
    data: contentMap,
  };
};

// ==================== 统一API接口（自动切换mock/real）====================

/**
 * 获取所有文档
 */
export const getDocuments = async (): Promise<ApiResponse<Document[]>> => {
  return API_CONFIG.USE_MOCK ? mockGetDocuments() : realGetDocuments();
};

/**
 * 根据ID获取文档
 */
export const getDocumentById = async (id: string): Promise<ApiResponse<Document | null>> => {
  return API_CONFIG.USE_MOCK ? mockGetDocumentById(id) : realGetDocumentById(id);
};

/**
 * 根据IDs获取多个文档（为agents提供）
 */
export const getDocumentsByIds = async (ids: string[]): Promise<ApiResponse<Document[]>> => {
  return API_CONFIG.USE_MOCK ? mockGetDocumentsByIds(ids) : realGetDocumentsByIds(ids);
};

/**
 * 搜索文档
 */
export const searchDocuments = async (query: string): Promise<ApiResponse<Document[]>> => {
  return API_CONFIG.USE_MOCK ? mockSearchDocuments(query) : realSearchDocuments(query);
};

/**
 * 上传文档
 */
export const uploadDocument = async (file: File): Promise<DocumentUploadResponse> => {
  return API_CONFIG.USE_MOCK ? mockUploadDocument(file) : realUploadDocument(file);
};

/**
 * 删除文档
 */
export const deleteDocument = async (id: string): Promise<ApiResponse<boolean>> => {
  return API_CONFIG.USE_MOCK ? mockDeleteDocument(id) : realDeleteDocument(id);
};

/**
 * 获取文档内容（为AI对话提供）
 */
export const getDocumentContent = async (id: string): Promise<ApiResponse<string | null>> => {
  return API_CONFIG.USE_MOCK ? mockGetDocumentContent(id) : realGetDocumentContent(id);
};

/**
 * 批量获取文档内容（为agents提供）
 */
export const getDocumentsContent = async (ids: string[]): Promise<ApiResponse<Record<string, string>>> => {
  return API_CONFIG.USE_MOCK ? mockGetDocumentsContent(ids) : realGetDocumentsContent(ids);
};

// ==================== 配置管理 ====================

/**
 * 切换API模式（mock/real）
 */
export const setUseMock = (useMock: boolean) => {
  (API_CONFIG as any).USE_MOCK = useMock;
};

/**
 * 获取当前API配置
 */
export const getApiConfig = () => ({
  ...API_CONFIG
});

/**
 * 设置API基础URL
 */
export const setApiBaseUrl = (baseUrl: string) => {
  (API_CONFIG as any).BASE_URL = baseUrl;
};

// ==================== Agents相关API ====================

// 工具函数：转换后端代理数据为前端格式
const convertBackendAgentToFrontend = (agent: any): Agent => {
  return {
    id: agent.id.toString(),
    name: agent.name,
    type: agent.type,
    icon: agent.icon,
    description: agent.description,
    model: agent.modelName,
    capability: [], // 后端暂时没有capability字段，设为空数组
    category: 'agent' as const,
    callCount: agent.callCount || 0
  };
};

/**
 * 获取所有Agents - 真实API
 */
const realGetAgents = async (): Promise<ApiResponse<Agent[]>> => {
  const result = await httpRequest<any>('/api/chatbycard/agents');
  if (result.success && result.data && result.data.data && result.data.data.data) {
    const agents: Agent[] = result.data.data.data.map((agent: any) => 
      convertBackendAgentToFrontend(agent)
    );
    
    return {
      success: true,
      data: agents,
    };
  }
  return {
    success: false,
    error: result.error || '获取代理列表失败'
  };
};

/**
 * 根据ID获取Agent - 真实API
 */
const realGetAgentById = async (id: string): Promise<ApiResponse<Agent | null>> => {
  const result = await httpRequest<any>(`/api/chatbycard/agents/${id}`);
  if (result.success && result.data && result.data.data && result.data.data.data) {
    const agent = convertBackendAgentToFrontend(result.data.data.data);
    
    return {
      success: true,
      data: agent,
    };
  }
  return {
    success: false,
    error: result.error || '获取代理详情失败',
    data: null
  };
};

/**
 * 搜索Agents - 真实API
 */
const realSearchAgents = async (query: string): Promise<ApiResponse<Agent[]>> => {
  const result = await httpRequest<any>(`/api/chatbycard/agents?keyword=${encodeURIComponent(query)}`);
  if (result.success && result.data && result.data.data && result.data.data.data) {
    const agents: Agent[] = result.data.data.data.map((agent: any) => 
      convertBackendAgentToFrontend(agent)
    );
    
    return {
      success: true,
      data: agents,
    };
  }
  return {
    success: false,
    error: result.error || '搜索代理失败'
  };
};

/**
 * 增加代理调用次数 - 真实API
 */
const realIncrementAgentCallCount = async (id: string): Promise<ApiResponse<boolean>> => {
  const result = await httpRequest<any>(`/api/chatbycard/agents/${id}/increment-call`, {
    method: 'POST',
  });
  
  return {
    success: result.success,
    data: result.success,
    error: result.error
  };
};

/**
 * 获取所有Agents
 */
export const getAgents = async (): Promise<ApiResponse<Agent[]>> => {
  return API_CONFIG.USE_MOCK ? mockGetAgents() : realGetAgents();
};

/**
 * 获取所有Workflows
 */
export const getWorkflows = async (): Promise<ApiResponse<Workflow[]>> => {
  return API_CONFIG.USE_MOCK ? mockGetWorkflows() : httpRequest<Workflow[]>('/api/workflows');
};

/**
 * 获取所有Tools
 */
export const getTools = async (): Promise<ApiResponse<Tool[]>> => {
  return API_CONFIG.USE_MOCK ? mockGetTools() : httpRequest<Tool[]>('/api/tools');
};

/**
 * 根据ID获取Agent
 */
export const getAgentById = async (id: string): Promise<ApiResponse<Agent | null>> => {
  return API_CONFIG.USE_MOCK ? mockGetAgentById(id) : realGetAgentById(id);
};

/**
 * 根据ID获取Workflow
 */
export const getWorkflowById = async (id: string): Promise<ApiResponse<Workflow | null>> => {
  return API_CONFIG.USE_MOCK ? mockGetWorkflowById(id) : httpRequest<Workflow>(`/api/workflows/${id}`);
};

/**
 * 根据ID获取Tool
 */
export const getToolById = async (id: string): Promise<ApiResponse<Tool | null>> => {
  return API_CONFIG.USE_MOCK ? mockGetToolById(id) : httpRequest<Tool>(`/api/tools/${id}`);
};

/**
 * 搜索Agents
 */
export const searchAgents = async (query: string): Promise<ApiResponse<Agent[]>> => {
  return API_CONFIG.USE_MOCK ? mockSearchAgents(query) : realSearchAgents(query);
};

/**
 * 增加代理调用次数
 */
export const incrementAgentCallCount = async (id: string): Promise<ApiResponse<boolean>> => {
  return API_CONFIG.USE_MOCK ? { success: true, data: true } : realIncrementAgentCallCount(id);
};

/**
 * 执行Workflow
 */
export const executeWorkflow = async (workflowId: string, params?: any): Promise<ApiResponse<{ jobId: string; status: string }>> => {
  if (API_CONFIG.USE_MOCK) {
    return mockExecuteWorkflow(workflowId, params);
  }
  
  return httpRequest<{ jobId: string; status: string }>('/api/workflows/execute', {
    method: 'POST',
    body: JSON.stringify({ workflowId, params }),
  });
};

/**
 * 使用Tool
 */
export const executeTool = async (toolId: string, params?: any): Promise<ApiResponse<{ result: string; status: string }>> => {
  if (API_CONFIG.USE_MOCK) {
    return mockExecuteTool(toolId, params);
  }
  
  return httpRequest<{ result: string; status: string }>('/api/tools/execute', {
    method: 'POST',
    body: JSON.stringify({ toolId, params }),
  });
};

// 导出类型
export type { Document, DocumentUploadResponse, ApiResponse, Agent, Workflow, Tool }; 