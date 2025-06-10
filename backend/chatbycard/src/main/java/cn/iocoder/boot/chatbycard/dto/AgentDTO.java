package cn.iocoder.boot.chatbycard.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * AI代理数据传输对象
 *
 * @author backend-team
 */
@Data
public class AgentDTO {

    /**
     * Agent ID
     */
    private String id;

    /**
     * Agent名称
     */
    private String name;

    /**
     * Agent介绍/描述
     */
    private String description;

    /**
     * Agent类型
     */
    private String type;

    /**
     * Agent图标
     */
    private String icon;

    /**
     * 使用的模型名称
     */
    private String modelName;

    /**
     * 系统提示词
     */
    private String systemPrompt;

    /**
     * 调用次数统计
     */
    private Long callCount;

    /**
     * 温度参数(0.0-2.0)
     */
    private BigDecimal temperature;

    /**
     * 最大输出token数
     */
    private Integer maxTokens;

    /**
     * 创建时间
     */
    private OffsetDateTime createTime;

    /**
     * 更新时间
     */
    private OffsetDateTime updateTime;
} 