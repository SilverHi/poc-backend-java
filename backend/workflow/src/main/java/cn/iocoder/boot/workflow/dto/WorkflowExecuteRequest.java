package cn.iocoder.boot.workflow.dto;

import lombok.Data;
import java.util.Map;

/**
 * 工作流执行请求
 *
 * @author workflow-team
 */
@Data
public class WorkflowExecuteRequest {

    /**
     * 初始变量
     */
    private Map<String, Object> variables;
} 