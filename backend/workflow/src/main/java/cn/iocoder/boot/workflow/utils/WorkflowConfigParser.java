package cn.iocoder.boot.workflow.utils;

import cn.iocoder.boot.workflow.dto.WorkflowDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

/**
 * 工作流配置解析工具类
 *
 * @author workflow-team
 */
@Slf4j
public class WorkflowConfigParser {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 解析工作流配置，提取节点执行顺序和start节点变量
     */
    public static WorkflowDetails parseWorkflowDetails(String configJson) {
        try {
            JsonNode config = objectMapper.readTree(configJson);
            JsonNode nodes = config.get("nodes");
            JsonNode edges = config.get("edges");

            if (nodes == null || edges == null) {
                return new WorkflowDetails(new ArrayList<>(), new ArrayList<>());
            }

            // 构建节点字典和边映射
            Map<String, JsonNode> nodeDict = new HashMap<>();
            Map<String, List<String>> edgeMap = new HashMap<>();

            for (JsonNode node : nodes) {
                nodeDict.put(node.get("id").asText(), node);
            }

            for (JsonNode edge : edges) {
                String source = edge.get("source").asText();
                String target = edge.get("target").asText();
                edgeMap.computeIfAbsent(source, k -> new ArrayList<>()).add(target);
            }

            // 找到start节点
            JsonNode startNode = null;
            for (JsonNode node : nodes) {
                if ("start".equals(node.get("type").asText())) {
                    startNode = node;
                    break;
                }
            }

            List<WorkflowDTO.NodeInfo> orderedNodes = new ArrayList<>();
            List<WorkflowDTO.VariableInfo> startVars = new ArrayList<>();

            if (startNode != null) {
                // 提取start节点的变量
                startVars = extractStartNodeVariables(startNode);

                // 按执行顺序遍历节点
                Set<String> visited = new HashSet<>();
                String currentNodeId = startNode.get("id").asText();

                while (currentNodeId != null && !visited.contains(currentNodeId)) {
                    visited.add(currentNodeId);
                    JsonNode currentNode = nodeDict.get(currentNodeId);

                    if (currentNode != null) {
                        WorkflowDTO.NodeInfo nodeInfo = createNodeInfo(currentNode);
                        orderedNodes.add(nodeInfo);
                    }

                    // 查找下一个节点
                    currentNodeId = findNextNodeId(edgeMap, currentNodeId);
                }
            }

            return new WorkflowDetails(orderedNodes, startVars);

        } catch (Exception e) {
            log.warn("解析工作流配置失败: {}", e.getMessage());
            return new WorkflowDetails(new ArrayList<>(), new ArrayList<>());
        }
    }

    private static List<WorkflowDTO.VariableInfo> extractStartNodeVariables(JsonNode startNode) {
        List<WorkflowDTO.VariableInfo> vars = new ArrayList<>();

        try {
            JsonNode data = startNode.get("data");
            if (data == null) return vars;

            JsonNode config = data.get("config");
            if (config == null) return vars;

            JsonNode initialVariables = config.get("initialVariables");
            JsonNode variableDescriptions = config.get("variableDescriptions");

            if (initialVariables != null) {
                Map<String, Object> initialVarsMap = parseJsonToMap(initialVariables);
                Map<String, String> descMap = parseVariableDescriptions(variableDescriptions);

                for (String varName : initialVarsMap.keySet()) {
                    if (varName != null && !varName.trim().isEmpty()) {
                        WorkflowDTO.VariableInfo varInfo = new WorkflowDTO.VariableInfo();
                        varInfo.setName(varName);
                        varInfo.setDescription(descMap.getOrDefault(varName, ""));
                        vars.add(varInfo);
                    }
                }
            }

        } catch (Exception e) {
            log.warn("提取start节点变量失败: {}", e.getMessage());
        }

        return vars;
    }

    private static WorkflowDTO.NodeInfo createNodeInfo(JsonNode node) {
        WorkflowDTO.NodeInfo nodeInfo = new WorkflowDTO.NodeInfo();

        // 获取节点显示名称
        JsonNode data = node.get("data");
        String nodeName = data != null && data.get("label") != null ?
                data.get("label").asText() : node.get("id").asText();
        nodeInfo.setName(nodeName);

        // 设置默认值
        nodeInfo.setId("-1");
        nodeInfo.setUserPrompt("null");

        String nodeType = node.get("type").asText();

        switch (nodeType) {
            case "agent":
                if (data != null && data.get("config") != null) {
                    JsonNode config = data.get("config");
                    if (config.get("agentId") != null) {
                        nodeInfo.setId(config.get("agentId").asText());
                    }
                    if (config.get("prompt") != null) {
                        nodeInfo.setUserPrompt(config.get("prompt").asText());
                    }
                }
                break;
            case "end":
                nodeInfo.setId("-2");
                break;
            case "jira":
                nodeInfo.setId("-3");
                break;
            case "confluence":
                nodeInfo.setId("-4");
                break;
        }

        return nodeInfo;
    }

    private static String findNextNodeId(Map<String, List<String>> edgeMap, String currentNodeId) {
        List<String> nextNodes = edgeMap.get(currentNodeId);
        return (nextNodes != null && !nextNodes.isEmpty()) ? nextNodes.get(0) : null;
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> parseJsonToMap(JsonNode jsonNode) {
        if (jsonNode.isTextual()) {
            try {
                return objectMapper.readValue(jsonNode.asText(), Map.class);
            } catch (Exception e) {
                return new HashMap<>();
            }
        } else if (jsonNode.isObject()) {
            return objectMapper.convertValue(jsonNode, Map.class);
        }
        return new HashMap<>();
    }

    @SuppressWarnings("unchecked")
    private static Map<String, String> parseVariableDescriptions(JsonNode jsonNode) {
        if (jsonNode == null) return new HashMap<>();

        if (jsonNode.isTextual()) {
            try {
                return objectMapper.readValue(jsonNode.asText(), Map.class);
            } catch (Exception e) {
                return new HashMap<>();
            }
        } else if (jsonNode.isObject()) {
            return objectMapper.convertValue(jsonNode, Map.class);
        }
        return new HashMap<>();
    }

    @Data
    public static class WorkflowDetails {
        private final List<WorkflowDTO.NodeInfo> nodes;
        private final List<WorkflowDTO.VariableInfo> vars;
    }
} 