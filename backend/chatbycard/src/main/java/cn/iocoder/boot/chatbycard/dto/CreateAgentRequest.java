package cn.iocoder.boot.chatbycard.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * 创建Agent请求数据传输对象
 *
 * @author backend-team
 */
@Data
public class CreateAgentRequest {

    /**
     * Agent名称
     */
    @NotBlank(message = "Agent name cannot be empty")
    @Size(max = 100, message = "Agent name cannot exceed 100 characters")
    private String name;

    /**
     * Agent描述
     */
    @NotBlank(message = "Agent description cannot be empty")
    @Size(max = 500, message = "Agent description cannot exceed 500 characters")
    private String description;

    /**
     * Agent类型
     */
    @NotBlank(message = "Agent type cannot be empty")
    private String type;

    /**
     * Agent图标
     */
    @NotBlank(message = "Agent icon cannot be empty")
    private String icon;

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
     * 工具列表
     */
    private List<String> tools;

    /**
     * 工作流列表
     */
    private List<String> workflows;

} 