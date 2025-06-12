package cn.iocoder.boot.chatbycard.service.impl;

import cn.iocoder.boot.chatbycard.dto.WorkflowDTO;
import cn.iocoder.boot.chatbycard.service.WorkflowService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 工作流服务实现类
 *
 * @author backend-team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowServiceImpl implements WorkflowService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    // 从配置文件读取外部API完整地址
    @Value("${external.api.workflow.url}")
    private String workflowApiUrl;
    
    // 从配置文件读取前端跳转URL
    @Value("${external.api.workflow.frontend-url}")
    private String workflowFrontendUrl;

    @Override
    public List<WorkflowDTO> getAllWorkflows() {
        log.info("调用外部API获取所有工作流列表");
        
        try {
            log.debug("调用外部API URL: {}", workflowApiUrl);
            
            // 调用外部API
            String response = restTemplate.getForObject(workflowApiUrl, String.class);
            
            if (response == null || response.trim().isEmpty()) {
                log.warn("外部API返回空响应");
                return new ArrayList<>();
            }
            
            // 解析JSON响应
            JsonNode jsonArray = objectMapper.readTree(response);
            
            if (!jsonArray.isArray()) {
                log.warn("外部API返回非数组格式数据");
                return new ArrayList<>();
            }
            
            List<WorkflowDTO> workflows = new ArrayList<>();
            for (JsonNode node : jsonArray) {
                WorkflowDTO workflow = convertToDTO(node);
                if (workflow != null) {
                    workflows.add(workflow);
                }
            }
            
            log.info("成功获取 {} 个工作流", workflows.size());
            return workflows;
            
        } catch (Exception e) {
            log.error("调用外部API获取工作流列表失败: {}", e.getMessage(), e);
            // 返回空列表而不是抛出异常，避免前端处理复杂性
            return new ArrayList<>();
        }
    }

    @Override
    public WorkflowDTO getWorkflowById(String id) {
        log.info("根据ID获取工作流: {}", id);
        
        // 先获取所有工作流，然后过滤
        List<WorkflowDTO> workflows = getAllWorkflows();
        return workflows.stream()
                .filter(workflow -> id.equals(workflow.getId()))
                .findFirst()
                .orElse(null);
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
        // 由于外部API可能不支持增加调用次数，这里只记录日志
        // 实际项目中可能需要调用外部API的相应接口
        log.warn("外部API暂不支持增加调用次数功能");
    }

    @Override
    public String getWorkflowFrontendUrl() {
        log.info("获取工作流前端跳转URL: {}", workflowFrontendUrl);
        return workflowFrontendUrl;
    }

    /**
     * 将外部API响应转换为DTO
     */
    private WorkflowDTO convertToDTO(JsonNode node) {
        try {
            WorkflowDTO dto = new WorkflowDTO();
            
            // 基本信息
            dto.setId(node.has("id") ? node.get("id").asText() : null);
            dto.setName(node.has("name") ? node.get("name").asText() : "Untitled Workflow");
            dto.setDescription(node.has("description") ? node.get("description").asText() : "No description");
            dto.setStatus(node.has("status") ? node.get("status").asText() : "UNKNOWN");
            dto.setConfig(node.has("config") ? node.get("config").asText() : null);
            
            // 设置默认值
            dto.setType("automation");
            dto.setIcon("workflow");
            dto.setCategory("workflow");
            dto.setCallCount(0);
            dto.setEstimatedTime("1-2 minutes");
            
            // 处理变量数据 - 先处理变量，因为节点的 userprompt 需要引用变量
            List<WorkflowDTO.WorkflowVariable> vars = new ArrayList<>();
            if (node.has("vars") && node.get("vars").isArray()) {
                for (JsonNode varNode : node.get("vars")) {
                    WorkflowDTO.WorkflowVariable var = new WorkflowDTO.WorkflowVariable();
                    var.setName(varNode.has("name") ? varNode.get("name").asText() : "");
                    var.setDescription(varNode.has("description") ? varNode.get("description").asText() : "");
                    vars.add(var);
                }
            }
            dto.setVars(vars);
            
            // 处理节点数据 - 使用API返回的真实数据
            List<WorkflowDTO.WorkflowNode> workflowNodes = new ArrayList<>();
            if (node.has("nodes") && node.get("nodes").isArray()) {
                for (JsonNode nodeItem : node.get("nodes")) {
                    WorkflowDTO.WorkflowNode workflowNode = new WorkflowDTO.WorkflowNode();
                    
                    // 从外部API获取真实数据
                    workflowNode.setName(nodeItem.has("name") ? nodeItem.get("name").asText() : "");
                    workflowNode.setId(nodeItem.has("id") ? nodeItem.get("id").asText() : "");
                    workflowNode.setUserPrompt(nodeItem.has("user_prompt") ? nodeItem.get("user_prompt").asText() : "");
                    
                    workflowNodes.add(workflowNode);
                }
            }
            dto.setNodes(workflowNodes);
            
            // 默认代理
            dto.setAgents(Arrays.asList("System Agent"));
            
            // 时间字段
            if (node.has("created_at")) {
                try {
                    String createdAt = node.get("created_at").asText();
                    dto.setCreatedAt(LocalDateTime.parse(createdAt, DateTimeFormatter.ISO_DATE_TIME));
                } catch (Exception e) {
                    log.warn("解析创建时间失败: {}", e.getMessage());
                }
            }
            
            if (node.has("updated_at")) {
                try {
                    String updatedAt = node.get("updated_at").asText();
                    dto.setUpdatedAt(LocalDateTime.parse(updatedAt, DateTimeFormatter.ISO_DATE_TIME));
                } catch (Exception e) {
                    log.warn("解析更新时间失败: {}", e.getMessage());
                }
            }
            
            return dto;
            
        } catch (Exception e) {
            log.error("转换工作流数据失败: {}", e.getMessage(), e);
            return null;
        }
    }
} 