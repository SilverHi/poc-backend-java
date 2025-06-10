CREATE TABLE chat_document_info (
    id BIGSERIAL PRIMARY KEY,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL ,
    content TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    upload_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    create_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 添加注释
COMMENT ON TABLE chat_document_info IS '聊天文档信息表';
COMMENT ON COLUMN chat_document_info.id IS '主键ID';
COMMENT ON COLUMN chat_document_info.document_name IS '文档名称';
COMMENT ON COLUMN chat_document_info.document_type IS '文档类型';
COMMENT ON COLUMN chat_document_info.content IS '文档全文内容';
COMMENT ON COLUMN chat_document_info.file_size IS '文件大小(字节)';
COMMENT ON COLUMN chat_document_info.upload_time IS '上传时间';
COMMENT ON COLUMN chat_document_info.create_time IS '创建时间';
COMMENT ON COLUMN chat_document_info.update_time IS '更新时间';

-- 创建索引
CREATE INDEX idx_chat_document_info_document_name ON chat_document_info(document_name);
CREATE INDEX idx_chat_document_info_upload_time ON chat_document_info(upload_time);

-- 创建更新时间的触发器
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_time = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_document_info_modtime
    BEFORE UPDATE ON chat_document_info
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();