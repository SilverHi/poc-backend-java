package cn.iocoder.boot.workflow.controller;

import cn.iocoder.boot.workflow.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * 外部Agent控制器
 *
 * @author workflow-team
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExternalAgentController {

    private final WorkflowService workflowService;

    /**
     * 获取外部Agent信息的API
     */
    @GetMapping("/external-agents")
    public Map<String, Object> getExternalAgents() {
        log.info("获取外部Agent信息");
        return workflowService.getExternalAgents();
    }
} 