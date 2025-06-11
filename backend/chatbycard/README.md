# ChatByCard 文档管理模块

## 功能概述

本模块实现了文档管理功能，包括文档上传、存储、检索和异步处理。目前支持txt格式文件，后续可扩展支持更多格式。

## 主要功能

### 1. 文档上传
- **接口**: `POST /api/chatbycard/documents/upload`
- **功能**: 上传txt格式文档
- **限制**: 文件大小最大10MB
- **处理**: 文件内容存储到数据库，支持异步后台处理

### 2. 文档列表
- **接口**: `GET /api/chatbycard/documents`
- **功能**: 获取所有文档列表
- **返回**: 文档基本信息和预览内容

### 3. 文档详情
- **接口**: `GET /api/chatbycard/documents/{id}`
- **功能**: 获取指定文档的详细信息

### 4. 文档内容
- **接口**: `GET /api/chatbycard/documents/{id}/content`
- **功能**: 获取文档的完整内容

### 5. 文档删除
- **接口**: `DELETE /api/chatbycard/documents/{id}`
- **功能**: 删除指定文档

## 技术架构

### 分层结构
```
controller/     # 控制器层 - 处理HTTP请求
├── DocumentController.java    # 文档管理API
└── TestController.java       # 测试API

service/        # 服务层 - 业务逻辑
├── DocumentService.java      # 服务接口
└── impl/
    └── DocumentServiceImpl.java  # 服务实现

mapper/         # 数据访问层
└── ChatDocumentInfoMapper.java   # MyBatis-Plus映射器

entity/         # 实体层
└── ChatDocumentInfo.java    # 文档实体

dto/            # 数据传输对象
├── DocumentDTO.java         # 文档DTO
└── ApiResponse.java         # 统一响应格式

config/         # 配置层
├── AsyncConfig.java         # 异步配置
└── MyBatisPlusConfig.java   # MyBatis-Plus配置
```

### 数据库表
```sql
-- 文档信息表
CREATE TABLE chat_document_info (
    id BIGSERIAL PRIMARY KEY,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    upload_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## 异步处理

文档上传后会触发异步处理任务，用于：
- 文本分析
- 关键词提取
- 向量化处理
- 搜索索引构建

异步任务使用独立的线程池 `documentProcessExecutor`，配置如下：
- 核心线程数: 2
- 最大线程数: 5
- 队列容量: 100

## API响应格式

### 成功响应
```json
{
  "success": true,
  "data": {...},
  "message": "操作成功",
  "code": 200
}
```

### 错误响应
```json
{
  "success": false,
  "error": "错误信息",
  "code": 400/500
}
```

## 配置说明

### 文件上传配置
```yaml
spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB
      enabled: true
```

### 数据库配置
使用MyBatis-Plus进行数据访问，支持：
- 自动填充创建时间和更新时间
- 驼峰命名转换
- SQL日志输出

## 扩展计划

1. **多格式支持**: 扩展支持PDF、Word、Markdown等格式
2. **文档分块**: 大文档自动分块处理
3. **向量搜索**: 集成向量数据库支持语义搜索
4. **文档版本**: 支持文档版本管理
5. **权限控制**: 添加文档访问权限控制

## 测试接口

- **模块状态**: `GET /api/chatbycard/test/status`
- **健康检查**: `GET /api/health` 