package cn.iocoder.boot.chatbycard.controller;

import cn.iocoder.boot.chatbycard.dto.ChatDocumentCreateDTO;
import cn.iocoder.boot.chatbycard.dto.ChatDocumentDTO;
import cn.iocoder.boot.chatbycard.dto.ChatDocumentUpdateDTO;
import cn.iocoder.boot.chatbycard.dto.PageResult;
import cn.iocoder.boot.chatbycard.service.ChatDocumentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 聊天文档管理控制器
 *
 * @author backend-team
 */
@Slf4j
@RestController
@RequestMapping("/api/chatbycard/documents")
@RequiredArgsConstructor
@Validated
public class ChatDocumentController {

    private final ChatDocumentService documentService;

    /**
     * 获取文档列表
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getDocumentList(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        
        PageResult<ChatDocumentDTO> documents = documentService.getDocumentList(keyword, type, page, size);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", documents.getContent());
        response.put("pagination", Map.of(
            "current", documents.getPage() + 1,
            "size", documents.getSize(),
            "total", documents.getTotalElements(),
            "pages", documents.getTotalPages()
        ));
        
        return ResponseEntity.ok(response);
    }

    /**
     * 上传文档
     */
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("file") @NotNull MultipartFile file,
            @RequestParam(required = false) String documentName) {
        
        try {
            ChatDocumentDTO document = documentService.uploadDocument(file, documentName);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "文档上传成功");
            response.put("data", document);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("文档上传失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "文档上传失败: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 创建文档
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createDocument(
            @Valid @RequestBody ChatDocumentCreateDTO createDTO) {
        
        try {
            ChatDocumentDTO document = documentService.createDocument(createDTO);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "文档创建成功");
            response.put("data", document);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("文档创建失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "文档创建失败: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 获取文档详情
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDocumentById(@PathVariable @NotNull Long id) {
        try {
            ChatDocumentDTO document = documentService.getDocumentById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", document);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("获取文档详情失败: {}", id, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 获取文档内容
     */
    @GetMapping("/{id}/content")
    public ResponseEntity<Map<String, Object>> getDocumentContent(@PathVariable @NotNull Long id) {
        try {
            String content = documentService.getDocumentContent(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", content);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("获取文档内容失败: {}", id, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 更新文档信息
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateDocument(
            @PathVariable @NotNull Long id,
            @Valid @RequestBody ChatDocumentUpdateDTO updateDTO) {
        
        try {
            ChatDocumentDTO document = documentService.updateDocument(id, updateDTO);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "文档更新成功");
            response.put("data", document);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("文档更新失败: {}", id, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "文档更新失败: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 删除文档
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteDocument(@PathVariable @NotNull Long id) {
        try {
            documentService.deleteDocument(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "文档删除成功");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("文档删除失败: {}", id, e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "文档删除失败: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 批量删除文档
     */
    @DeleteMapping("/batch")
    public ResponseEntity<Map<String, Object>> deleteDocuments(
            @RequestBody @NotEmpty List<Long> ids) {
        
        try {
            documentService.deleteDocuments(ids);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "批量删除成功，共删除 " + ids.size() + " 个文档");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("批量删除文档失败", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "批量删除失败: " + e.getMessage());
            
            return ResponseEntity.badRequest().body(response);
        }
    }

    /**
     * 获取文档统计信息
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getDocumentStatistics() {
        Map<String, Object> statistics = documentService.getDocumentStatistics();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", statistics);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 获取所有文档类型
     */
    @GetMapping("/types")
    public ResponseEntity<Map<String, Object>> getDocumentTypes() {
        List<String> types = documentService.getDocumentTypes();
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", types);
        
        return ResponseEntity.ok(response);
    }

    /**
     * 检查文档名称是否存在
     */
    @GetMapping("/check-name")
    public ResponseEntity<Map<String, Object>> checkDocumentName(
            @RequestParam String documentName) {
        
        boolean exists = documentService.existsByDocumentName(documentName);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("exists", exists);
        response.put("message", exists ? "文档名称已存在" : "文档名称可用");
        
        return ResponseEntity.ok(response);
    }
} 