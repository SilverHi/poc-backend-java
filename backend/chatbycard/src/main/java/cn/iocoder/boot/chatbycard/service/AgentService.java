package cn.iocoder.boot.chatbycard.service;

import cn.iocoder.boot.chatbycard.dto.AgentDTO;

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
} 