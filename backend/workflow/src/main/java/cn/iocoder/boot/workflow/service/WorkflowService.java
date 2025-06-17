package cn.iocoder.boot.workflow.service;

import cn.iocoder.boot.workflow.dto.*;
import cn.iocoder.boot.workflow.entity.Workflow;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * 工作流服务接口
 *
 * @author workflow-team
 */
public interface WorkflowService {

    /**
     * 创建工作流
     */
    WorkflowDTO createWorkflow(WorkflowCreateRequest request);

    /**
     * 更新工作流
     */
    WorkflowDTO updateWorkflow(Long id, WorkflowUpdateRequest request);

    /**
     * 删除工作流
     */
    void deleteWorkflow(Long id);

    /**
     * 根据ID获取工作流
     */
    WorkflowDTO getWorkflow(Long id);

    /**
     * 获取工作流列表（包含节点和变量信息）
     */
    List<WorkflowDTO> getWorkflows(int skip, int limit);

    /**
     * 分页获取工作流列表
     */
    Page<WorkflowDTO> getWorkflowsPage(Pageable pageable);

    /**
     * 执行工作流
     */
    String executeWorkflow(Long id, WorkflowExecuteRequest request);

    /**
     * 运行工作流
     */
    RunWorkflowResponse runWorkflow(RunWorkflowRequest request);

    /**
     * 导出工作流
     */
    Map<String, Object> exportWorkflow(Long id);

    /**
     * 导入工作流
     */
    Map<String, Object> importWorkflow(Map<String, Object> importRequest);

    /**
     * 获取外部Agent信息
     */
    Map<String, Object> getExternalAgents();
} 