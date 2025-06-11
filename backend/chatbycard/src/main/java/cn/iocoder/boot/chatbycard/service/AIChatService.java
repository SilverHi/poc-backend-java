package cn.iocoder.boot.chatbycard.service;

import cn.iocoder.boot.chatbycard.dto.AiChatRequest;
import cn.iocoder.boot.chatbycard.dto.AiChatResponse;
import cn.iocoder.boot.chatbycard.dto.AgentTestRequest;
import reactor.core.publisher.Flux;

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

    /**
     * 处理AI聊天流式请求
     *
     * @param request 聊天请求
     * @return 流式响应，每个字符串片段经过自定义处理
     */
    Flux<String> chatStream(AiChatRequest request);

    /**
     * Agent临时测试聊天
     *
     * @param request Agent测试请求
     * @return AI聊天响应
     */
    AiChatResponse testAgent(AgentTestRequest request);

    /**
     * Agent临时测试流式聊天
     *
     * @param request Agent测试请求
     * @return 流式响应
     */
    Flux<String> testAgentStream(AgentTestRequest request);
} 