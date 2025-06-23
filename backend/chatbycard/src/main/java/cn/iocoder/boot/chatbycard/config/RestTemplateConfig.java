package cn.iocoder.boot.chatbycard.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;

/**
 * RestTemplate配置
 *
 * @author backend-team
 */
@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        // 设置连接超时时间为10分钟 (因为外部API可能需要2-6分钟响应时间)
        factory.setConnectTimeout(10 * 60 * 1000);
        // 设置读取超时时间为10分钟
        factory.setReadTimeout(10 * 60 * 1000);
        
        return new RestTemplate(factory);
    }
} 