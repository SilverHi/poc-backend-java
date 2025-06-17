package cn.iocoder.boot.server.config;

import cn.iocoder.boot.chatbycard.service.AgentService;
import cn.iocoder.boot.workflow.service.WorkflowAgentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * WorkflowAgentService适配器实现
 * 将chatbycard的AgentService适配为workflow的WorkflowAgentService
 *
 * @author server-team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkflowAgentServiceAdapter implements WorkflowAgentService {

    private final AgentService agentService;

    @Override
    public List<Object> getAllAgents() {
        try {
            return new ArrayList<>(agentService.getAllAgents());
        } catch (Exception e) {
            log.error("获取所有Agent失败: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    @Override
    public Map<String, Object> getExternalAgents() {
        try {
            List<Object> agents = getAllAgents();
            Map<String, Object> result = new HashMap<>();
            result.put("agents", agents);
            return result;
        } catch (Exception e) {
            log.error("获取外部Agent信息失败: {}", e.getMessage(), e);
            Map<String, Object> result = new HashMap<>();
            result.put("agents", new ArrayList<>());
            return result;
        }
    }
} 