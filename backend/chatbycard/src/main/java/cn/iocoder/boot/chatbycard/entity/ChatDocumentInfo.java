package cn.iocoder.boot.chatbycard.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.OffsetDateTime;

/**
 * 聊天文档信息实体类
 *
 * @author backend-team
 */
@Data
@EqualsAndHashCode(callSuper = false)
@TableName("chat_document_info")
public class ChatDocumentInfo {

    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;

    /**
     * 文档名称
     */
    @TableField("document_name")
    private String documentName;

    /**
     * 文档类型
     */
    @TableField("document_type")
    private String documentType;

    /**
     * 文档全文内容
     */
    @TableField("content")
    private String content;

    /**
     * 文件大小(字节)
     */
    @TableField("file_size")
    private Long fileSize;

    /**
     * 上传时间
     */
    @TableField("upload_time")
    private OffsetDateTime uploadTime;

    /**
     * 创建时间
     */
    @TableField("create_time")
    private OffsetDateTime createTime;

    /**
     * 更新时间
     */
    @TableField("update_time")
    private OffsetDateTime updateTime;
} 