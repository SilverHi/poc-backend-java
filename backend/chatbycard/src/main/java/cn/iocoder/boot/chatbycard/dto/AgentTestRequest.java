package cn.iocoder.boot.chatbycard.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;

/**
 * Agent临时测试请求数据传输对象
 *
 * @author backend-team
 */
@Data
public class AgentTestRequest {

    /**
     * 模型名称
     */
    @NotBlank(message = "Model name cannot be empty")
    private String modelName;

    /**
     * 系统提示词
     */
    @NotBlank(message = "System prompt cannot be empty")
    @Size(max = 5000, message = "System prompt cannot exceed 5000 characters")
    private String systemPrompt;

    /**
     * 温度参数（0.0-2.0）
     */
    @NotNull(message = "Temperature cannot be null")
    @DecimalMin(value = "0.0", message = "Temperature must be between 0.0 and 2.0")
    @DecimalMax(value = "2.0", message = "Temperature must be between 0.0 and 2.0")
    private Double temperature;

    /**
     * 最大Token数
     */
    @NotNull(message = "Max tokens cannot be null")
    @Min(value = 1, message = "Max tokens must be at least 1")
    @Max(value = 8192, message = "Max tokens cannot exceed 8192")
    private Integer maxTokens;

    /**
     * 用户输入内容
     */
    @NotBlank(message = "User input cannot be empty")
    @Size(max = 10000, message = "User input cannot exceed 10000 characters")
    private String userInput;

} 