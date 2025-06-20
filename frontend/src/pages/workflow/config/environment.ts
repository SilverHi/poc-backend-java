// 环境变量配置
export const config = {
  // API基础URL
  apiBaseUrl: (import.meta as any).env.REACT_APP_API_BASE_URL || 'http://localhost:8080',

  // 外部Agent服务URL  
  externalAgentUrl: (import.meta as any).env.REACT_APP_EXTERNAL_AGENT_URL || 'http://localhost:8080',

  // 完整的API URL
  get apiUrl() {
    return `${this.apiBaseUrl}/api`;
  },
  
  // 外部Agent API URL
  get externalAgentApiUrl() {
    return `${this.externalAgentUrl}/api/chatbycard`;
  },
  
  // 开发模式检测
  isDevelopment: (import.meta as any).env.NODE_ENV === 'development',
  
  // 生产模式检测
  isProduction: (import.meta as any).env.NODE_ENV === 'production'
};

export default config; 