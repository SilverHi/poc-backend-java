package cn.iocoder.boot.chatbycard.service;

import cn.iocoder.boot.chatbycard.dto.AgentDTO;
import cn.iocoder.boot.chatbycard.dto.CreateAgentRequest;

import java.util.List;

/**
 * AI代理服务接口
 *
 * @author backend-team
 */
public interface AgentService {

    /**
     * 获取所有代理列表
     *
     * @return 代理列表
     */
    List<AgentDTO> getAllAgents();

    /**
     * 根据ID获取代理
     *
     * @param id 代理ID
     * @return 代理信息
     */
    AgentDTO getAgentById(String id);

    /**
     * 根据类型获取代理列表
     *
     * @param type 代理类型
     * @return 代理列表
     */
    List<AgentDTO> getAgentsByType(String type);

    /**
     * 根据关键词搜索代理
     *
     * @param keyword 搜索关键词
     * @return 代理列表
     */
    List<AgentDTO> searchAgents(String keyword);

    /**
     * 增加代理调用次数
     *
     * @param id 代理ID
     */
    void incrementCallCount(String id);

    /**
     * 创建新的Agent
     *
     * @param request 创建Agent请求
     * @return 创建的Agent信息
     */
    AgentDTO createAgent(CreateAgentRequest request);

    /**
     * 删除Agent
     *
     * @param id 代理ID
     * @return 删除是否成功
     */
    boolean deleteAgent(String id);

    /**
     * 更新Agent
     *
     * @param id 代理ID
     * @param request 更新Agent请求
     * @return 更新后的Agent信息，如果Agent不存在则返回null
     */
    AgentDTO updateAgent(String id, CreateAgentRequest request);
} 