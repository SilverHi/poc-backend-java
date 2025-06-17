package cn.iocoder.boot.workflow.service.impl;

import cn.iocoder.boot.workflow.dto.*;
import cn.iocoder.boot.workflow.entity.Workflow;
import cn.iocoder.boot.workflow.entity.WorkflowExecution;
import cn.iocoder.boot.workflow.repository.WorkflowRepository;
import cn.iocoder.boot.workflow.repository.WorkflowExecutionRepository;
import cn.iocoder.boot.workflow.service.WorkflowService;
import cn.iocoder.boot.workflow.service.WorkflowAgentService;
import cn.iocoder.boot.workflow.utils.WorkflowConfigParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 工作流服务实现类
 *
 * @author workflow-team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowServiceImpl implements WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowExecutionRepository executionRepository;
    private final ObjectMapper objectMapper;
    private final WorkflowAgentService workflowAgentService;

    @Override
    public WorkflowDTO createWorkflow(WorkflowCreateRequest request) {
        log.info("创建工作流: {}", request.getName());
        
        Workflow workflow = new Workflow();
        workflow.setName(request.getName());
        workflow.setDescription(request.getDescription());
        workflow.setConfig(request.getConfig());
        workflow.setStatus(Workflow.WorkflowStatus.DRAFT);
        
        workflow = workflowRepository.save(workflow);
        return convertToDTO(workflow);
    }

    @Override
    public WorkflowDTO updateWorkflow(Long id, WorkflowUpdateRequest request) {
        log.info("更新工作流: id={}", id);
        
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("工作流不存在: " + id));
        
        if (request.getName() != null) {
            workflow.setName(request.getName());
        }
        if (request.getDescription() != null) {
            workflow.setDescription(request.getDescription());
        }
        if (request.getConfig() != null) {
            workflow.setConfig(request.getConfig());
        }
        if (request.getStatus() != null) {
            workflow.setStatus(Workflow.WorkflowStatus.valueOf(request.getStatus()));
        }
        
        workflow = workflowRepository.save(workflow);
        return convertToDTO(workflow);
    }

    @Override
    public void deleteWorkflow(Long id) {
        log.info("删除工作流: id={}", id);
        
        if (!workflowRepository.existsById(id)) {
            throw new RuntimeException("工作流不存在: " + id);
        }
        
        workflowRepository.deleteById(id);
    }

    @Override
    public WorkflowDTO getWorkflow(Long id) {
        log.info("获取工作流: id={}", id);
        
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("工作流不存在: " + id));
        
        return convertToDTO(workflow);
    }

    @Override
    public List<WorkflowDTO> getWorkflows(int skip, int limit) {
        log.info("获取工作流列表: skip={}, limit={}", skip, limit);
        
        Pageable pageable = PageRequest.of(skip / limit, limit);
        Page<Workflow> workflowPage = workflowRepository.findAll(pageable);
        
        return workflowPage.getContent().stream()
                .map(this::convertToDTOWithDetails)
                .collect(Collectors.toList());
    }

    @Override
    public Page<WorkflowDTO> getWorkflowsPage(Pageable pageable) {
        Page<Workflow> workflowPage = workflowRepository.findAll(pageable);
        List<WorkflowDTO> workflowDTOs = workflowPage.getContent().stream()
                .map(this::convertToDTOWithDetails)
                .collect(Collectors.toList());
        
        return new PageImpl<>(workflowDTOs, pageable, workflowPage.getTotalElements());
    }

    @Override
    public String executeWorkflow(Long id, WorkflowExecuteRequest request) {
        log.info("执行工作流: id={}", id);
        
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("工作流不存在: " + id));
        
        // 创建执行记录
        WorkflowExecution execution = new WorkflowExecution();
        execution.setWorkflowId(id);
        execution.setStatus(WorkflowExecution.ExecutionStatus.PENDING);
        execution = executionRepository.save(execution);
        
        // TODO: 实现异步执行逻辑
        return "工作流执行已启动，执行ID: " + execution.getId();
    }

    @Override
    public RunWorkflowResponse runWorkflow(RunWorkflowRequest request) {
        log.info("运行工作流: id={}", request.getId());
        
        try {
            Long workflowId = Long.parseLong(request.getId());
            Workflow workflow = workflowRepository.findById(workflowId)
                    .orElseThrow(() -> new RuntimeException("工作流不存在: " + request.getId()));
            
            // TODO: 实现工作流执行引擎
            String result = "工作流执行完成，输出结果";
            return RunWorkflowResponse.success(result);
            
        } catch (Exception e) {
            log.error("运行工作流失败: {}", e.getMessage(), e);
            return RunWorkflowResponse.error("运行工作流失败: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> exportWorkflow(Long id) {
        log.info("导出工作流: id={}", id);
        
        Workflow workflow = workflowRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("工作流不存在: " + id));
        
        Map<String, Object> exportData = new HashMap<>();
        exportData.put("name", workflow.getName());
        exportData.put("description", workflow.getDescription());
        exportData.put("status", workflow.getStatus().name());
        
        try {
            JsonNode configNode = objectMapper.readTree(workflow.getConfig());
            exportData.put("config", configNode);
        } catch (Exception e) {
            log.error("解析工作流配置失败: {}", e.getMessage());
            exportData.put("config", workflow.getConfig());
        }
        
        exportData.put("exported_at", LocalDateTime.now());
        return exportData;
    }

    @Override
    public Map<String, Object> importWorkflow(Map<String, Object> importRequest) {
        log.info("导入工作流");
        
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> workflowData = (Map<String, Object>) importRequest.get("workflow_data");
            
            String name = (String) importRequest.get("name");
            String description = (String) importRequest.get("description");
            
            if (name == null || name.isEmpty()) {
                name = (String) workflowData.get("name");
            }
            if (description == null || description.isEmpty()) {
                description = (String) workflowData.get("description");
            }
            
            String config = objectMapper.writeValueAsString(workflowData.get("config"));
            
            Workflow workflow = new Workflow();
            workflow.setName(name);
            workflow.setDescription(description);
            workflow.setConfig(config);
            workflow.setStatus(Workflow.WorkflowStatus.DRAFT);
            
            workflow = workflowRepository.save(workflow);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "工作流导入成功");
            response.put("workflow_id", workflow.getId());
            response.put("workflow", convertToDTO(workflow));
            
            return response;
            
        } catch (Exception e) {
            log.error("导入工作流失败: {}", e.getMessage(), e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "导入工作流失败: " + e.getMessage());
            return response;
        }
    }

    @Override
    public Map<String, Object> getExternalAgents() {
        log.info("获取Agent信息");
        
        try {
            return workflowAgentService.getExternalAgents();
        } catch (Exception e) {
            log.error("获取Agent信息异常: {}", e.getMessage(), e);
            Map<String, Object> result = new HashMap<>();
            result.put("agents", new ArrayList<>());
            return result;
        }
    }

    private WorkflowDTO convertToDTO(Workflow workflow) {
        WorkflowDTO dto = new WorkflowDTO();
        BeanUtils.copyProperties(workflow, dto);
        dto.setStatus(workflow.getStatus().name());
        return dto;
    }

    private WorkflowDTO convertToDTOWithDetails(Workflow workflow) {
        WorkflowDTO dto = convertToDTO(workflow);
        
        // 解析工作流配置，提取节点和变量信息
        try {
            WorkflowConfigParser.WorkflowDetails details = 
                    WorkflowConfigParser.parseWorkflowDetails(workflow.getConfig());
            dto.setNodes(details.getNodes());
            dto.setVars(details.getVars());
        } catch (Exception e) {
            log.warn("解析工作流配置失败: workflowId={}, error={}", workflow.getId(), e.getMessage());
            dto.setNodes(new ArrayList<>());
            dto.setVars(new ArrayList<>());
        }
        
        return dto;
    }
} 