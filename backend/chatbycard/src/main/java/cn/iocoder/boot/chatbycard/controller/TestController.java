package cn.iocoder.boot.chatbycard.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * ChatByCard测试控制器
 *
 * @author backend-team
 */
@Slf4j
@RestController
@RequestMapping("/api/chatbycard/test")
public class TestController {

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> result = new HashMap<>();
        result.put("module", "chatbycard");
        result.put("status", "running");
        result.put("description", "ChatByCard文档管理模块运行正常");
        result.put("timestamp", LocalDateTime.now());
        result.put("features", new String[]{"文档上传", "文档列表", "文档删除", "异步处理"});
        
        log.info("ChatByCard模块状态检查");
        return result;
    }
    
} 