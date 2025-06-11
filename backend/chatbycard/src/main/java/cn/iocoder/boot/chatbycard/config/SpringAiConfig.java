package cn.iocoder.boot.chatbycard.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spring AI 配置类
 * 
 * @author backend-team
 */
@Configuration
public class SpringAiConfig {

    /**
     * 配置 ChatClient
     * 使用 Spring AI 1.0.0-M6 版本的 API
     */
    @Bean
    public ChatClient chatClient(ChatModel chatModel) {
        return ChatClient.builder(chatModel)
                .defaultSystem("你是一个专业、友善的AI助手。请用简洁清晰的中文回答用户的问题。")
                .build();
    }
} 