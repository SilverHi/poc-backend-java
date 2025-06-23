package cn.iocoder.boot.chatbycard.service.impl;

import cn.iocoder.boot.chatbycard.dto.ResearchRequest;
import cn.iocoder.boot.chatbycard.dto.ResearchResponse;
import cn.iocoder.boot.chatbycard.service.ResearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;

/**
 * 研究查询服务实现类
 *
 * @author backend-team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ResearchServiceImpl implements ResearchService {

    private final RestTemplate restTemplate;

    @Value("${external.research.api.url:http://localhost:8000}")
    private String researchApiUrl;

    @Override
    public ResearchResponse research(ResearchRequest request) {
        log.info("开始调用外部研究API，查询: {}, 思考深度: {}", request.getQuery(), request.getMaxNumber());
        
        try {
            // 验证maxNumber参数
            if (request.getMaxNumber() != 3 && request.getMaxNumber() != 6) {
                throw new IllegalArgumentException("思考深度只能是3或6");
            }
            
            // 构建请求头
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // 构建请求体 - 转换为外部API期望的格式
            ExternalResearchRequest externalRequest = new ExternalResearchRequest();
            externalRequest.setQuery(request.getQuery());
            externalRequest.setMax_number(request.getMaxNumber());
            
            HttpEntity<ExternalResearchRequest> entity = new HttpEntity<>(externalRequest, headers);
            
            // 调用外部API
            String url = researchApiUrl + "/research";
            log.info("调用外部研究API: {}", url);
            
            ResponseEntity<ExternalResearchResponse> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                entity,
                ExternalResearchResponse.class
            );
            
            if (response.getBody() == null) {
                throw new RuntimeException("外部API返回空响应");
            }
            
            // 转换响应格式
            ExternalResearchResponse externalResponse = response.getBody();
            ResearchResponse result = new ResearchResponse();
            result.setResult(externalResponse.getResult());
            result.setRawResult(externalResponse.getRaw_result());
            result.setConsumeToken(externalResponse.getConsume_token());
            result.setMetadata(externalResponse.getMetadata());
            result.setChunk(externalResponse.getChunk());
            
            log.info("外部研究API调用成功，消耗token: {}", result.getConsumeToken());
            return result;
            
        } catch (Exception e) {
            log.error("调用外部研究API失败: {}", e.getMessage(), e);
            throw new RuntimeException("研究查询失败: " + e.getMessage(), e);
        }
    }
    
    /**
     * 外部API请求格式
     */
    private static class ExternalResearchRequest {
        private String query;
        private Integer max_number;
        
        public String getQuery() { return query; }
        public void setQuery(String query) { this.query = query; }
        public Integer getMax_number() { return max_number; }
        public void setMax_number(Integer max_number) { this.max_number = max_number; }
    }
    
    /**
     * 外部API响应格式
     */
    private static class ExternalResearchResponse {
        private String result;
        private String raw_result;
        private Integer consume_token;
        private java.util.Map<String, Object> metadata;
        private java.util.List<String> chunk;
        
        public String getResult() { return result; }
        public void setResult(String result) { this.result = result; }
        public String getRaw_result() { return raw_result; }
        public void setRaw_result(String raw_result) { this.raw_result = raw_result; }
        public Integer getConsume_token() { return consume_token; }
        public void setConsume_token(Integer consume_token) { this.consume_token = consume_token; }
        public java.util.Map<String, Object> getMetadata() { return metadata; }
        public void setMetadata(java.util.Map<String, Object> metadata) { this.metadata = metadata; }
        public java.util.List<String> getChunk() { return chunk; }
        public void setChunk(java.util.List<String> chunk) { this.chunk = chunk; }
    }
} 