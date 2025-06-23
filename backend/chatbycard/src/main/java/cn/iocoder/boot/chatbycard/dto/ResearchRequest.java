package cn.iocoder.boot.chatbycard.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 研究查询请求
 *
 * @author backend-team
 */
@Data
public class ResearchRequest {

    /**
     * 用户的完整查询问题
     */
    @NotBlank(message = "查询内容不能为空")
    private String query;

    /**
     * 思考深度，只能是3或6
     */
    @NotNull(message = "思考深度不能为空")
    private Integer maxNumber;
} 