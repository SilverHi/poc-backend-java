# 工作流模块 (Workflow Module)

这是AI工作流系统的Java后端实现，作为整个AI应用的一部分。

## 功能特性

- 工作流管理（创建、更新、删除、查询）
- 工作流执行引擎
- 节点配置解析
- 外部Agent集成
- 工作流导入导出
- REST API接口

## 技术栈

- Spring Boot 3.x
- Spring Data JPA
- PostgreSQL
- Jackson JSON处理
- Lombok
- Maven

## API端点

### 工作流管理
- `GET /api/workflows` - 获取工作流列表
- `POST /api/workflows` - 创建新工作流
- `GET /api/workflows/{id}` - 获取工作流详情
- `PUT /api/workflows/{id}` - 更新工作流
- `DELETE /api/workflows/{id}` - 删除工作流

### 工作流执行
- `POST /api/workflows/{id}/execute` - 执行工作流
- `POST /api/workflows/run_workflow` - 运行工作流

### 导入导出
- `GET /api/workflows/{id}/export` - 导出工作流
- `GET /api/workflows/{id}/export/download` - 下载工作流文件
- `POST /api/workflows/import` - 导入工作流

### Agent管理
- `GET /api/agents` - 获取Agent列表
- `GET /api/external-agents` - 获取外部Agent信息

### 测试接口
- `GET /api/workflow/test/status` - 模块状态检查
- `GET /api/workflow/test/health` - 健康检查

## 数据模型

### 工作流表 (wf_workflow)
- id: 主键
- name: 工作流名称
- description: 工作流描述
- config: 工作流配置(JSON)
- status: 状态(DRAFT/ACTIVE/ARCHIVED)
- created_at: 创建时间
- updated_at: 更新时间

### 执行记录表 (wf_execution)
- id: 主键
- workflow_id: 工作流ID
- status: 执行状态(PENDING/RUNNING/COMPLETED/FAILED)
- current_node: 当前执行节点
- error_message: 错误信息
- result: 执行结果
- created_at: 创建时间
- updated_at: 更新时间
- completed_at: 完成时间

## 配置说明

在 `application.yml` 中配置：

```yaml
external:
  chatbycard:
    url: http://localhost:8080  # 外部ChatByCard服务地址
```

## 使用示例

### 创建工作流
```bash
curl -X POST http://localhost:8080/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试工作流",
    "description": "这是一个测试工作流",
    "config": "{\"nodes\":[],\"edges\":[]}"
  }'
```

### 获取工作流列表
```bash
curl http://localhost:8080/api/workflows?skip=0&limit=10
```

### 运行工作流
```bash
curl -X POST http://localhost:8080/api/workflows/run_workflow \
  -H "Content-Type: application/json" \
  -d '{
    "id": "1",
    "args": {"input": "测试输入"}
  }'
```

## 开发说明

1. 本模块已集成到主服务器中，通过server模块启动
2. 数据库表会自动创建（使用JPA DDL）
3. 支持与前端React应用的CORS通信
4. 集成了外部ChatByCard Agent服务

## 注意事项

- 确保PostgreSQL数据库已启动
- 配置正确的数据库连接信息
- 外部Agent服务需要在8080端口可用（现在是内部调用）
- 前端工作流页面通过 `http://localhost:3001` 访问 