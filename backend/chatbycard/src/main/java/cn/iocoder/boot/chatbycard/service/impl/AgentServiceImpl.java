package cn.iocoder.boot.chatbycard.service.impl;

import cn.iocoder.boot.chatbycard.dto.AgentDTO;
import cn.iocoder.boot.chatbycard.entity.ChatAgentsInfo;
import cn.iocoder.boot.chatbycard.mapper.ChatAgentsInfoMapper;
import cn.iocoder.boot.chatbycard.service.AgentService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * AI代理服务实现类
 *
 * @author backend-team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AgentServiceImpl implements AgentService {

    private final ChatAgentsInfoMapper agentMapper;

    @Override
    public List<AgentDTO> getAllAgents() {
        log.info("获取所有AI代理列表");
        
        QueryWrapper<ChatAgentsInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("call_count", "create_time");
        
        List<ChatAgentsInfo> agents = agentMapper.selectList(queryWrapper);
        
        return agents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public AgentDTO getAgentById(String id) {
        log.info("根据ID获取AI代理: {}", id);
        
        try {
            Long agentId = Long.parseLong(id);
            ChatAgentsInfo agent = agentMapper.selectById(agentId);
            
            if (agent == null) {
                log.warn("AI代理不存在，ID: {}", id);
                return null;
            }
            
            return convertToDTO(agent);
        } catch (NumberFormatException e) {
            log.error("无效的代理ID: {}", id);
            return null;
        }
    }

    @Override
    public List<AgentDTO> getAgentsByType(String type) {
        log.info("根据类型获取AI代理列表: {}", type);
        
        QueryWrapper<ChatAgentsInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("type", type)
                   .orderByDesc("call_count", "create_time");
        
        List<ChatAgentsInfo> agents = agentMapper.selectList(queryWrapper);
        
        return agents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<AgentDTO> searchAgents(String keyword) {
        log.info("搜索AI代理，关键词: {}", keyword);
        
        QueryWrapper<ChatAgentsInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.and(wrapper -> wrapper
                .like("name", keyword)
                .or()
                .like("description", keyword)
                .or()
                .like("type", keyword))
                .orderByDesc("call_count", "create_time");
        
        List<ChatAgentsInfo> agents = agentMapper.selectList(queryWrapper);
        
        return agents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void incrementCallCount(String id) {
        log.info("增加AI代理调用次数，ID: {}", id);
        
        try {
            Long agentId = Long.parseLong(id);
            
            UpdateWrapper<ChatAgentsInfo> updateWrapper = new UpdateWrapper<>();
            updateWrapper.eq("id", agentId)
                        .setSql("call_count = call_count + 1");
            
            int result = agentMapper.update(null, updateWrapper);
            
            if (result > 0) {
                log.info("代理调用次数更新成功，ID: {}", id);
            } else {
                log.warn("代理调用次数更新失败，代理不存在，ID: {}", id);
            }
        } catch (NumberFormatException e) {
            log.error("无效的代理ID: {}", id);
        }
    }

    /**
     * 将实体转换为DTO
     */
    private AgentDTO convertToDTO(ChatAgentsInfo agent) {
        AgentDTO dto = new AgentDTO();
        dto.setId(agent.getId().toString());
        dto.setName(agent.getName());
        dto.setDescription(agent.getDescription());
        dto.setType(agent.getType());
        dto.setIcon(agent.getIcon());
        dto.setModelName(agent.getModelName());
        dto.setSystemPrompt(agent.getSystemPrompt());
        dto.setCallCount(agent.getCallCount());
        dto.setTemperature(agent.getTemperature());
        dto.setMaxTokens(agent.getMaxTokens());
        dto.setCreateTime(agent.getCreateTime());
        dto.setUpdateTime(agent.getUpdateTime());
        
        return dto;
    }
} 