package cn.iocoder.boot.chatbycard.service.impl;

import cn.iocoder.boot.chatbycard.dto.AgentDTO;
import cn.iocoder.boot.chatbycard.dto.AiChatRequest;
import cn.iocoder.boot.chatbycard.dto.AiChatResponse;
import cn.iocoder.boot.chatbycard.service.AIChatService;
import cn.iocoder.boot.chatbycard.service.AgentService;
import cn.iocoder.boot.chatbycard.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.ai.openai.OpenAiChatOptions;
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