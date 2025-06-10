-- PostgreSQL 17 兼容的 chat_agents_info 表创建脚本
-- 创建时间: 2024-06-10
-- 说明: AI代理配置信息表

-- 删除已存在的表（如果存在）
DROP TABLE IF EXISTS chat_agents_info CASCADE;

-- 创建 chat_agents_info 表
CREATE TABLE chat_agents_info (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL DEFAULT 'general',
    icon VARCHAR(255),
    model_name VARCHAR(100) NOT NULL DEFAULT 'gpt-4o-mini',
    system_prompt TEXT,
    call_count BIGINT NOT NULL DEFAULT 0,
    temperature DECIMAL(3,2) NOT NULL DEFAULT 0.7,
    max_tokens INTEGER NOT NULL DEFAULT 2048,
    create_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- 约束条件
    CONSTRAINT ck_chat_agents_temperature CHECK (temperature >= 0.0 AND temperature <= 2.0),
    CONSTRAINT ck_chat_agents_max_tokens CHECK (max_tokens > 0 AND max_tokens <= 32768),
    CONSTRAINT ck_chat_agents_call_count CHECK (call_count >= 0),
    CONSTRAINT ck_chat_agents_name_length CHECK (LENGTH(name) >= 1)
);

-- 创建索引以提升查询性能
CREATE INDEX idx_chat_agents_info_name ON chat_agents_info(name);
CREATE INDEX idx_chat_agents_info_type ON chat_agents_info(type);
CREATE INDEX idx_chat_agents_info_create_time ON chat_agents_info(create_time DESC);
CREATE INDEX idx_chat_agents_info_model_name ON chat_agents_info(model_name);

-- 添加表和字段注释
COMMENT ON TABLE chat_agents_info IS 'AI代理配置信息表，存储各种AI助手的配置参数';

COMMENT ON COLUMN chat_agents_info.id IS '主键ID，自增长';
COMMENT ON COLUMN chat_agents_info.name IS 'Agent名称，用于显示和识别';
COMMENT ON COLUMN chat_agents_info.description IS 'Agent功能介绍和描述信息';
COMMENT ON COLUMN chat_agents_info.type IS 'Agent类型分类：general(通用), specialist(专业), creative(创意), analyst(分析)等';
COMMENT ON COLUMN chat_agents_info.icon IS 'Agent图标名称或URL地址';
COMMENT ON COLUMN chat_agents_info.model_name IS '使用的AI模型名称，如gpt-4o-mini, gpt-4等';
COMMENT ON COLUMN chat_agents_info.system_prompt IS '系统提示词，定义Agent的行为和角色';
COMMENT ON COLUMN chat_agents_info.call_count IS '调用次数统计，用于分析使用频率';
COMMENT ON COLUMN chat_agents_info.temperature IS '模型创造性参数，范围0.0-2.0，越高越有创意';
COMMENT ON COLUMN chat_agents_info.max_tokens IS '单次对话最大输出token数量限制';
COMMENT ON COLUMN chat_agents_info.create_time IS '记录创建时间';
COMMENT ON COLUMN chat_agents_info.update_time IS '记录最后更新时间';

-- 创建更新时间自动更新的触发器函数
CREATE OR REPLACE FUNCTION update_chat_agents_info_updated_time()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_time = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器
CREATE TRIGGER tr_chat_agents_info_update_time
    BEFORE UPDATE ON chat_agents_info
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_agents_info_updated_time();

-- 插入初始示例数据
INSERT INTO chat_agents_info (
    name, 
    description, 
    type, 
    icon, 
    model_name, 
    system_prompt, 
    temperature, 
    max_tokens
) VALUES
(
    '通用助手',
    '智能通用AI助手，能够回答各种问题、提供建议和协助完成日常任务。适合一般性咨询和对话交流。',
    'general',
    'robot',
    'gpt-4o-mini',
    '你是一个友善、专业的AI助手。请用简洁清晰的语言回答用户的问题，提供准确有用的信息和建议。保持礼貌和耐心，如果不确定答案请诚实说明。',
    0.7,
    2048
),
(
    '代码专家',
    '专业的编程和技术开发助手，精通多种编程语言和开发框架。能够提供代码审查、bug修复、架构设计等技术支持。',
    'specialist',
    'code',
    'gpt-4o-mini',
    '你是一个资深的软件工程师和代码专家。擅长Java、Python、JavaScript、SQL等多种编程语言。请为用户提供准确的代码建议、最佳实践和技术解决方案。代码示例要规范、可运行且有注释。',
    0.3,
    4096
),
(
    '创意写手',
    '富有创意的写作助手，专门协助创作各类文本内容。包括文章写作、故事创作、广告文案、营销内容等创意写作任务。',
    'creative',
    'pen',
    'gpt-4o-mini',
    '你是一个才华横溢的创意写作专家。擅长创作各种体裁的文本内容，包括文章、故事、诗歌、广告文案等。请用生动有趣的语言风格，充分发挥创意思维，为用户创作高质量的原创内容。',
    0.9,
    3072
),
(
    '数据分析师',
    '专业的数据分析和商业智能助手，能够处理数据分析、制作图表、提供商业洞察和决策建议。',
    'analyst',
    'chart',
    'gpt-4o-mini',
    '你是一个经验丰富的数据分析师和商业智能专家。擅长数据处理、统计分析、趋势预测和商业洞察。请用客观、专业的方式分析数据，提供基于事实的结论和可行的商业建议。',
    0.5,
    2048
),
(
    '学习导师',
    '教育和学习辅导专家，能够制定学习计划、解答学术问题、提供学习方法指导。适合各种学科的学习辅导。',
    'education',
    'book',
    'gpt-4o-mini',
    '你是一个耐心细致的学习导师和教育专家。擅长各个学科的知识教学和学习指导。请用易懂的方式解释复杂概念，提供循序渐进的学习建议，鼓励学生主动思考和实践。',
    0.6,
    2048
);

-- 创建查询视图以便于数据检索
CREATE VIEW v_agents_summary AS
SELECT 
    id,
    name,
    description,
    type,
    icon,
    model_name,
    call_count,
    temperature,
    max_tokens,
    create_time,
    update_time
FROM chat_agents_info 
ORDER BY call_count DESC, create_time DESC;

COMMENT ON VIEW v_agents_summary IS 'Agent列表视图，按调用次数和创建时间排序';

-- 输出创建完成信息
DO $$
BEGIN
    RAISE NOTICE '✅ chat_agents_info 表创建完成！';
    RAISE NOTICE '📊 已插入 % 条初始数据', (SELECT COUNT(*) FROM chat_agents_info);
    RAISE NOTICE '🔍 可使用视图 v_agents_summary 查询Agent信息';
END $$; 