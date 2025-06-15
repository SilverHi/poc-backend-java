package cn.iocoder.boot.chatbycard.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

/**
 * 提示词优化响应DTO
 *
 * @author backend-team
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PromptOptimizeResponse {

    /**
     * 优化后的提示词内容
     */
    private String optimizedPrompt;

    /**
     * 原始提示词字符数
     */
    private Integer originalCharacterCount;

    /**
     * 优化后提示词字符数
     */
    private Integer optimizedCharacterCount;

    /**
     * 处理时间（毫秒）
     */
    private Long processingTimeMs;

    /**
     * 使用的AI模型
     */
    private String modelUsed;
} 