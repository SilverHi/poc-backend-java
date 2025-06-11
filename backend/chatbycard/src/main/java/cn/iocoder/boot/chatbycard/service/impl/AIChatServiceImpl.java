package cn.iocoder.boot.chatbycard.service.impl;

import cn.iocoder.boot.chatbycard.dto.AgentDTO;
import cn.iocoder.boot.chatbycard.dto.AiChatRequest;
import cn.iocoder.boot.chatbycard.dto.AiChatResponse;
import cn.iocoder.boot.chatbycard.dto.AgentTestRequest;
import cn.iocoder.boot.chatbycard.service.AIChatService;
import cn.iocoder.boot.chatbycard.service.AgentService;
import cn.iocoder.boot.chatbycard.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.StreamingChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.openai.OpenAiChatOptions;
import reactor.core.publisher.Flux;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * AI聊天服务实现类
 *
 * @author backend-team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIChatServiceImpl implements AIChatService {

    private final ChatModel chatModel;
    private final StreamingChatModel streamingChatModel;
    private final AgentService agentService;
    private final DocumentService documentService;

    // 默认配置
    private static final String DEFAULT_MODEL = "gpt-4o-mini";
    private static final BigDecimal DEFAULT_TEMPERATURE = BigDecimal.valueOf(0.7);
    private static final Integer DEFAULT_MAX_TOKENS = 2048;

    @Override
    public AiChatResponse chat(AiChatRequest request) {
        log.info("开始处理AI聊天请求，agentId: {}, documentIds: {}", 
                request.getAgentId(), request.getDocumentIds());

        try {
            // 1. 获取Agent配置信息
            AgentConfig agentConfig = getAgentConfig(request.getAgentId());
            
            // 2. 获取文档内容
            String documentContent = getDocumentContent(request.getDocumentIds());
            
            // 3. 构建用户提示词
            String userPrompt = buildUserPrompt(
                    documentContent, 
                    request.getUserInput(), 
                    request.getPreviousAiOutput()
            );
            
            // 4. 构建完整的提示词
            String fullPrompt = buildFullPrompt(agentConfig.getSystemPrompt(), userPrompt);
            
            // 5. 配置OpenAI选项
            OpenAiChatOptions chatOptions = OpenAiChatOptions.builder()
                    .model(agentConfig.getModelName())
                    .temperature(agentConfig.getTemperature().doubleValue())
                    .maxTokens(agentConfig.getMaxTokens())
                    .build();
            
            // 6. 创建提示词并调用AI
            Prompt prompt = new Prompt(fullPrompt, chatOptions);
            log.info("调用AI聊天模型，使用模型: {}, 温度: {}, 最大Token数: {}",
                    agentConfig.getModelName(), agentConfig.getTemperature(), agentConfig.getMaxTokens());
            log.info("完整提示词内容: {}", fullPrompt);
            ChatResponse response = chatModel.call(prompt);
            
            String aiResponseContent = response.getResults().get(0).getOutput().getText();
            log.info("AI聊天请求处理成功，返回内容长度: {}", aiResponseContent.length());
            
            // 7. 创建响应对象
            return new AiChatResponse(aiResponseContent, agentConfig.getModelName(), agentConfig.getAgentName());
            
        } catch (Exception e) {
            log.error("AI聊天请求处理失败: {}", e.getMessage(), e);
            throw new RuntimeException("AI聊天处理失败: " + e.getMessage());
        }
    }

    @Override
    public Flux<String> chatStream(AiChatRequest request) {
        log.info("开始处理AI聊天流式请求，agentId: {}, documentIds: {}", 
                request.getAgentId(), request.getDocumentIds());

        try {
            // 1. 获取Agent配置信息（与普通接口相同逻辑）
            AgentConfig agentConfig = getAgentConfig(request.getAgentId());
            
            // 2. 获取文档内容（与普通接口相同逻辑）
            String documentContent = getDocumentContent(request.getDocumentIds());
            
            // 3. 构建用户提示词（与普通接口相同逻辑）
            String userPrompt = buildUserPrompt(
                    documentContent, 
                    request.getUserInput(), 
                    request.getPreviousAiOutput()
            );
            
            // 4. 构建完整的提示词（与普通接口相同逻辑）
            String fullPrompt = buildFullPrompt(agentConfig.getSystemPrompt(), userPrompt);
            
            // 5. 配置OpenAI选项（与普通接口相同逻辑）
            OpenAiChatOptions chatOptions = OpenAiChatOptions.builder()
                    .model(agentConfig.getModelName())
                    .temperature(agentConfig.getTemperature().doubleValue())
                    .maxTokens(agentConfig.getMaxTokens())
                    .build();
            
            // 6. 创建提示词并调用AI流式接口
            Prompt prompt = new Prompt(fullPrompt, chatOptions);
            
            return streamingChatModel.stream(prompt)
                    .flatMap(chatResponse -> { // 使用flatMap来更好地处理可能的空值
                        try {
                            // 从流式响应中提取内容，增加更多安全检查
                            if (chatResponse != null && 
                                chatResponse.getResults() != null && 
                                !chatResponse.getResults().isEmpty() &&
                                chatResponse.getResults().get(0) != null &&
                                chatResponse.getResults().get(0).getOutput() != null) {
                                
                                String originalContent = chatResponse.getResults().get(0).getOutput().getText();
                                
                                // 日志记录原始内容
                                log.debug("收到流式内容片段: [{}]", originalContent);
                                
                                // =====================================================
                                // 🔥 在这里添加你的自定义处理逻辑 🔥
                                // =====================================================
                                // 
                                // 参数说明：
                                // - originalContent: OpenAI返回的原始流式内容片段
                                // - request: 原始请求对象，包含agentId、documentIds、userInput等
                                // - agentConfig: Agent配置信息，包含modelName、agentName等
                                // 
                                // 你可以在这里实现以下逻辑：
                                // 1. 内容格式转换：将originalContent转换为特定格式
                                // 2. 内容过滤：过滤敏感词或不需要的内容
                                // 3. 内容增强：添加额外的标记、格式化等
                                // 4. 状态追踪：记录处理状态、统计信息等
                                // 5. 业务逻辑：根据业务需求对内容进行处理
                                // 
                                String processedContent = processStreamContent(originalContent, request, agentConfig);
                                
                                // 确保处理后的内容不为null且不为空才返回
                                if (processedContent != null && !processedContent.isEmpty()) {
                                    return Flux.just(processedContent);
                                } else {
                                    log.debug("处理后内容为空，跳过此片段");
                                    return Flux.empty(); // 返回空流而不是null
                                }
                                // =====================================================
                            } else {
                                log.debug("收到空的chatResponse，跳过此片段");
                                return Flux.empty(); // 返回空流
                            }
                        } catch (Exception e) {
                            log.error("处理流式响应时出错: {}", e.getMessage(), e);
                            return Flux.empty(); // 出错时返回空流
                        }
                    })
                    .doOnComplete(() -> log.info("AI聊天流式请求处理完成"))
                    .onErrorMap(e -> {
                        log.error("AI聊天流式请求处理失败: {}", e.getMessage(), e);
                        return new RuntimeException("AI聊天流式处理失败: " + e.getMessage());
                    });
            
        } catch (Exception e) {
            log.error("AI聊天流式请求初始化失败: {}", e.getMessage(), e);
            return Flux.error(new RuntimeException("AI聊天流式处理初始化失败: " + e.getMessage()));
        }
    }

    /**
     * 🔥 自定义流式内容处理方法 🔥
     * 
     * 在这个方法中实现你的自定义处理逻辑
     * 
     * @param originalContent OpenAI返回的原始内容片段
     * @param request 原始请求对象
     * @param agentConfig Agent配置信息
     * @return 处理后的内容，永远不会返回null
     */
    private String processStreamContent(String originalContent, AiChatRequest request, AgentConfig agentConfig) {
        // =====================================================
        // 🔥 在这里实现你的自定义处理逻辑 🔥
        // =====================================================
        
        // 确保输入不为null，如果为null则返回空字符串
        if (originalContent == null) {
            log.debug("收到null内容，跳过处理");
            return ""; // 返回空字符串而不是null
        }
        
        // 如果内容为空，返回空字符串
        if (originalContent.isEmpty()) {
            log.debug("收到空内容，跳过处理");
            return "";
        }
        
        try {
            // 目前直接透传，你可以在这里添加自己的处理逻辑
            // 例如：
            // 1. 格式化处理
            // 2. 添加前缀/后缀
            // 3. 内容过滤
            // 4. 特殊标记处理
            // 5. 业务相关的转换
            
            // 示例处理（当前仅作占位符）：
            String processedContent = originalContent; // 直接透传
            
            // 你可以替换为类似这样的逻辑：
            // if (StringUtils.hasText(originalContent)) {
            //     // 你的处理逻辑
            //     processedContent = doYourCustomProcessing(originalContent, request, agentConfig);
            // }
            
            // 确保返回值不为null
            return processedContent != null ? processedContent : "";
            
        } catch (Exception e) {
            log.error("处理流式内容时出错: {}", e.getMessage(), e);
            // 即使出错也返回原始内容，确保不返回null
            return originalContent != null ? originalContent : "";
        }
    }

    /**
     * 获取Agent配置信息
     */
    private AgentConfig getAgentConfig(String agentId) {
        if (StringUtils.hasText(agentId)) {
            try {
                AgentDTO agent = agentService.getAgentById(agentId);
                if (agent != null) {
                    log.info("使用Agent配置，名称: {}, 模型: {}", agent.getName(), agent.getModelName());
                    return AgentConfig.builder()
                            .agentName(agent.getName())
                            .modelName(agent.getModelName())
                            .systemPrompt(agent.getSystemPrompt())
                            .temperature(agent.getTemperature() != null ? agent.getTemperature() : DEFAULT_TEMPERATURE)
                            .maxTokens(agent.getMaxTokens() != null ? agent.getMaxTokens() : DEFAULT_MAX_TOKENS)
                            .build();
                }
            } catch (Exception e) {
                log.warn("获取Agent信息失败，使用默认配置，agentId: {}, 错误: {}", agentId, e.getMessage());
            }
        }
        
        // 使用默认配置
        log.info("使用默认配置，模型: {}", DEFAULT_MODEL);
        return AgentConfig.builder()
                .agentName(null)
                .modelName(DEFAULT_MODEL)
                .systemPrompt("")
                .temperature(DEFAULT_TEMPERATURE)
                .maxTokens(DEFAULT_MAX_TOKENS)
                .build();
    }

    /**
     * 获取文档内容
     */
    private String getDocumentContent(List<String> documentIds) {
        if (CollectionUtils.isEmpty(documentIds)) {
            return "";
        }

        try {
            List<String> documentContents = documentIds.stream()
                    .map(documentService::getDocumentContent)
                    .filter(StringUtils::hasText)
                    .collect(Collectors.toList());

            if (documentContents.isEmpty()) {
                return "";
            }

            String content = String.join("\n\n--- 文档分隔符 ---\n\n", documentContents);
            log.info("获取到 {} 个文档的内容，总字符数: {}", documentContents.size(), content.length());
            return content;
            
        } catch (Exception e) {
            log.error("获取文档内容失败: {}", e.getMessage(), e);
            return "";
        }
    }

    /**
     * 构建用户提示词
     */
    private String buildUserPrompt(String documentContent, String userInput, String previousAiOutput) {
        StringBuilder promptBuilder = new StringBuilder();

        // 添加文档内容
        if (StringUtils.hasText(documentContent)) {
            promptBuilder.append("## 参考文档内容：\n\n")
                    .append(documentContent)
                    .append("\n\n");
        }

        // 添加上次AI回复（用于对话延续）
        if (StringUtils.hasText(previousAiOutput)) {
            promptBuilder.append("## 上次对话内容：\n\n")
                    .append(previousAiOutput)
                    .append("\n\n");
        }

        // 添加用户输入
        if (StringUtils.hasText(userInput)) {
            promptBuilder.append("## 用户问题：\n\n")
                    .append(userInput);
        }

        return promptBuilder.toString();
    }

    /**
     * 构建完整的提示词
     */
    private String buildFullPrompt(String systemPrompt, String userPrompt) {
        if (StringUtils.hasText(systemPrompt)) {
            return systemPrompt + "\n\n" + userPrompt;
        }
        return userPrompt;
    }

    @Override
    public AiChatResponse testAgent(AgentTestRequest request) {
        log.info("开始处理Agent临时测试请求，模型: {}, 温度: {}, maxTokens: {}", 
                request.getModelName(), request.getTemperature(), request.getMaxTokens());

        try {
            // 1. 构建Agent配置（直接使用请求参数）
            AgentConfig agentConfig = AgentConfig.builder()
                    .agentName("Test Agent")
                    .modelName(request.getModelName())
                    .systemPrompt(request.getSystemPrompt())
                    .temperature(BigDecimal.valueOf(request.getTemperature()))
                    .maxTokens(request.getMaxTokens())
                    .build();
            
            // 2. 构建完整的提示词（系统提示词 + 用户输入）
            String fullPrompt = buildFullPrompt(agentConfig.getSystemPrompt(), request.getUserInput());
            
            // 3. 配置OpenAI选项
            OpenAiChatOptions chatOptions = OpenAiChatOptions.builder()
                    .model(agentConfig.getModelName())
                    .temperature(agentConfig.getTemperature().doubleValue())
                    .maxTokens(agentConfig.getMaxTokens())
                    .build();
            
            // 4. 创建提示词并调用AI
            Prompt prompt = new Prompt(fullPrompt, chatOptions);
            ChatResponse response = chatModel.call(prompt);
            
            String aiResponseContent = response.getResults().get(0).getOutput().getText();
            log.info("Agent临时测试请求处理成功，返回内容长度: {}", aiResponseContent.length());
            
            // 5. 创建响应对象
            return new AiChatResponse(aiResponseContent, agentConfig.getModelName(), agentConfig.getAgentName());
            
        } catch (Exception e) {
            log.error("Agent临时测试请求处理失败: {}", e.getMessage(), e);
            throw new RuntimeException("Agent临时测试处理失败: " + e.getMessage());
        }
    }

    @Override
    public Flux<String> testAgentStream(AgentTestRequest request) {
        log.info("开始处理Agent临时测试流式请求，模型: {}, 温度: {}, maxTokens: {}", 
                request.getModelName(), request.getTemperature(), request.getMaxTokens());

        try {
            // 1. 构建Agent配置（直接使用请求参数）
            AgentConfig agentConfig = AgentConfig.builder()
                    .agentName("Test Agent")
                    .modelName(request.getModelName())
                    .systemPrompt(request.getSystemPrompt())
                    .temperature(BigDecimal.valueOf(request.getTemperature()))
                    .maxTokens(request.getMaxTokens())
                    .build();
            
            // 2. 构建完整的提示词（系统提示词 + 用户输入）
            String fullPrompt = buildFullPrompt(agentConfig.getSystemPrompt(), request.getUserInput());
            
            // 3. 配置OpenAI选项
            OpenAiChatOptions chatOptions = OpenAiChatOptions.builder()
                    .model(agentConfig.getModelName())
                    .temperature(agentConfig.getTemperature().doubleValue())
                    .maxTokens(agentConfig.getMaxTokens())
                    .build();
            
            // 4. 创建提示词并调用AI流式接口
            Prompt prompt = new Prompt(fullPrompt, chatOptions);
            
            return streamingChatModel.stream(prompt)
                    .flatMap(chatResponse -> {
                        try {
                            if (chatResponse != null && 
                                chatResponse.getResults() != null && 
                                !chatResponse.getResults().isEmpty() &&
                                chatResponse.getResults().get(0) != null &&
                                chatResponse.getResults().get(0).getOutput() != null) {
                                
                                String originalContent = chatResponse.getResults().get(0).getOutput().getText();
                                log.debug("收到测试流式内容片段: [{}]", originalContent);
                                
                                // 对于临时测试，直接返回原始内容，不进行复杂处理
                                if (originalContent != null && !originalContent.isEmpty()) {
                                    return Flux.just(originalContent);
                                } else {
                                    return Flux.empty();
                                }
                            } else {
                                return Flux.empty();
                            }
                        } catch (Exception e) {
                            log.error("处理测试流式响应时出错: {}", e.getMessage(), e);
                            return Flux.empty();
                        }
                    })
                    .doOnComplete(() -> log.info("Agent临时测试流式请求处理完成"))
                    .onErrorMap(e -> {
                        log.error("Agent临时测试流式请求处理失败: {}", e.getMessage(), e);
                        return new RuntimeException("Agent临时测试流式处理失败: " + e.getMessage());
                    });
            
        } catch (Exception e) {
            log.error("Agent临时测试流式请求初始化失败: {}", e.getMessage(), e);
            return Flux.error(new RuntimeException("Agent临时测试流式处理初始化失败: " + e.getMessage()));
        }
    }

    /**
     * Agent配置类
     */
    private static class AgentConfig {
        private String agentName;
        private String modelName;
        private String systemPrompt;
        private BigDecimal temperature;
        private Integer maxTokens;

        public static AgentConfigBuilder builder() {
            return new AgentConfigBuilder();
        }

        public String getAgentName() { return agentName; }
        public String getModelName() { return modelName; }
        public String getSystemPrompt() { return systemPrompt; }
        public BigDecimal getTemperature() { return temperature; }
        public Integer getMaxTokens() { return maxTokens; }

        public static class AgentConfigBuilder {
            private String agentName;
            private String modelName;
            private String systemPrompt;
            private BigDecimal temperature;
            private Integer maxTokens;

            public AgentConfigBuilder agentName(String agentName) {
                this.agentName = agentName;
                return this;
            }

            public AgentConfigBuilder modelName(String modelName) {
                this.modelName = modelName;
                return this;
            }

            public AgentConfigBuilder systemPrompt(String systemPrompt) {
                this.systemPrompt = systemPrompt;
                return this;
            }

            public AgentConfigBuilder temperature(BigDecimal temperature) {
                this.temperature = temperature;
                return this;
            }

            public AgentConfigBuilder maxTokens(Integer maxTokens) {
                this.maxTokens = maxTokens;
                return this;
            }

            public AgentConfig build() {
                AgentConfig config = new AgentConfig();
                config.agentName = this.agentName;
                config.modelName = this.modelName;
                config.systemPrompt = this.systemPrompt;
                config.temperature = this.temperature;
                config.maxTokens = this.maxTokens;
                return config;
            }
        }
    }
} 