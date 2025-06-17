package cn.iocoder.boot.workflow.controller;

import cn.iocoder.boot.workflow.dto.*;
import cn.iocoder.boot.workflow.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 工作流控制器
 *
 * @author workflow-team
 */
@Slf4j
@RestController
@RequestMapping("/api/workflows")
@RequiredArgsConstructor
public class WorkflowController {

    private final WorkflowService workflowService;

    /**
     * 获取工作流列表
     */
    @GetMapping
    public List<WorkflowDTO> getWorkflows(
            @RequestParam(value = "skip", defaultValue = "0") int skip,
            @RequestParam(value = "limit", defaultValue = "100") int limit) {
        log.info("获取工作流列表: skip={}, limit={}", skip, limit);
        return workflowService.getWorkflows(skip, limit);
    }

    /**
     * 创建工作流
     */
    @PostMapping
    public WorkflowDTO createWorkflow(@Valid @RequestBody WorkflowCreateRequest request) {
        log.info("创建工作流: {}", request.getName());
        return workflowService.createWorkflow(request);
    }

    /**
     * 获取工作流详情
     */
    @GetMapping("/{id}")
    public WorkflowDTO getWorkflow(@PathVariable Long id) {
        log.info("获取工作流详情: id={}", id);
        return workflowService.getWorkflow(id);
    }

    /**
     * 更新工作流
     */
    @PutMapping("/{id}")
    public WorkflowDTO updateWorkflow(@PathVariable Long id, @Valid @RequestBody WorkflowUpdateRequest request) {
        log.info("更新工作流: id={}", id);
        return workflowService.updateWorkflow(id, request);
    }

    /**
     * 删除工作流
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable Long id) {
        log.info("删除工作流: id={}", id);
        workflowService.deleteWorkflow(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 执行工作流
     */
    @PostMapping("/{id}/execute")
    public Map<String, String> executeWorkflow(@PathVariable Long id, @RequestBody WorkflowExecuteRequest request) {
        log.info("执行工作流: id={}", id);
        String message = workflowService.executeWorkflow(id, request);
        return Map.of("message", message);
    }

    /**
     * 导出工作流
     */
    @GetMapping("/{id}/export")
    public Map<String, Object> exportWorkflow(@PathVariable Long id) {
        log.info("导出工作流: id={}", id);
        return workflowService.exportWorkflow(id);
    }

    /**
     * 下载工作流
     */
    @GetMapping("/{id}/export/download")
    public ResponseEntity<String> downloadWorkflow(@PathVariable Long id) {
        log.info("下载工作流: id={}", id);
        
        Map<String, Object> exportData = workflowService.exportWorkflow(id);
        String filename = exportData.get("name") + "_workflow.json";
        
        try {
            String jsonData = new com.fasterxml.jackson.databind.ObjectMapper()
                    .writerWithDefaultPrettyPrinter()
                    .writeValueAsString(exportData);
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jsonData);
        } catch (Exception e) {
            log.error("下载工作流失败: {}", e.getMessage(), e);
            throw new RuntimeException("下载工作流失败: " + e.getMessage());
        }
    }

    /**
     * 导入工作流
     */
    @PostMapping("/import")
    public Map<String, Object> importWorkflow(@RequestBody Map<String, Object> importRequest) {
        log.info("导入工作流");
        return workflowService.importWorkflow(importRequest);
    }

    /**
     * 运行工作流
     */
    @PostMapping("/run_workflow")
    public RunWorkflowResponse runWorkflow(@Valid @RequestBody RunWorkflowRequest request) {
        log.info("运行工作流: id={}", request.getId());
        return workflowService.runWorkflow(request);
    }
} 