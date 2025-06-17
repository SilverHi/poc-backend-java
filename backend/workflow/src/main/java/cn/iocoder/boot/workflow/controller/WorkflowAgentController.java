package cn.iocoder.boot.workflow.controller;

import cn.iocoder.boot.workflow.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Workflow Agent控制器
 *
 * @author workflow-team
 */
@Slf4j
@RestController
@RequestMapping("/api/agents")
@RequiredArgsConstructor
public class WorkflowAgentController {

    private final WorkflowService workflowService;

    /**
     * 获取Agent列表（空实现，主要用于兼容前端）
     */
    @GetMapping
    public Object[] getAgents(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "100") int limit) {
        log.info("获取Agent列表: skip={}, limit={}", skip, limit);
        // 返回空数组，因为Agent信息来自外部服务
        return new Object[0];
    }

    /**
     * 获取外部Agent信息
     */
    @GetMapping("/external")
    public Map<String, Object> getExternalAgents() {
        log.info("获取外部Agent信息");
        return workflowService.getExternalAgents();
    }
} 