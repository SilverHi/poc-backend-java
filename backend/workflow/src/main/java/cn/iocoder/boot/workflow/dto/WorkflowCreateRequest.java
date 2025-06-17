package cn.iocoder.boot.workflow.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 工作流创建请求
 *
 * @author workflow-team
 */
@Data
public class WorkflowCreateRequest {

    @NotBlank(message = "工作流名称不能为空")
    @Size(max = 255, message = "工作流名称长度不能超过255个字符")
    private String name;

    @Size(max = 1000, message = "工作流描述长度不能超过1000个字符")
    private String description;

    @NotBlank(message = "工作流配置不能为空")
    private String config;
} 