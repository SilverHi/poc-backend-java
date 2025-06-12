package cn.iocoder.boot.chatbycard.controller;

import cn.iocoder.boot.chatbycard.dto.ApiResponse;
import cn.iocoder.boot.chatbycard.dto.WorkflowDTO;
import cn.iocoder.boot.chatbycard.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 外部工作流管理控制器
 *
 * @author backend-team
 */
@Slf4j
@RestController
@RequestMapping("/api/chatbycard/workflows")
@RequiredArgsConstructor
public class ExternalWorkflowController {

    private final WorkflowService workflowService;

    /**
     * 获取所有工作流列表
     */
    @GetMapping
    public ApiResponse<WorkflowListResponse> getAllWorkflows(
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "keyword", required = false) String keyword) {
        log.info("获取工作流列表请求，类型: {}, 关键词: {}", type, keyword);
        
        try {
            List<WorkflowDTO> workflows;
            
            if (keyword != null && !keyword.trim().isEmpty()) {
                // 关键词搜索
                workflows = workflowService.searchWorkflows(keyword.trim());
            } else if (type != null && !type.trim().isEmpty()) {
                // 按类型筛选
                workflows = workflowService.getWorkflowsByType(type.trim());
            } else {
                // 获取所有工作流
                workflows = workflowService.getAllWorkflows();
            }
            
            WorkflowListResponse response = new WorkflowListResponse();
            response.setData(workflows);
            response.setPagination(new PaginationInfo(workflows.size(), 1, workflows.size()));
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("获取工作流列表失败: {}", e.getMessage(), e);
            return ApiResponse.error("获取工作流列表失败: " + e.getMessage());
        }
    }

    /**
     * 根据ID获取工作流详情
     */
    @GetMapping("/{id}")
    public ApiResponse<WorkflowDetailResponse> getWorkflowById(@PathVariable String id) {
        log.info("获取工作流详情请求，ID: {}", id);
        
        try {
            WorkflowDTO workflow = workflowService.getWorkflowById(id);
            if (workflow == null) {
                return ApiResponse.error(404, "工作流不存在");
            }
            WorkflowDetailResponse response = new WorkflowDetailResponse();
            response.setData(workflow);
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("获取工作流详情失败: {}", e.getMessage(), e);
            return ApiResponse.error("获取工作流详情失败: " + e.getMessage());
        }
    }

    /**
     * 根据类型获取工作流列表
     */
    @GetMapping("/type/{type}")
    public ApiResponse<WorkflowListResponse> getWorkflowsByType(@PathVariable String type) {
        log.info("根据类型获取工作流列表，类型: {}", type);
        
        try {
            List<WorkflowDTO> workflows = workflowService.getWorkflowsByType(type);
            WorkflowListResponse response = new WorkflowListResponse();
            response.setData(workflows);
            response.setPagination(new PaginationInfo(workflows.size(), 1, workflows.size()));
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("根据类型获取工作流列表失败: {}", e.getMessage(), e);
            return ApiResponse.error("根据类型获取工作流列表失败: " + e.getMessage());
        }
    }

    /**
     * 搜索工作流
     */
    @GetMapping("/search")
    public ApiResponse<WorkflowListResponse> searchWorkflows(@RequestParam("q") String keyword) {
        log.info("搜索工作流请求，关键词: {}", keyword);
        
        try {
            List<WorkflowDTO> workflows = workflowService.searchWorkflows(keyword);
            WorkflowListResponse response = new WorkflowListResponse();
            response.setData(workflows);
            response.setPagination(new PaginationInfo(workflows.size(), 1, workflows.size()));
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("搜索工作流失败: {}", e.getMessage(), e);
            return ApiResponse.error("搜索工作流失败: " + e.getMessage());
        }
    }

    /**
     * 增加工作流调用次数
     */
    @PostMapping("/{id}/increment")
    public ApiResponse<String> incrementCallCount(@PathVariable String id) {
        log.info("增加工作流调用次数请求，ID: {}", id);
        
        try {
            workflowService.incrementCallCount(id);
            return ApiResponse.success("调用次数增加成功");
        } catch (Exception e) {
            log.error("增加工作流调用次数失败: {}", e.getMessage(), e);
            return ApiResponse.error("增加工作流调用次数失败: " + e.getMessage());
        }
    }

    /**
     * 获取工作流前端跳转URL
     */
    @GetMapping("/frontend-url")
    public ApiResponse<String> getWorkflowFrontendUrl() {
        log.info("获取工作流前端跳转URL请求");
        
        try {
            String frontendUrl = workflowService.getWorkflowFrontendUrl();
            return ApiResponse.success(frontendUrl);
        } catch (Exception e) {
            log.error("获取工作流前端跳转URL失败: {}", e.getMessage(), e);
            return ApiResponse.error("获取工作流前端跳转URL失败: " + e.getMessage());
        }
    }

    /**
     * 工作流列表响应类
     */
    public static class WorkflowListResponse {
        private List<WorkflowDTO> data;
        private PaginationInfo pagination;
        
        public List<WorkflowDTO> getData() { return data; }
        public void setData(List<WorkflowDTO> data) { this.data = data; }
        public PaginationInfo getPagination() { return pagination; }
        public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
    }
    
    /**
     * 工作流详情响应类
     */
    public static class WorkflowDetailResponse {
        private WorkflowDTO data;
        
        public WorkflowDTO getData() { return data; }
        public void setData(WorkflowDTO data) { this.data = data; }
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