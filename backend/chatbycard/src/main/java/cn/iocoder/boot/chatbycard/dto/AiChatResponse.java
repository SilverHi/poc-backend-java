package cn.iocoder.boot.chatbycard.dto;

import lombok.Data;

import java.time.OffsetDateTime;

/**
 * AI聊天响应数据传输对象
 *
 * @author backend-team
 */
@Data
public class AiChatResponse {

    /**
     * AI回复内容
     */
    private String content;

    /**
     * 使用的模型名称
     */
    private String modelName;

    /**
     * 使用的Agent名称（如果有）
     */
    private String agentName;

    /**
     * 处理时间戳
     */
    private OffsetDateTime timestamp;

    /**
     * 字符数统计
     */
    private Integer characterCount;

    public AiChatResponse() {
        this.timestamp = OffsetDateTime.now();
    }

    public AiChatResponse(String content, String modelName) {
        this();
        this.content = content;
        this.modelName = modelName;
        this.characterCount = content != null ? content.length() : 0;
    }

    public AiChatResponse(String content, String modelName, String agentName) {
        this(content, modelName);
        this.agentName = agentName;
    }
} 