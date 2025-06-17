package cn.iocoder.boot.chatbycard.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 提示词优化请求DTO
 *
 * @author backend-team
 */
@Data
public class PromptOptimizeRequest {

    /**
     * 原始提示词内容
     */
    @NotBlank(message = "原始提示词不能为空")
    @Size(max = 10000, message = "提示词长度不能超过10000字符")
    private String originalPrompt;

    /**
     * 优化目标（可选）
     * 例如：更清晰、更专业、更友好等
     */
    @Size(max = 500, message = "优化目标描述长度不能超过500字符")
    private String optimizationGoal;

    /**
     * 期望的风格（可选）
     * 例如：正式、友好、专业、创意等
     */
    @Size(max = 100, message = "风格描述长度不能超过100字符")
    private String preferredStyle;
} 