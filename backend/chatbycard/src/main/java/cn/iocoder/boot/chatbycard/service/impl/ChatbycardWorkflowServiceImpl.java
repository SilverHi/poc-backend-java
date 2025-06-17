package cn.iocoder.boot.chatbycard.service.impl;

import cn.iocoder.boot.chatbycard.dto.WorkflowDTO;
import cn.iocoder.boot.chatbycard.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Chatbycard工作流服务实现类（调用内部workflow模块服务）
 *
 * @author backend-team
 */
@Slf4j
@Service("chatbycardWorkflowServiceImpl")
@RequiredArgsConstructor
public class ChatbycardWorkflowServiceImpl implements WorkflowService {

    private final cn.iocoder.boot.workflow.service.WorkflowService workflowService;
    
    // 从配置文件读取前端跳转URL
    @Value("${external.api.workflow.frontend-url:http://localhost:3000/workflow}")
    private String workflowFrontendUrl;

    @Override
    public List<WorkflowDTO> getAllWorkflows() {
        log.info("调用内部workflow服务获取所有工作流列表");
        
        try {
            // 调用内部workflow服务获取工作流列表
            List<cn.iocoder.boot.workflow.dto.WorkflowDTO> internalWorkflows = workflowService.getWorkflows(0, 1000);
            
            // 转换为chatbycard的WorkflowDTO格式
            List<WorkflowDTO> workflows = internalWorkflows.stream()
                    .map(this::convertFromInternalDTO)
                    .collect(Collectors.toList());
            
            log.info("成功获取 {} 个工作流", workflows.size());
            return workflows;
            
        } catch (Exception e) {
            log.error("调用内部workflow服务获取工作流列表失败: {}", e.getMessage(), e);
            // 返回空列表而不是抛出异常，避免前端处理复杂性
            return new ArrayList<>();
        }
    }

    @Override
    public WorkflowDTO getWorkflowById(String id) {
        log.info("根据ID获取工作流: {}", id);
        
        try {
            Long workflowId = Long.parseLong(id);
            cn.iocoder.boot.workflow.dto.WorkflowDTO internalWorkflow = workflowService.getWorkflow(workflowId);
            return convertFromInternalDTO(internalWorkflow);
        } catch (Exception e) {
            log.error("根据ID获取工作流失败: {}", e.getMessage(), e);
            return null;
        }
    }

    @Override
    public List<WorkflowDTO> getWorkflowsByType(String type) {
        log.info("根据类型获取工作流列表: {}", type);
        
        List<WorkflowDTO> workflows = getAllWorkflows();
        return workflows.stream()
                .filter(workflow -> type.equals(workflow.getType()))
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkflowDTO> searchWorkflows(String keyword) {
        log.info("搜索工作流，关键词: {}", keyword);
        
        List<WorkflowDTO> workflows = getAllWorkflows();
        return workflows.stream()
                .filter(workflow -> 
                    (workflow.getName() != null && workflow.getName().toLowerCase().contains(keyword.toLowerCase())) ||
                    (workflow.getDescription() != null && workflow.getDescription().toLowerCase().contains(keyword.toLowerCase())) ||
                    (workflow.getType() != null && workflow.getType().toLowerCase().contains(keyword.toLowerCase()))
                )
                .collect(Collectors.toList());
    }

    @Override
    public void incrementCallCount(String id) {
        log.info("增加工作流调用次数，ID: {}", id);
        // 工作流调用次数由workflow模块自己管理，这里只记录日志
        log.info("工作流调用次数更新请求，ID: {}", id);
    }

    @Override
    public String getWorkflowFrontendUrl() {
        log.info("获取工作流前端跳转URL: {}", workflowFrontendUrl);
        return workflowFrontendUrl;
    }

    /**
     * 将内部workflow模块的DTO转换为chatbycard的DTO
     */
    private WorkflowDTO convertFromInternalDTO(cn.iocoder.boot.workflow.dto.WorkflowDTO internalDto) {
        if (internalDto == null) {
            return null;
        }
        
        try {
            WorkflowDTO dto = new WorkflowDTO();
            
            // 基本信息
            dto.setId(String.valueOf(internalDto.getId()));
            dto.setName(internalDto.getName() != null ? internalDto.getName() : "Untitled Workflow");
            dto.setDescription(internalDto.getDescription() != null ? internalDto.getDescription() : "No description");
            dto.setStatus(internalDto.getStatus() != null ? internalDto.getStatus() : "UNKNOWN");
            dto.setConfig(internalDto.getConfig());
            
            // 设置默认值
            dto.setType("automation");
            dto.setIcon("workflow");
            dto.setCategory("workflow");
            dto.setCallCount(0);
            dto.setEstimatedTime("1-2 minutes");
            
            // 处理变量数据
            List<WorkflowDTO.WorkflowVariable> vars = new ArrayList<>();
            if (internalDto.getVars() != null) {
                for (cn.iocoder.boot.workflow.dto.WorkflowDTO.VariableInfo internalVar : internalDto.getVars()) {
                    WorkflowDTO.WorkflowVariable var = new WorkflowDTO.WorkflowVariable();
                    var.setName(internalVar.getName() != null ? internalVar.getName() : "");
                    var.setDescription(internalVar.getDescription() != null ? internalVar.getDescription() : "");
                    vars.add(var);
                }
            }
            dto.setVars(vars);
            
            // 处理节点数据
            List<WorkflowDTO.WorkflowNode> workflowNodes = new ArrayList<>();
            if (internalDto.getNodes() != null) {
                for (cn.iocoder.boot.workflow.dto.WorkflowDTO.NodeInfo internalNode : internalDto.getNodes()) {
                    WorkflowDTO.WorkflowNode workflowNode = new WorkflowDTO.WorkflowNode();
                    
                    workflowNode.setName(internalNode.getName() != null ? internalNode.getName() : "");
                    workflowNode.setId(internalNode.getId() != null ? internalNode.getId() : "");
                    workflowNode.setUserPrompt(internalNode.getUserPrompt() != null ? internalNode.getUserPrompt() : "");
                    
                    workflowNodes.add(workflowNode);
                }
            }
            dto.setNodes(workflowNodes);
            
            // 设置默认代理列表
            dto.setAgents(Arrays.asList("System Agent"));
            
            // 时间字段
            if (internalDto.getCreatedAt() != null) {
                dto.setCreatedAt(internalDto.getCreatedAt());
            }
            
            if (internalDto.getUpdatedAt() != null) {
                dto.setUpdatedAt(internalDto.getUpdatedAt());
            }
            
            return dto;
            
        } catch (Exception e) {
            log.error("转换工作流数据失败: {}", e.getMessage(), e);
            return null;
        }
    }
} 