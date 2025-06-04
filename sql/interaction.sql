-- Database Schema Export
-- Generated from SQLAlchemy models
-- Database: PostgreSQL
-- Only table structures, no data

-- Enable UUID extension if needed (optional)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: agents
CREATE TABLE agents (
                        id VARCHAR(255) NOT NULL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        icon VARCHAR(10) DEFAULT '📝',
                        category VARCHAR(50) NOT NULL,
                        color VARCHAR(20) DEFAULT '#1890ff',
                        system_prompt TEXT NOT NULL,
                        model VARCHAR(100) NOT NULL,
                        temperature REAL DEFAULT 0.7,
                        max_tokens INTEGER DEFAULT 1000,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for agents table
CREATE INDEX ix_agents_id ON agents (id);

-- Table: conversation_summaries
CREATE TABLE conversation_summaries (
                                        id VARCHAR(255) NOT NULL PRIMARY KEY,
                                        title VARCHAR(500) NOT NULL,
                                        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for conversation_summaries table
CREATE INDEX ix_conversation_summaries_id ON conversation_summaries (id);

-- Table: conversation_messages
CREATE TABLE conversation_messages (
                                       id VARCHAR(255) NOT NULL PRIMARY KEY,
                                       conversation_id VARCHAR(255) NOT NULL,
                                       node_type VARCHAR(50) NOT NULL,
                                       content TEXT NOT NULL,
                                       sort INTEGER NOT NULL,
                                       agent_id VARCHAR(255),
                                       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Add foreign key constraints
                                       CONSTRAINT fk_conversation_messages_conversation_id
                                           FOREIGN KEY (conversation_id) REFERENCES conversation_summaries(id) ON DELETE CASCADE,
                                       CONSTRAINT fk_conversation_messages_agent_id
                                           FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
);

-- Create indexes for conversation_messages table
CREATE INDEX ix_conversation_messages_id ON conversation_messages (id);
CREATE INDEX ix_conversation_messages_conversation_id ON conversation_messages (conversation_id);
CREATE INDEX ix_conversation_messages_agent_id ON conversation_messages (agent_id);

-- Table: resources
CREATE TABLE resources (
                           id VARCHAR(255) NOT NULL PRIMARY KEY,
                           title VARCHAR(500) NOT NULL,
                           description TEXT,
                           file_name VARCHAR(500) NOT NULL,
                           file_size BIGINT NOT NULL,
                           file_type VARCHAR(50) NOT NULL,
                           file_path VARCHAR(1000) NOT NULL,
                           parsed_content TEXT NOT NULL,
                           created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for resources table
CREATE INDEX ix_resources_id ON resources (id);
CREATE INDEX ix_resources_file_type ON resources (file_type);

-- Create triggers for automatic updated_at timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversation_summaries_updated_at
    BEFORE UPDATE ON conversation_summaries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resources_updated_at
    BEFORE UPDATE ON resources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for table purposes:
COMMENT ON TABLE agents IS 'Store AI agent configurations and settings';
COMMENT ON TABLE conversation_summaries IS 'Store conversation metadata and titles';
COMMENT ON TABLE conversation_messages IS 'Store individual messages within conversations';
COMMENT ON TABLE resources IS 'Store uploaded files and their parsed content';

-- Column comments
COMMENT ON COLUMN agents.category IS 'Agent category: analysis, validation, generation, optimization';
COMMENT ON COLUMN conversation_messages.node_type IS 'Message type: query, answer, log';
COMMENT ON COLUMN resources.file_type IS 'File type: pdf, md, text';