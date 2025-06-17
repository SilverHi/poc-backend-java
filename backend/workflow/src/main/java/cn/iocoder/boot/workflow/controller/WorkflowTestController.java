package cn.iocoder.boot.workflow.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * 工作流测试控制器
 *
 * @author workflow-team
 */
@Slf4j
@RestController
@RequestMapping("/api/workflow/test")
public class WorkflowTestController {

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> result = new HashMap<>();
        result.put("module", "workflow");
        result.put("status", "running");
        result.put("description", "工作流模块运行正常");
        result.put("timestamp", LocalDateTime.now());
        result.put("features", new String[]{"工作流管理", "节点处理", "执行引擎"});
        
        log.info("工作流模块状态检查");
        return result;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> result = new HashMap<>();
        result.put("status", "healthy");
        result.put("timestamp", LocalDateTime.now());
        return result;
    }
} 