// 类型定义
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'txt';
  content: string;
  preview: string;
  size: string;
  uploadTime: string;
  status: 'ready';
}

export interface DocumentUploadResponse {
  success: boolean;
  document?: Document;
  error?: string;
}

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

export interface WorkflowVariable {
  name: string;
  description: string;
}

export interface WorkflowNode {
  id: string;
  name: string;
  user_prompt: string;
}

export interface Workflow {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  agents: string[];
  estimatedTime: string;
  category: 'workflow';
  callCount: number;
  nodes: WorkflowNode[];
  vars: WorkflowVariable[];
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

// API配置
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080',
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
  return realGetDocuments();
};

/**
 * 根据ID获取文档
 */
export const getDocumentById = async (id: string): Promise<ApiResponse<Document | null>> => {
  return realGetDocumentById(id);
};

/**
 * 根据IDs获取多个文档（为agents提供）
 */
export const getDocumentsByIds = async (ids: string[]): Promise<ApiResponse<Document[]>> => {
  return realGetDocumentsByIds(ids);
};

/**
 * 搜索文档
 */
export const searchDocuments = async (query: string): Promise<ApiResponse<Document[]>> => {
  return realSearchDocuments(query);
};

/**
 * 上传文档
 */
export const uploadDocument = async (file: File): Promise<DocumentUploadResponse> => {
  return realUploadDocument(file);
};

/**
 * 删除文档
 */
export const deleteDocument = async (id: string): Promise<ApiResponse<boolean>> => {
  return realDeleteDocument(id);
};

/**
 * 获取文档内容（为AI对话提供）
 */
export const getDocumentContent = async (id: string): Promise<ApiResponse<string | null>> => {
  return realGetDocumentContent(id);
};

/**
 * 批量获取文档内容（为agents提供）
 */
export const getDocumentsContent = async (ids: string[]): Promise<ApiResponse<Record<string, string>>> => {
  return realGetDocumentsContent(ids);
};

// ==================== 配置管理 ====================

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

// 工具函数：转换外部workflow API响应为前端格式
const convertExternalWorkflowToFrontend = (workflow: any): Workflow => {
  return {
    id: workflow.id.toString(),
    name: workflow.name || 'Untitled Workflow',
    type: workflow.type || 'automation',
    icon: 'workflow',
    description: workflow.description || 'No description',
    agents: workflow.agents || [],
    estimatedTime: workflow.estimatedTime || '1-2 minutes',
    category: 'workflow' as const,
    callCount: workflow.callCount || 0,
    nodes: workflow.nodes || [],
    vars: workflow.vars || []
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
 * 获取所有Workflows - 通过Java后端API
 */
const realGetWorkflows = async (): Promise<ApiResponse<Workflow[]>> => {
  try {
    const result = await httpRequest<any>('/api/chatbycard/workflows');
    
    // 处理双重嵌套：httpRequest返回{success, data}，其中data是后端的ApiResponse
    if (result.success && result.data) {
      const backendResponse = result.data;
      
      if (backendResponse.success && backendResponse.data && backendResponse.data.data && Array.isArray(backendResponse.data.data)) {
        // 转换后端数据格式为前端期望的格式
        const workflows: Workflow[] = backendResponse.data.data.map((workflow: any) => 
          convertExternalWorkflowToFrontend(workflow)
        );
        
        return {
          success: true,
          data: workflows,
        };
      }
      
      return {
        success: false,
        error: backendResponse.error || '获取工作流列表失败：数据格式错误'
      };
    }
    
    return {
      success: false,
      error: result.error || '获取工作流列表失败：请求失败'
    };
  } catch (error) {
    console.error('Get workflows error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取工作流列表失败'
    };
  }
};

/**
 * 获取所有Agents
 */
export const getAgents = async (): Promise<ApiResponse<Agent[]>> => {
  return realGetAgents();
};

/**
 * 获取所有Workflows
 */
export const getWorkflows = async (): Promise<ApiResponse<Workflow[]>> => {
  return realGetWorkflows();
};

/**
 * 获取所有Tools
 */
export const getTools = async (): Promise<ApiResponse<Tool[]>> => {
  return httpRequest<Tool[]>('/api/tools');
};

/**
 * 根据ID获取Agent
 */
export const getAgentById = async (id: string): Promise<ApiResponse<Agent | null>> => {
  return realGetAgentById(id);
};

/**
 * 根据ID获取Workflow
 */
export const getWorkflowById = async (id: string): Promise<ApiResponse<Workflow | null>> => {
  return httpRequest<Workflow>(`/api/workflows/${id}`);
};

/**
 * 根据ID获取Tool
 */
export const getToolById = async (id: string): Promise<ApiResponse<Tool | null>> => {
  return httpRequest<Tool>(`/api/tools/${id}`);
};

/**
 * 搜索Agents
 */
export const searchAgents = async (query: string): Promise<ApiResponse<Agent[]>> => {
  return realSearchAgents(query);
};

/**
 * 增加代理调用次数
 */
export const incrementAgentCallCount = async (id: string): Promise<ApiResponse<boolean>> => {
  return realIncrementAgentCallCount(id);
};

/**
 * 执行Workflow
 */
export const executeWorkflow = async (workflowId: string, params?: any): Promise<ApiResponse<{ jobId: string; status: string }>> => {
  return httpRequest<{ jobId: string; status: string }>('/api/workflows/execute', {
    method: 'POST',
    body: JSON.stringify({ workflowId, params }),
  });
};

/**
 * 获取工作流前端跳转URL
 */
export const getWorkflowFrontendUrl = async (): Promise<ApiResponse<string>> => {
  try {
    const result = await httpRequest<any>('/api/chatbycard/workflows/frontend-url');
    
    // 处理后端响应：httpRequest返回{success, data}，其中data是后端的ApiResponse
    if (result.success && result.data) {
      const backendResponse = result.data;
      
      if (backendResponse.success && backendResponse.data) {
        return {
          success: true,
          data: backendResponse.data,
        };
      }
      
      return {
        success: false,
        error: backendResponse.error || '获取工作流前端跳转URL失败'
      };
    }
    
    return {
      success: false,
      error: result.error || '获取工作流前端跳转URL失败：请求失败'
    };
  } catch (error) {
    console.error('Get workflow frontend URL error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '获取工作流前端跳转URL失败'
    };
  }
};

/**
 * 使用Tool
 */
export const executeTool = async (toolId: string, params?: any): Promise<ApiResponse<{ result: string; status: string }>> => {
  return httpRequest<{ result: string; status: string }>('/api/tools/execute', {
    method: 'POST',
    body: JSON.stringify({ toolId, params }),
  });
};

// ==================== AI聊天相关API ====================

/**
 * AI聊天请求接口
 */
export interface AiChatRequest {
  agentId?: string;
  documentIds?: string[];
  userInput?: string;
  previousAiOutput?: string;
}

/**
 * AI聊天响应接口
 */
export interface AiChatResponse {
  content: string;
  modelName: string;
  agentName?: string;
  timestamp: string;
  characterCount: number;
}

/**
 * 调用AI聊天接口
 */
export const aiChat = async (request: AiChatRequest): Promise<ApiResponse<AiChatResponse>> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/chatbycard/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.data) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        error: result.message || 'AI聊天请求失败',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'AI聊天请求失败',
    };
  }
};

/**
 * 调用AI聊天流式接口
 * @param request 聊天请求
 * @param onChunk 接收到数据块时的回调函数
 * @param onError 发生错误时的回调函数
 * @param onComplete 完成时的回调函数
 */
export const aiChatStream = async (
  request: AiChatRequest,
  onChunk: (chunk: string) => void,
  onError: (error: string) => void,
  onComplete: () => void
): Promise<void> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/api/chatbycard/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保留可能不完整的最后一行

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          if (line.startsWith('data: ')) {
            const data = line.slice(6); // 移除 "data: " 前缀
            
            if (data === '[DONE]') {
              onComplete();
              return;
            }

            // 处理错误数据
            if (data.startsWith('{') && data.includes('error')) {
              try {
                const errorData = JSON.parse(data);
                if (errorData.error) {
                  onError(errorData.error);
                  return;
                }
              } catch (e) {
                // 如果不是JSON格式的错误，继续处理
              }
            }

            // 处理正常的文本数据
            if (data && data !== '') {
              onChunk(data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : 'AI流式聊天请求失败');
  }
};

 