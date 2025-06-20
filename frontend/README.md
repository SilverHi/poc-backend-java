# POC Frontend

基于 React + Ant Design 的前端项目

## 技术栈

- React 18
- Ant Design 5
- Axios

## 安装依赖

```bash
cd frontend
npm install
```

## 使用 Vite 启动开发服务器

```bash
npm run dev
```

默认端口为 3000，可通过 `vite.config.ts` 修改。

## 功能特性

- 🎨 使用 Ant Design 组件库
- 🔗 自动代理后端 API 请求到 localhost:8080
- 📊 显示系统状态（前端/后端连接状态）
- 🖼️ 示例图片展示
- 📱 响应式设计

## 后端连接

项目已配置代理，所有 `/api/*` 请求将自动转发到 `http://localhost:8080`

## 项目结构

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── api/         # API 请求封装
│   ├── assets/      # 静态资源（图片、SVG等）
│   ├── components/  # 通用组件
│   ├── constants/   # 全局常量
│   ├── hooks/       # 自定义 React hooks
│   ├── layouts/     # 通用布局组件
│   ├── pages/       # 页面组件
│   ├── store/       # 全局状态管理
│   ├── styles/      # 样式文件
│   ├── types/       # 类型定义（TypeScript接口等）
│   ├── utils/       # 工具函数
│   ├── App.tsx      # 主应用组件
│   ├── main.tsx     # 应用入口
│   └── index.css    # 基础样式
├── package.json     # 项目配置
└── README.md        # 项目说明
``` 