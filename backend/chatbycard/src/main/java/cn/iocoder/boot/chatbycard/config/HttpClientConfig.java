package cn.iocoder.boot.chatbycard.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * HTTP客户端配置类
 *
 * @author backend-team
 */
@Slf4j
@Configuration
public class HttpClientConfig {

    /**
     * 配置RestTemplate
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(10))
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
    }

    /**
     * 配置ObjectMapper
     * 添加忽略未知属性配置以解决Spring AI 1.0.0-M6版本中OpenAI annotations字段问题
     */
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(com.fasterxml.jackson.databind.SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        // 解决Spring AI 1.0.0-M6版本中OpenAI annotations字段问题
        // 忽略未知属性，避免反序列化错误
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        
        log.info("ObjectMapper配置完成，已启用忽略未知属性以解决Spring AI兼容性问题");
        
        return mapper;
    }
} 