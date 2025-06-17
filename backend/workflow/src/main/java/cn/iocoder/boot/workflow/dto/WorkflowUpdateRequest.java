package cn.iocoder.boot.workflow.dto;

import lombok.Data;
import jakarta.validation.constraints.Size;

/**
 * 工作流更新请求
 *
 * @author workflow-team
 */
@Data
public class WorkflowUpdateRequest {

    @Size(max = 255, message = "工作流名称长度不能超过255个字符")
    private String name;

    @Size(max = 1000, message = "工作流描述长度不能超过1000个字符")
    private String description;

    private String config;

    private String status;
} 