package cn.iocoder.boot.chatbycard.service;

import cn.iocoder.boot.chatbycard.dto.AiChatRequest;
import cn.iocoder.boot.chatbycard.dto.AiChatResponse;

/**
 * AI聊天服务接口
 *
 * @author backend-team
 */
public interface AIChatService {

    /**
     * 处理AI聊天请求
     *
     * @param request 聊天请求
     * @return AI聊天响应
     */
    AiChatResponse chat(AiChatRequest request);
} 