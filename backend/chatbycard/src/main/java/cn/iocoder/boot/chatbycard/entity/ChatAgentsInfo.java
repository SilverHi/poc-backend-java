package cn.iocoder.boot.chatbycard.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * AI代理配置信息实体类
 *
 * @author backend-team
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("chat_agents_info")
public class ChatAgentsInfo {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * Agent名称
     */
    @TableField("name")
    private String name;

    /**
     * Agent介绍/描述
     */
    @TableField("description")
    private String description;

    /**
     * Agent类型
     */
    @TableField("type")
    private String type;

    /**
     * Agent图标
     */
    @TableField("icon")
    private String icon;

    /**
     * 使用的模型名称
     */
    @TableField("model_name")
    private String modelName;

    /**
     * 系统提示词
     */
    @TableField("system_prompt")
    private String systemPrompt;

    /**
     * 调用次数统计
     */
    @TableField("call_count")
    private Long callCount;

    /**
     * 温度参数(0.0-2.0)
     */
    @TableField("temperature")
    private BigDecimal temperature;

    /**
     * 最大输出token数
     */
    @TableField("max_tokens")
    private Integer maxTokens;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private OffsetDateTime createTime;

    /**
     * 更新时间
     */
    @TableField("update_time")
    private OffsetDateTime updateTime;
} 