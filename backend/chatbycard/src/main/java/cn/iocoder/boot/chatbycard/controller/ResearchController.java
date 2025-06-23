package cn.iocoder.boot.chatbycard.controller;

import cn.iocoder.boot.chatbycard.dto.ApiResponse;
import cn.iocoder.boot.chatbycard.dto.ResearchRequest;
import cn.iocoder.boot.chatbycard.dto.ResearchResponse;
import cn.iocoder.boot.chatbycard.service.ResearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

/**
 * 研究查询控制器
 *
 * @author backend-team
 */
@Slf4j
@RestController
@RequestMapping("/api/chatbycard")
@RequiredArgsConstructor
public class ResearchController {

    private final ResearchService researchService;

    /**
     * 研究查询接口
     * 转发请求到外部FastAPI mock服务
     */
    @PostMapping("/research")
    public ApiResponse<ResearchResponse> research(@Valid @RequestBody ResearchRequest request) {
        log.info("接收到研究查询请求，查询内容: {}, 思考深度: {}", 
                request.getQuery(), 
                request.getMaxNumber());
        
        try {
            // 验证maxNumber参数
            if (request.getMaxNumber() != 3 && request.getMaxNumber() != 6) {
                return ApiResponse.error(400, "思考深度参数无效，只能是3或6");
            }
            
            // 调用服务层处理请求
            ResearchResponse response = researchService.research(request);
            
            log.info("研究查询请求处理成功，消耗token: {}", response.getConsumeToken());
            return ApiResponse.success(response, "研究查询处理成功");
            
        } catch (IllegalArgumentException e) {
            log.warn("研究查询请求参数错误: {}", e.getMessage());
            return ApiResponse.error(400, "请求参数错误: " + e.getMessage());
        } catch (Exception e) {
            log.error("研究查询请求处理失败: {}", e.getMessage(), e);
            return ApiResponse.error(500, "研究查询处理失败: " + e.getMessage());
        }
    }

    /**
     * 健康检查接口
     */
    @GetMapping("/research/health")
    public ApiResponse<String> health() {
        return ApiResponse.success("研究查询服务运行正常", "服务状态正常");
    }
} 