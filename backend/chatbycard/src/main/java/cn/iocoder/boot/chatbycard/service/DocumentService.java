package cn.iocoder.boot.chatbycard.service;

import cn.iocoder.boot.chatbycard.dto.DocumentDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 文档服务接口
 *
 * @author backend-team
 */
public interface DocumentService {

    /**
     * 上传文档
     *
     * @param file 上传的文件
     * @return 文档信息
     */
    DocumentDTO uploadDocument(MultipartFile file);

    /**
     * 获取所有文档列表
     *
     * @return 文档列表
     */
    List<DocumentDTO> getAllDocuments();

    /**
     * 根据ID获取文档
     *
     * @param id 文档ID
     * @return 文档信息
     */
    DocumentDTO getDocumentById(String id);

    /**
     * 删除文档
     *
     * @param id 文档ID
     * @return 是否删除成功
     */
    boolean deleteDocument(String id);

    /**
     * 获取文档内容
     *
     * @param id 文档ID
     * @return 文档内容
     */
    String getDocumentContent(String id);

    /**
     * 异步处理文档内容
     *
     * @param documentId 文档ID
     * @param content 文档内容
     */
    void processDocumentAsync(Long documentId, String content);
} 