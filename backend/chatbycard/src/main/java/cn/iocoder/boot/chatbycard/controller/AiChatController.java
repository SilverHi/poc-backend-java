package cn.iocoder.boot.chatbycard.controller;

import cn.iocoder.boot.chatbycard.dto.AiChatRequest;
import cn.iocoder.boot.chatbycard.dto.AiChatResponse;
import cn.iocoder.boot.chatbycard.dto.ApiResponse;
import cn.iocoder.boot.chatbycard.service.AIChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

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
     * 健康检查接口
     */
    @GetMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.success("AI聊天服务运行正常", "服务状态正常");
    }
} 