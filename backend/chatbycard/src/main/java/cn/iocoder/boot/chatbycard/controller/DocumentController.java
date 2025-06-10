package cn.iocoder.boot.chatbycard.controller;

import cn.iocoder.boot.chatbycard.dto.ApiResponse;
import cn.iocoder.boot.chatbycard.dto.DocumentDTO;
import cn.iocoder.boot.chatbycard.service.DocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 文档管理控制器
 *
 * @author backend-team
 */
@Slf4j
@RestController
@RequestMapping("/api/chatbycard/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    /**
     * 上传文档
     */
    @PostMapping("/upload")
    public DocumentUploadApiResponse uploadDocument(@RequestParam("file") MultipartFile file) {
        log.info("接收到文档上传请求: {}", file.getOriginalFilename());
        
        try {
            DocumentDTO document = documentService.uploadDocument(file);
            DocumentUploadApiResponse response = new DocumentUploadApiResponse();
            response.setSuccess(true);
            response.setDocument(document);
            response.setMessage("文档上传成功");
            response.setCode(200);
            return response;
        } catch (IllegalArgumentException e) {
            log.warn("文档上传参数错误: {}", e.getMessage());
            DocumentUploadApiResponse response = new DocumentUploadApiResponse();
            response.setSuccess(false);
            response.setError(e.getMessage());
            response.setCode(400);
            return response;
        } catch (Exception e) {
            log.error("文档上传失败: {}", e.getMessage(), e);
            DocumentUploadApiResponse response = new DocumentUploadApiResponse();
            response.setSuccess(false);
            response.setError("文档上传失败: " + e.getMessage());
            response.setCode(500);
            return response;
        }
    }
    
    /**
     * 文档上传响应类
     */
    public static class DocumentUploadApiResponse {
        private boolean success;
        private DocumentDTO document;
        private String error;
        private String message;
        private int code;
        
        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public DocumentDTO getDocument() { return document; }
        public void setDocument(DocumentDTO document) { this.document = document; }
        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public int getCode() { return code; }
        public void setCode(int code) { this.code = code; }
    }

    /**
     * 获取所有文档列表
     */
    @GetMapping
    public ApiResponse<DocumentListResponse> getAllDocuments() {
        log.info("获取文档列表请求");
        
        try {
            List<DocumentDTO> documents = documentService.getAllDocuments();
            DocumentListResponse response = new DocumentListResponse();
            response.setData(documents);
            response.setPagination(new PaginationInfo(documents.size(), 1, documents.size()));
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("获取文档列表失败: {}", e.getMessage(), e);
            return ApiResponse.error("获取文档列表失败: " + e.getMessage());
        }
    }
    
    /**
     * 文档列表响应类
     */
    public static class DocumentListResponse {
        private List<DocumentDTO> data;
        private PaginationInfo pagination;
        
        public List<DocumentDTO> getData() { return data; }
        public void setData(List<DocumentDTO> data) { this.data = data; }
        public PaginationInfo getPagination() { return pagination; }
        public void setPagination(PaginationInfo pagination) { this.pagination = pagination; }
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

    /**
     * 根据ID获取文档详情
     */
    @GetMapping("/{id}")
    public ApiResponse<DocumentDetailResponse> getDocumentById(@PathVariable String id) {
        log.info("获取文档详情请求，ID: {}", id);
        
        try {
            DocumentDTO document = documentService.getDocumentById(id);
            if (document == null) {
                return ApiResponse.error(404, "文档不存在");
            }
            DocumentDetailResponse response = new DocumentDetailResponse();
            response.setData(document);
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("获取文档详情失败: {}", e.getMessage(), e);
            return ApiResponse.error("获取文档详情失败: " + e.getMessage());
        }
    }
    
    /**
     * 文档详情响应类
     */
    public static class DocumentDetailResponse {
        private DocumentDTO data;
        
        public DocumentDTO getData() { return data; }
        public void setData(DocumentDTO data) { this.data = data; }
    }

    /**
     * 获取文档内容
     */
    @GetMapping("/{id}/content")
    public ApiResponse<DocumentContentResponse> getDocumentContent(@PathVariable String id) {
        log.info("获取文档内容请求，ID: {}", id);
        
        try {
            DocumentDTO document = documentService.getDocumentById(id);
            if (document == null) {
                return ApiResponse.error(404, "文档不存在");
            }
            
            // 获取完整的文档内容
            String content = documentService.getDocumentContent(id);
            DocumentContentResponse response = new DocumentContentResponse();
            response.setData(content);
            return ApiResponse.success(response);
        } catch (Exception e) {
            log.error("获取文档内容失败: {}", e.getMessage(), e);
            return ApiResponse.error("获取文档内容失败: " + e.getMessage());
        }
    }

    /**
     * 删除文档
     */
    @DeleteMapping("/{id}")
    public ApiResponse<Boolean> deleteDocument(@PathVariable String id) {
        log.info("删除文档请求，ID: {}", id);
        
        try {
            boolean success = documentService.deleteDocument(id);
            if (success) {
                return ApiResponse.success(true, "文档删除成功");
            } else {
                return ApiResponse.error(404, "文档不存在或删除失败");
            }
        } catch (Exception e) {
            log.error("删除文档失败: {}", e.getMessage(), e);
            return ApiResponse.error("删除文档失败: " + e.getMessage());
        }
    }
    
    /**
     * 文档内容响应类
     */
    public static class DocumentContentResponse {
        private String data;
        
        public String getData() { return data; }
        public void setData(String data) { this.data = data; }
    }
} 