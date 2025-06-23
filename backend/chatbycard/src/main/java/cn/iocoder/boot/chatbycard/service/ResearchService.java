package cn.iocoder.boot.chatbycard.service;

import cn.iocoder.boot.chatbycard.dto.ResearchRequest;
import cn.iocoder.boot.chatbycard.dto.ResearchResponse;

/**
 * 研究查询服务接口
 *
 * @author backend-team
 */
public interface ResearchService {

    /**
     * 执行研究查询
     *
     * @param request 研究查询请求
     * @return 研究查询响应
     */
    ResearchResponse research(ResearchRequest request);
} 