import mockDocuments from './documents.json';

// 文档接口定义
export interface Document {
  id: string;
  name: string;
  type: 'txt';
  content: string;
  preview: string;
  size: string;
  uploadTime: string;
  status: 'uploaded' | 'processing' | 'ready' | 'error';
}

export interface DocumentUploadResponse {
  success: boolean;
  document?: Document;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// 模拟API延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock数据存储（运行时修改）
let mockDocumentList: Document[] = [...mockDocuments as Document[]];

// ==================== Mock API 实现 ====================

/**
 * 获取所有文档
 */
export const mockGetDocuments = async (): Promise<ApiResponse<Document[]>> => {
  await delay(500);
  return {
    success: true,
    data: [...mockDocumentList],
  };
};

/**
 * 根据ID获取文档
 */
export const mockGetDocumentById = async (id: string): Promise<ApiResponse<Document | null>> => {
  await delay(300);
  const document = mockDocumentList.find(doc => doc.id === id) || null;
  return {
    success: true,
    data: document,
  };
};

/**
 * 根据IDs获取多个文档（为agents提供）
 */
export const mockGetDocumentsByIds = async (ids: string[]): Promise<ApiResponse<Document[]>> => {
  await delay(400);
  const documents = mockDocumentList.filter(doc => ids.indexOf(doc.id) !== -1);
  return {
    success: true,
    data: documents,
  };
};

/**
 * 搜索文档
 */
export const mockSearchDocuments = async (query: string): Promise<ApiResponse<Document[]>> => {
  await delay(600);
  if (!query.trim()) {
    return {
      success: true,
      data: mockDocumentList,
    };
  }
  
  const results = mockDocumentList.filter(doc => 
    doc.name.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
    doc.content.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
    doc.preview.toLowerCase().indexOf(query.toLowerCase()) !== -1
  );
  
  return {
    success: true,
    data: results,
  };
};

/**
 * 上传文档
 */
export const mockUploadDocument = async (file: File): Promise<DocumentUploadResponse> => {
  await delay(1000);
  
  try {
    // 验证文件类型
    if (!file.name.endsWith('.txt')) {
      return {
        success: false,
        error: '仅支持txt格式文件'
      };
    }

    // 验证文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      return {
        success: false,
        error: '文件大小不能超过5MB'
      };
    }

    // 读取文件内容
    const content = await file.text();
    
    // 生成预览
    const preview = content.length > 100 
      ? content.substring(0, 100) + '...' 
      : content;

    // 创建新文档
    const newDocument: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: 'txt',
      content,
      preview,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      uploadTime: new Date().toISOString().split('T')[0],
      status: 'ready'
    };

    // 添加到mock数据
    mockDocumentList.unshift(newDocument);

    return {
      success: true,
      document: newDocument
    };
  } catch (error) {
    return {
      success: false,
      error: '文件上传失败'
    };
  }
};

/**
 * 删除文档
 */
export const mockDeleteDocument = async (id: string): Promise<ApiResponse<boolean>> => {
  await delay(300);
  const index = mockDocumentList.findIndex(doc => doc.id === id);
  if (index > -1) {
    mockDocumentList.splice(index, 1);
    return {
      success: true,
      data: true,
    };
  }
  return {
    success: false,
    error: '文档不存在',
  };
};

/**
 * 获取文档内容（为AI对话提供）
 */
export const mockGetDocumentContent = async (id: string): Promise<ApiResponse<string | null>> => {
  await delay(200);
  const document = mockDocumentList.find(doc => doc.id === id);
  return {
    success: true,
    data: document ? document.content : null,
  };
};

/**
 * 批量获取文档内容（为agents提供）
 */
export const mockGetDocumentsContent = async (ids: string[]): Promise<ApiResponse<Record<string, string>>> => {
  await delay(400);
  const result: Record<string, string> = {};
  
  ids.forEach(id => {
    const document = mockDocumentList.find(doc => doc.id === id);
    if (document) {
      result[id] = document.content;
    }
  });
  
  return {
    success: true,
    data: result,
  };
}; 