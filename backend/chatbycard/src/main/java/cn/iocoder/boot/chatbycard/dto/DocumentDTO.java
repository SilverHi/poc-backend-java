package cn.iocoder.boot.chatbycard.dto;

import lombok.Data;

import java.time.OffsetDateTime;

/**
 * 文档数据传输对象
 *
 * @author backend-team
 */
@Data
public class DocumentDTO {

    /**
     * 文档ID
     */
    private String id;

    /**
     * 文档名称
     */
    private String documentName;

    /**
     * 文档类型
     */
    private String documentType;

    /**
     * 文件大小(字节)
     */
    private Long fileSize;

    /**
     * 格式化的文件大小
     */
    private String fileSizeFormatted;

    /**
     * 上传时间
     */
    private OffsetDateTime uploadTime;

    /**
     * 创建时间
     */
    private OffsetDateTime createTime;

    /**
     * 处理状态 (processing, completed, failed)
     */
    private String status;

    /**
     * 文档内容预览(前100个字符)
     */
    private String preview;
} 