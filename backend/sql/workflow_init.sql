-- 工作流数据库初始化脚本
-- 创建工作流相关表

-- 创建工作流表
CREATE TABLE IF NOT EXISTS wf_workflow (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    config TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建工作流执行记录表
CREATE TABLE IF NOT EXISTS wf_execution (
    id BIGSERIAL PRIMARY KEY,
    workflow_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    current_node VARCHAR(255),
    error_message TEXT,
    result TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (workflow_id) REFERENCES wf_workflow(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_workflow_status ON wf_workflow(status);
CREATE INDEX IF NOT EXISTS idx_workflow_name ON wf_workflow(name);
CREATE INDEX IF NOT EXISTS idx_execution_workflow_id ON wf_execution(workflow_id);
CREATE INDEX IF NOT EXISTS idx_execution_status ON wf_execution(status);

-- 插入示例数据（可选）
INSERT INTO wf_workflow (name, description, config, status) VALUES 
('示例工作流', '这是一个示例工作流', '{"nodes":[{"id":"start","type":"start","data":{"label":"开始"}}],"edges":[]}', 'DRAFT')
ON CONFLICT DO NOTHING; 