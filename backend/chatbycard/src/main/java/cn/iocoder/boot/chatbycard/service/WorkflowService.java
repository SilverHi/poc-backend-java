package cn.iocoder.boot.chatbycard.service;

import cn.iocoder.boot.chatbycard.dto.WorkflowDTO;

import java.util.List;

/**
 * 工作流服务接口
 *
 * @author backend-team
 */
public interface WorkflowService {

    /**
     * 获取所有工作流列表
     *
     * @return 工作流列表
     */
    List<WorkflowDTO> getAllWorkflows();

    /**
     * 根据ID获取工作流
     *
     * @param id 工作流ID
     * @return 工作流信息
     */
    WorkflowDTO getWorkflowById(String id);

    /**
     * 根据类型获取工作流列表
     *
     * @param type 工作流类型
     * @return 工作流列表
     */
    List<WorkflowDTO> getWorkflowsByType(String type);

    /**
     * 根据关键词搜索工作流
     *
     * @param keyword 搜索关键词
     * @return 工作流列表
     */
    List<WorkflowDTO> searchWorkflows(String keyword);

    /**
     * 增加工作流调用次数
     *
     * @param id 工作流ID
     */
    void incrementCallCount(String id);

    /**
     * 获取工作流前端跳转URL
     *
     * @return 前端跳转URL
     */
    String getWorkflowFrontendUrl();
} 