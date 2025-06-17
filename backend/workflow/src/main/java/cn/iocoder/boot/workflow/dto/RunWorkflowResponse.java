package cn.iocoder.boot.workflow.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

/**
 * 运行工作流响应
 *
 * @author workflow-team
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RunWorkflowResponse {

    private int code;

    private String message;

    private String data;

    public static RunWorkflowResponse success(String data) {
        return new RunWorkflowResponse(200, "", data);
    }

    public static RunWorkflowResponse error(String message) {
        return new RunWorkflowResponse(500, message, "");
    }
} 