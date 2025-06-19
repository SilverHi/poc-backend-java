import axios from 'axios';

// 创建axios实例
const instance = axios.create({
  baseURL: '/api', // 可根据需要修改
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 在这里自定义请求拦截逻辑（如添加token等）
    return config;
  },
  error => {
    // 在这里处理请求错误
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 在这里自定义响应拦截逻辑（如统一处理错误码等）
    return response;
  },
  error => {
    // 在这里处理响应错误
    return Promise.reject(error);
  }
);

export default instance; 