package cn.iocoder.boot.workflow.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * 工作流控制器
 *
 * @author backend-team
 */
@Slf4j
@RestController
@RequestMapping("/api/workflow")
public class WorkflowController {

    @GetMapping("/status")
    public Map<String, Object> getStatus() {
        Map<String, Object> result = new HashMap<>();
        result.put("module", "workflow");
        result.put("status", "running");
        result.put("description", "工作流模块运行正常");
        log.info("Workflow status requested");
        return result;
    }

    @GetMapping("/list")
    public Map<String, Object> getWorkflowList() {
        Map<String, Object> result = new HashMap<>();
        result.put("workflows", new String[]{"审批流程", "数据处理流程", "通知流程"});
        result.put("count", 3);
        return result;
    }
} 