package cn.iocoder.boot.chatbycard.controller;

import cn.iocoder.boot.chatbycard.dto.AiChatRequest;
import cn.iocoder.boot.chatbycard.dto.AiChatResponse;
import cn.iocoder.boot.chatbycard.dto.AgentTestRequest;
import cn.iocoder.boot.chatbycard.dto.ApiResponse;
import cn.iocoder.boot.chatbycard.dto.PromptOptimizeRequest;
import cn.iocoder.boot.chatbycard.dto.PromptOptimizeResponse;
import cn.iocoder.boot.chatbycard.service.AIChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;
import reactor.core.publisher.Flux;

import jakarta.validation.Valid;

/**
 * AI聊天控制器
 *
 * @author backend-team
 */
@Slf4j
@RestController
@RequestMapping("/api/chatbycard")
@RequiredArgsConstructor
public class AiChatController {

    private final AIChatService aiChatService;

    /**
     * AI聊天接口
     */
    @PostMapping("/chat/completions")
    public ApiResponse<AiChatResponse> chat(@Valid @RequestBody AiChatRequest request) {
        log.info("接收到AI聊天请求，agentId: {}, documentIds: {}, userInput长度: {}", 
                request.getAgentId(), 
                request.getDocumentIds(), 
                request.getUserInput() != null ? request.getUserInput().length() : 0);
        
        try {
            // 验证请求参数
            if ((request.getUserInput() == null || request.getUserInput().trim().isEmpty()) 
                && (request.getDocumentIds() == null || request.getDocumentIds().isEmpty())
                && (request.getPreviousAiOutput() == null || request.getPreviousAiOutput().trim().isEmpty())) {
                return ApiResponse.error(400, "请求参数无效：用户输入、文档引用和上次对话内容不能全部为空");
            }
            
            AiChatResponse aiResponse = aiChatService.chat(request);
            
            log.info("AI聊天请求处理成功，返回内容长度: {}", aiResponse.getCharacterCount());
            return ApiResponse.success(aiResponse, "AI聊天处理成功");
            
        } catch (IllegalArgumentException e) {
            log.warn("AI聊天请求参数错误: {}", e.getMessage());
            return ApiResponse.error(400, "请求参数错误: " + e.getMessage());
        } catch (Exception e) {
            log.error("AI聊天请求处理失败: {}", e.getMessage(), e);
            return ApiResponse.error(500, "AI聊天处理失败: " + e.getMessage());
        }
    }

    /**
     * AI聊天流式SSE接口
     * 
     * @param request 聊天请求
     * @return 流式响应（SSE格式）
     */
    @PostMapping(value = "/chat/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chatStream(@Valid @RequestBody AiChatRequest request) {
        log.info("接收到AI聊天流式请求，agentId: {}, documentIds: {}, userInput长度: {}", 
                request.getAgentId(), 
                request.getDocumentIds(), 
                request.getUserInput() != null ? request.getUserInput().length() : 0);
        
        // 基础参数验证
        if ((request.getUserInput() == null || request.getUserInput().trim().isEmpty()) 
            && (request.getDocumentIds() == null || request.getDocumentIds().isEmpty())
            && (request.getPreviousAiOutput() == null || request.getPreviousAiOutput().trim().isEmpty())) {
            
            return Flux.just("data: " + createErrorEventData("请求参数无效：用户输入、文档引用和上次对话内容不能全部为空") + "\n\n");
        }

        return aiChatService.chatStream(request)
                .map(content -> {
                    // =====================================================
                    // 🔥 SSE格式化处理区域 🔥
                    // =====================================================
                    // 
                    // 在这里你可以进一步处理SSE的格式
                    // content 已经是经过你自定义处理的内容
                    // 
                    // SSE格式说明：
                    // - 每行以 "data: " 开头
                    // - 以 "\n\n" 结尾表示一个事件结束
                    // - 可以添加事件类型：如 "event: message\n"
                    // - 可以添加ID：如 "id: 123\n"
                    // 
                    // 你可以在这里添加：
                    // 1. 事件类型标识
                    // 2. 消息ID生成
                    // 3. 特殊格式包装
                    // 4. 状态信息添加
                    // 
                    String formattedData = formatSSEData(content);
                    log.debug("SSE数据格式化: {} -> {}", content, formattedData);
                    return formattedData;
                    // =====================================================
                })
                .filter(data -> data != null && !data.isEmpty()) // 过滤空数据
                .concatWith(Flux.just("data: [DONE]\n\n")) // 发送结束标记
                .onErrorResume(error -> {
                    log.error("流式聊天处理出错: {}", error.getMessage(), error);
                    return Flux.just("data: " + createErrorEventData("流式聊天处理失败：" + error.getMessage()) + "\n\n");
                });
    }

    /**
     * 🔥 SSE数据格式化方法 🔥
     * 
     * 在这个方法中格式化SSE事件数据
     * 
     * @param content 处理后的内容
     * @return SSE格式的数据
     */
    private String formatSSEData(String content) {
        // =====================================================
        // 🔥 在这里自定义SSE数据格式 🔥
        // =====================================================
        
        // 防止空内容
        if (content == null || content.isEmpty()) {
            return "";
        }
        
        // 转义换行符，确保SSE格式正确
        String escapedContent = content.replace("\n", "\\n").replace("\r", "\\r");
        
        // 目前使用基础的SSE格式，你可以根据需求自定义
        // 
        // 你可以实现以下格式：
        // 1. 简单文本：data: content\n\n
        // 2. JSON格式：data: {"type":"message","content":"..."}\n\n  
        // 3. 带事件类型：event: message\ndata: content\n\n
        // 4. 带ID和时间戳：id: 123\ndata: {"timestamp":..., "content":"..."}\n\n
        
        // 当前实现（修复格式问题）：
        return "data: " + escapedContent + "\n\n";
        
        // JSON格式示例（你可以启用）：
        // try {
        //     Map<String, Object> eventData = new HashMap<>();
        //     eventData.put("type", "message");
        //     eventData.put("content", escapedContent);
        //     eventData.put("timestamp", System.currentTimeMillis());
        //     
        //     ObjectMapper mapper = new ObjectMapper();
        //     return "data: " + mapper.writeValueAsString(eventData) + "\n\n";
        // } catch (Exception e) {
        //     return "data: " + escapedContent + "\n\n";
        // }
    }

    /**
     * 创建错误事件数据
     */
    private String createErrorEventData(String errorMessage) {
        // 你可以根据需要自定义错误格式
        return "{\"error\":\"" + errorMessage.replace("\"", "\\\"") + "\"}";
    }

    /**
     * 健康检查接口
     */
    @GetMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.success("AI聊天服务运行正常", "服务状态正常");
    }

    /**
     * Agent临时测试接口
     */
    @PostMapping("/agent/test")
    public ApiResponse<AiChatResponse> testAgent(@Valid @RequestBody AgentTestRequest request) {
        log.info("接收到Agent临时测试请求，模型: {}, 温度: {}, userInput长度: {}", 
                request.getModelName(), 
                request.getTemperature(), 
                request.getUserInput() != null ? request.getUserInput().length() : 0);
        
        try {
            AiChatResponse aiResponse = aiChatService.testAgent(request);
            
            log.info("Agent临时测试请求处理成功，返回内容长度: {}", aiResponse.getCharacterCount());
            return ApiResponse.success(aiResponse, "Agent临时测试处理成功");
            
        } catch (IllegalArgumentException e) {
            log.warn("Agent临时测试请求参数错误: {}", e.getMessage());
            return ApiResponse.error(400, "Request parameter error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Agent临时测试请求处理失败: {}", e.getMessage(), e);
            return ApiResponse.error(500, "Agent临时测试处理失败: " + e.getMessage());
        }
    }

    /**
     * Agent临时测试流式SSE接口
     */
    @PostMapping(value = "/agent/test/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> testAgentStream(@Valid @RequestBody AgentTestRequest request) {
        log.info("接收到Agent临时测试流式请求，模型: {}, 温度: {}, userInput长度: {}", 
                request.getModelName(), 
                request.getTemperature(), 
                request.getUserInput() != null ? request.getUserInput().length() : 0);

        return aiChatService.testAgentStream(request)
                .map(content -> {
                    // 对测试接口使用简单的SSE格式
                    String formattedData = formatSSEData(content);
                    log.debug("测试SSE数据格式化: {} -> {}", content, formattedData);
                    return formattedData;
                })
                .filter(data -> data != null && !data.isEmpty())
                .concatWith(Flux.just("data: [DONE]\n\n"))
                .onErrorResume(error -> {
                    log.error("Agent临时测试流式处理出错: {}", error.getMessage(), error);
                    return Flux.just("data: " + createErrorEventData("Agent临时测试流式处理失败：" + error.getMessage()) + "\n\n");
                });
    }

    /**
     * 提示词优化接口 - 转换为System Prompt格式
     */
    @PostMapping("/prompt/optimize")
    public ApiResponse<PromptOptimizeResponse> optimizePrompt(@Valid @RequestBody PromptOptimizeRequest request) {
        log.info("Received prompt optimization request, original prompt length: {}", 
                request.getOriginalPrompt() != null ? request.getOriginalPrompt().length() : 0);
        
        try {
            // 验证请求参数
            if (request.getOriginalPrompt() == null || request.getOriginalPrompt().trim().isEmpty()) {
                return ApiResponse.error(400, "Original prompt cannot be empty");
            }
            
            PromptOptimizeResponse response = aiChatService.optimizePrompt(request);
            
            log.info("Prompt optimization completed successfully, optimized length: {}, processing time: {}ms", 
                    response.getOptimizedCharacterCount(), 
                    response.getProcessingTimeMs());
            return ApiResponse.success(response, "Prompt optimization completed successfully");
            
        } catch (IllegalArgumentException e) {
            log.warn("Prompt optimization request parameter error: {}", e.getMessage());
            return ApiResponse.error(400, "Request parameter error: " + e.getMessage());
        } catch (Exception e) {
            log.error("Prompt optimization failed: {}", e.getMessage(), e);
            return ApiResponse.error(500, "Prompt optimization failed: " + e.getMessage());
        }
    }
} 