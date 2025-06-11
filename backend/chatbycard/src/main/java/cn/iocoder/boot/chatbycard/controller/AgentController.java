package cn.iocoder.boot.chatbycard.controller;

import cn.iocoder.boot.chatbycard.dto.AgentDTO;
import cn.iocoder.boot.chatbycard.dto.ApiResponse;
import cn.iocoder.boot.chatbycard.dto.CreateAgentRequest;
import cn.iocoder.boot.chatbycard.service.AgentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * AI代理管理控制器
 *
 * @author backend-team
 */
@Slf4j
@RestController
@RequestMapping("/api/chatbycard/agents")
@RequiredArgsConstructor
public class AgentController {

    private final AgentService agentService;

    /**
     * 获取所有代理列表
     */
    @GetMapping
    public ApiResponse<AgentListResponse> getAllAgents(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "keyword", required = false) String keyword) {
        log.info("获取代理列表请求，类型: {}, 关键词: {}", type, keyword);
        
        try {
            List<AgentDTO> agents;
            
            if (keyword != null && !keyword.trim().isEmpty()) {
                // 关键词搜索
                agents = agentService.searchAgents(keyword.trim());
            } else if (type != null && !type.trim().isEmpty()) {
                // 按类型筛选
                agents = agentService.getAgentsByType(type.trim());
            } else {
                // 获取所有代理
                agents = agentService.getAllAgents();
            }
            
            AgentListResponse response = new AgentListResponse();
            response.setData(agents);
            response.setPagination(new PaginationInfo(agents.size(), 1, agents.size()));
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("获取代理列表失败: {}", e.getMessage(), e);
            return ApiResponse.error("获取代理列表失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID获取代理详情
     */
    @GetMapping("/{id}")
    public ApiResponse<AgentDetailResponse> getAgentById(@PathVariable String id) {
        log.info("获取代理详情请求，ID: {}", id);
        
        try {
            AgentDTO agent = agentService.getAgentById(id);
            if (agent == null) {
                return ApiResponse.error(404, "代理不存在");
            }
            AgentDetailResponse response = new AgentDetailResponse();
            response.setData(agent);
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("获取代理详情失败: {}", e.getMessage(), e);
            return ApiResponse.error("获取代理详情失败: " + e.getMessage());
        }
    }

    /**
     * 根据类型获取代理列表
     */
    @GetMapping("/type/{type}")
    public ApiResponse<AgentListResponse> getAgentsByType(@PathVariable String type) {
        log.info("根据类型获取代理列表，类型: {}", type);
        
        try {
            List<AgentDTO> agents = agentService.getAgentsByType(type);
            AgentListResponse response = new AgentListResponse();
            response.setData(agents);
            response.setPagination(new PaginationInfo(agents.size(), 1, agents.size()));
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("根据类型获取代理列表失败: {}", e.getMessage(), e);
            return ApiResponse.error("根据类型获取代理列表失败: " + e.getMessage());
        }
    }

    /**
     * 搜索代理
     */
    @GetMapping("/search")
    public ApiResponse<AgentListResponse> searchAgents(@RequestParam("q") String keyword) {
        log.info("搜索代理请求，关键词: {}", keyword);
        
        try {
            List<AgentDTO> agents = agentService.searchAgents(keyword);
            AgentListResponse response = new AgentListResponse();
            response.setData(agents);
            response.setPagination(new PaginationInfo(agents.size(), 1, agents.size()));
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("搜索代理失败: {}", e.getMessage(), e);
            return ApiResponse.error("搜索代理失败: " + e.getMessage());
        }
    }

    /**
     * 增加代理调用次数
     */
    @PostMapping("/{id}/increment-call")
    public ApiResponse<Boolean> incrementCallCount(@PathVariable String id) {
        log.info("增加代理调用次数请求，ID: {}", id);
        
        try {
            agentService.incrementCallCount(id);
            return ApiResponse.success(true, "调用次数更新成功");
        } catch (Exception e) {
            log.error("增加代理调用次数失败: {}", e.getMessage(), e);
            return ApiResponse.error("增加代理调用次数失败: " + e.getMessage());
        }
    }

    /**
     * 创建新的Agent
     */
    @PostMapping
    public ApiResponse<AgentDTO> createAgent(@Valid @RequestBody CreateAgentRequest request) {
        log.info("创建Agent请求，名称: {}, 类型: {}", request.getName(), request.getType());
        
        try {
            AgentDTO agent = agentService.createAgent(request);
            return ApiResponse.success(agent, "Agent创建成功");
        } catch (Exception e) {
            log.error("创建Agent失败: {}", e.getMessage(), e);
            return ApiResponse.error("创建Agent失败: " + e.getMessage());
        }
    }

    /**
     * 代理列表响应类
     */
    public static class AgentListResponse {
        private List<AgentDTO> data;
        private PaginationInfo pagination;
        
        public List<AgentDTO> getData() { return data; }
        public void setData(List<AgentDTO> data) { this.data = data; }
        public PaginationInfo getPagination() { return pagination; }
        public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
    }
    
    /**
     * 代理详情响应类
     */
    public static class AgentDetailResponse {
        private AgentDTO data;
        
        public AgentDTO getData() { return data; }
        public void setData(AgentDTO data) { this.data = data; }
    }
    
    /**
     * 分页信息类
     */
    public static class PaginationInfo {
        private int total;
        private int page;
        private int size;
        
        public PaginationInfo(int total, int page, int size) {
            this.total = total;
            this.page = page;
            this.size = size;
        }
        
        public int getTotal() { return total; }
        public void setTotal(int total) { this.total = total; }
        public int getPage() { return page; }
        public void setPage(int page) { this.page = page; }
        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
    }
} 