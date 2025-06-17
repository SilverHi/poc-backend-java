package cn.iocoder.boot.workflow.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;

/**
 * 运行工作流请求
 *
 * @author workflow-team
 */
@Data
public class RunWorkflowRequest {

    @NotBlank(message = "工作流ID不能为空")
    private String id;

    /**
     * 初始参数
     */
    private Map<String, Object> args;
} 