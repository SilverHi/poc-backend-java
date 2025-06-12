package cn.iocoder.boot.chatbycard.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 工作流数据传输对象
 *
 * @author backend-team
 */
@Data
public class WorkflowDTO {

    /**
     * 工作流ID
     */
    private String id;

    /**
     * 工作流名称
     */
    private String name;

    /**
     * 工作流类型
     */
    private String type;

    /**
     * 工作流图标
     */
    private String icon;

    /**
     * 工作流描述
     */
    private String description;

    /**
     * 关联的代理
     */
    private List<String> agents;

    /**
     * 预估执行时间
     */
    @JsonProperty("estimatedTime")
    private String estimatedTime;

    /**
     * 分类
     */
    private String category;

    /**
     * 调用次数
     */
    @JsonProperty("callCount")
    private Integer callCount;

    /**
     * 状态
     */
    private String status;

    /**
     * 配置信息（原始配置）
     */
    private String config;

    /**
     * 节点列表
     */
    private List<WorkflowNode> nodes;

    /**
     * 变量列表
     */
    private List<WorkflowVariable> vars;

    /**
     * 创建时间
     */
    @JsonProperty("created_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @JsonProperty("updated_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    /**
     * 工作流节点
     */
    @Data
    public static class WorkflowNode {
        /**
         * 节点ID
         */
        private String id;

        /**
         * 节点名称
         */
        private String name;

        /**
         * 用户提示
         */
        @JsonProperty("user_prompt")
        private String userPrompt;
    }

    /**
     * 工作流变量
     */
    @Data
    public static class WorkflowVariable {
        /**
         * 变量名
         */
        private String name;

        /**
         * 变量描述
         */
        private String description;
    }
} 