package cn.iocoder.boot.interaction.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 交互模块控制器
 *
 * @author backend-team
 */
@Slf4j
@RestController
@RequestMapping("/api/interaction")
public class InteractionController {

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> result = new HashMap<>();
        result.put("module", "interaction");
        result.put("status", "running");
        result.put("description", "用户交互模块运行正常");
        
        log.info("Interaction status requested");
        return result;
    }
} 