package cn.iocoder.boot.server.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 健康检查控制器
 *
 * @author backend-team
 */
@Slf4j
@RestController
@RequestMapping("/api")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "UP");
        result.put("timestamp", LocalDateTime.now());
        result.put("service", "backend-server");
        result.put("version", "0.0.1-SNAPSHOT");
        
        log.info("Health check requested");
        return result;
    }

    @GetMapping("/info")
    public Map<String, Object> info() {
        Map<String, Object> result = new HashMap<>();
        result.put("application", "Backend Server");
        result.put("description", "后端微服务架构主启动模块");
        result.put("modules", new String[]{"workflow", "server"});
        result.put("framework", "Spring Boot 3.5.0");
        
        return result;
    }
} 