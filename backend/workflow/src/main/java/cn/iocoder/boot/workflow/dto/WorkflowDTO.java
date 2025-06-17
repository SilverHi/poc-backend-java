package cn.iocoder.boot.workflow.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 工作流数据传输对象
 *
 * @author workflow-team
 */
@Data
public class WorkflowDTO {

    private Long id;

    private String name;

    private String description;

    private String config;

    private String status;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    // 扩展字段，用于详情接口
    private List<NodeInfo> nodes;

    private List<VariableInfo> vars;

    /**
     * 节点信息
     */
    @Data
    public static class NodeInfo {
        private String name;
        private String id;
        @JsonProperty("user_prompt")
        private String userPrompt;
    }

    /**
     * 变量信息
     */
    @Data
    public static class VariableInfo {
        private String name;
        private String description;
    }
} 