package cn.iocoder.boot.chatbycard.dto;

import lombok.Data;

import javax.validation.constraints.Size;
import java.util.List;

/**
 * AI聊天请求数据传输对象
 *
 * @author backend-team
 */
@Data
public class AiChatRequest {

    /**
     * 选择的AI代理ID（可为空）
     */
    private String agentId;

    /**
     * 引用文档的ID列表（多选）
     */
    private List<String> documentIds;

    /**
     * 用户输入内容（可为空）
     */
    @Size(max = 10000, message = "用户输入内容不能超过10000个字符")
    private String userInput;

    /**
     * 上次AI回复内容（用于对话延续，可为空）
     */
    private String previousAiOutput;

}
