package cn.iocoder.boot.chatbycard.service.impl;

import cn.iocoder.boot.chatbycard.dto.AgentDTO;
import cn.iocoder.boot.chatbycard.dto.CreateAgentRequest;
import cn.iocoder.boot.chatbycard.entity.ChatAgentsInfo;
import cn.iocoder.boot.chatbycard.mapper.ChatAgentsInfoMapper;
import cn.iocoder.boot.chatbycard.service.AgentService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
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

    @Override
    @Transactional
    public AgentDTO createAgent(CreateAgentRequest request) {
        log.info("创建新的AI代理，名称: {}", request.getName());
        
        // 1. 创建Agent实体
        ChatAgentsInfo agent = new ChatAgentsInfo();
        agent.setName(request.getName());
        agent.setDescription(request.getDescription());
        agent.setType(request.getType());
        agent.setIcon(request.getIcon());
        agent.setModelName(request.getModelName());
        agent.setSystemPrompt(request.getSystemPrompt());
        agent.setTemperature(BigDecimal.valueOf(request.getTemperature()));
        agent.setMaxTokens(request.getMaxTokens());
        agent.setCallCount(0L); // 初始调用次数为0
        agent.setCreateTime(OffsetDateTime.now());
        agent.setUpdateTime(OffsetDateTime.now());
        
        // 2. 保存到数据库
        int result = agentMapper.insert(agent);
        
        if (result <= 0) {
            throw new RuntimeException("创建Agent失败");
        }
        
        log.info("AI代理创建成功，ID: {}, 名称: {}", agent.getId(), agent.getName());
        
        // 3. 返回创建的Agent信息
        return convertToDTO(agent);
    }

    @Override
    @Transactional
    public boolean deleteAgent(String id) {
        log.info("删除AI代理，ID: {}", id);
        
        try {
            Long agentId = Long.parseLong(id);
            
            // 检查Agent是否存在
            ChatAgentsInfo existingAgent = agentMapper.selectById(agentId);
            if (existingAgent == null) {
                log.warn("要删除的AI代理不存在，ID: {}", id);
                return false;
            }
            
            // 执行删除
            int result = agentMapper.deleteById(agentId);
            
            if (result > 0) {
                log.info("AI代理删除成功，ID: {}", id);
                return true;
            } else {
                log.warn("AI代理删除失败，ID: {}", id);
                return false;
            }
        } catch (NumberFormatException e) {
            log.error("无效的代理ID: {}", id);
            return false;
        }
    }

    @Override
    @Transactional
    public AgentDTO updateAgent(String id, CreateAgentRequest request) {
        log.info("更新AI代理，ID: {}, 名称: {}", id, request.getName());
        
        try {
            Long agentId = Long.parseLong(id);
            
            // 检查Agent是否存在
            ChatAgentsInfo existingAgent = agentMapper.selectById(agentId);
            if (existingAgent == null) {
                log.warn("要更新的AI代理不存在，ID: {}", id);
                return null;
            }
            
            // 更新Agent信息
            existingAgent.setName(request.getName());
            existingAgent.setDescription(request.getDescription());
            existingAgent.setType(request.getType());
            existingAgent.setIcon(request.getIcon());
            existingAgent.setModelName(request.getModelName());
            existingAgent.setSystemPrompt(request.getSystemPrompt());
            existingAgent.setTemperature(BigDecimal.valueOf(request.getTemperature()));
            existingAgent.setMaxTokens(request.getMaxTokens());
            existingAgent.setUpdateTime(OffsetDateTime.now());
            
            // 保存更新
            int result = agentMapper.updateById(existingAgent);
            
            if (result > 0) {
                log.info("AI代理更新成功，ID: {}, 名称: {}", id, request.getName());
                return convertToDTO(existingAgent);
            } else {
                log.warn("AI代理更新失败，ID: {}", id);
                return null;
            }
        } catch (NumberFormatException e) {
            log.error("无效的代理ID: {}", id);
            return null;
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