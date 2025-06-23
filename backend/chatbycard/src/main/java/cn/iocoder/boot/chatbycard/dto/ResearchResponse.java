package cn.iocoder.boot.chatbycard.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

/**
 * 研究查询响应
 *
 * @author backend-team
 */
@Data
public class ResearchResponse {

    /**
     * HTML格式的回答
     */
    private String result;

    /**
     * 不带格式的原始回答
     */
    private String rawResult;

    /**
     * 消耗的token数
     */
    private Integer consumeToken;

    /**
     * metadata信息
     */
    private Map<String, Object> metadata;

    /**
     * 相关的文档片段原文
     */
    private List<String> chunk;
} 