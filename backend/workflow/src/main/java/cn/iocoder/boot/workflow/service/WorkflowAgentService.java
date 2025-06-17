package cn.iocoder.boot.workflow.service;

import java.util.List;
import java.util.Map;

/**
 * 工作流Agent服务接口
 * 用于获取Agent信息，避免直接依赖chatbycard模块
 *
 * @author workflow-team
 */
public interface WorkflowAgentService {
    
    /**
     * 获取所有Agent信息
     * @return Agent信息列表
     */
    List<Object> getAllAgents();
    
    /**
     * 获取外部Agent信息（用于API兼容）
     * @return 包含agents字段的Map
     */
    Map<String, Object> getExternalAgents();
} 