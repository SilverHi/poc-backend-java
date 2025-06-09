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
  USE_MOCK: true, // 开发时使用mock，生产时改为false
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

// ==================== 真实API实现 ====================

/**
 * 获取所有文档 - 真实API
 */
const realGetDocuments = async (): Promise<ApiResponse<Document[]>> => {
  return httpRequest<Document[]>('/api/documents');
};

/**
 * 根据ID获取文档 - 真实API
 */
const realGetDocumentById = async (id: string): Promise<ApiResponse<Document | null>> => {
  return httpRequest<Document>(`/api/documents/${id}`);
};

/**
 * 根据IDs获取多个文档 - 真实API
 */
const realGetDocumentsByIds = async (ids: string[]): Promise<ApiResponse<Document[]>> => {
  return httpRequest<Document[]>('/api/documents/batch', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
};

/**
 * 搜索文档 - 真实API
 */
const realSearchDocuments = async (query: string): Promise<ApiResponse<Document[]>> => {
  return httpRequest<Document[]>(`/api/documents/search?q=${encodeURIComponent(query)}`);
};

/**
 * 上传文档 - 真实API
 */
const realUploadDocument = async (file: File): Promise<DocumentUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/documents/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
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
  return httpRequest<boolean>(`/api/documents/${id}`, {
    method: 'DELETE',
  });
};

/**
 * 获取文档内容 - 真实API
 */
const realGetDocumentContent = async (id: string): Promise<ApiResponse<string | null>> => {
  const result = await httpRequest<{ content: string }>(`/api/documents/${id}/content`);
  if (result.success && result.data) {
    return {
      success: true,
      data: result.data.content,
    };
  }
  return {
    success: result.success,
    error: result.error,
    data: null,
  };
};

/**
 * 批量获取文档内容 - 真实API
 */
const realGetDocumentsContent = async (ids: string[]): Promise<ApiResponse<Record<string, string>>> => {
  return httpRequest<Record<string, string>>('/api/documents/content/batch', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
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

/**
 * 获取所有Agents
 */
export const getAgents = async (): Promise<ApiResponse<Agent[]>> => {
  return API_CONFIG.USE_MOCK ? mockGetAgents() : httpRequest<Agent[]>('/api/agents');
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
  return API_CONFIG.USE_MOCK ? mockGetAgentById(id) : httpRequest<Agent>(`/api/agents/${id}`);
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
  return API_CONFIG.USE_MOCK ? mockSearchAgents(query) : httpRequest<Agent[]>(`/api/agents/search?q=${encodeURIComponent(query)}`);
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