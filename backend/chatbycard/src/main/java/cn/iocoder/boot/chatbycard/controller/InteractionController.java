package cn.iocoder.boot.chatbycard.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * ChatByCard模块控制器
 *
 * @author backend-team
 */
@Slf4j
@RestController
@RequestMapping("/api/chatbycard")
public class InteractionController {

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> result = new HashMap<>();
        result.put("module", "chatbycard");
        result.put("status", "running");
        result.put("description", "ChatByCard聊天模块运行正常");
        
        log.info("ChatByCard status requested");
        return result;
    }
} 