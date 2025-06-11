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
     * 工作流步骤
     */
    private List<String> steps;

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
} 