package cn.iocoder.boot.chatbycard.service.impl;

import cn.iocoder.boot.chatbycard.dto.DocumentDTO;
import cn.iocoder.boot.chatbycard.entity.ChatDocumentInfo;
import cn.iocoder.boot.chatbycard.mapper.ChatDocumentInfoMapper;
import cn.iocoder.boot.chatbycard.service.DocumentService;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 文档服务实现类
 *
 * @author backend-team
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentServiceImpl implements DocumentService {

    private final ChatDocumentInfoMapper documentMapper;

    @Override
    @Transactional
    public DocumentDTO uploadDocument(MultipartFile file) {
        log.info("开始上传文档: {}", file.getOriginalFilename());

        // 验证文件
        validateFile(file);

        try {
            // 读取文件内容
            String content = new String(file.getBytes(), StandardCharsets.UTF_8);
            
            // 创建文档实体
            ChatDocumentInfo document = new ChatDocumentInfo();
            document.setDocumentName(file.getOriginalFilename());
            document.setDocumentType(getFileExtension(file.getOriginalFilename()));
            document.setContent(content);
            document.setFileSize(file.getSize());
            document.setUploadTime(OffsetDateTime.now());
            document.setCreateTime(OffsetDateTime.now());
            document.setUpdateTime(OffsetDateTime.now());

            // 保存到数据库
            documentMapper.insert(document);

            log.info("文档上传成功，ID: {}", document.getId());

            // 异步处理文档内容
            processDocumentAsync(document.getId(), content);

            // 转换为DTO返回
            return convertToDTO(document);

        } catch (IOException e) {
            log.error("读取文件内容失败: {}", e.getMessage(), e);
            throw new RuntimeException("文件读取失败: " + e.getMessage());
        }
    }

    @Override
    public List<DocumentDTO> getAllDocuments() {
        log.info("获取所有文档列表");
        
        QueryWrapper<ChatDocumentInfo> queryWrapper = new QueryWrapper<>();
        queryWrapper.orderByDesc("create_time");
        
        List<ChatDocumentInfo> documents = documentMapper.selectList(queryWrapper);
        
        return documents.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public DocumentDTO getDocumentById(String id) {
        log.info("根据ID获取文档: {}", id);
        
        try {
            Long documentId = Long.parseLong(id);
            ChatDocumentInfo document = documentMapper.selectById(documentId);
            
            if (document == null) {
                log.warn("文档不存在，ID: {}", id);
                return null;
            }
            
            return convertToDTO(document);
        } catch (NumberFormatException e) {
            log.error("无效的文档ID: {}", id);
            return null;
        }
    }

    @Override
    @Transactional
    public boolean deleteDocument(String id) {
        log.info("删除文档，ID: {}", id);
        
        try {
            Long documentId = Long.parseLong(id);
            int result = documentMapper.deleteById(documentId);
            
            if (result > 0) {
                log.info("文档删除成功，ID: {}", id);
                return true;
            } else {
                log.warn("文档删除失败，文档不存在，ID: {}", id);
                return false;
            }
        } catch (NumberFormatException e) {
            log.error("无效的文档ID: {}", id);
            return false;
        }
    }

    @Override
    public String getDocumentContent(String id) {
        log.info("获取文档内容，ID: {}", id);
        
        try {
            Long documentId = Long.parseLong(id);
            ChatDocumentInfo document = documentMapper.selectById(documentId);
            
            if (document == null) {
                log.warn("文档不存在，ID: {}", id);
                return null;
            }
            
            return document.getContent();
        } catch (NumberFormatException e) {
            log.error("无效的文档ID: {}", id);
            return null;
        }
    }

    @Override
    @Async("documentProcessExecutor")
    public void processDocumentAsync(Long documentId, String content) {
        log.info("开始异步处理文档，ID: {}", documentId);
        
        try {
            // 模拟文档处理过程（可以在这里添加文本分析、索引构建等逻辑）
            Thread.sleep(2000); // 模拟处理时间
            
            // 这里可以添加更多的文档处理逻辑，比如：
            // 1. 文本分词
            // 2. 关键词提取
            // 3. 向量化
            // 4. 构建搜索索引
            
            log.info("文档处理完成，ID: {}", documentId);
            
        } catch (InterruptedException e) {
            log.error("文档处理被中断，ID: {}", documentId, e);
            Thread.currentThread().interrupt();
        } catch (Exception e) {
            log.error("文档处理失败，ID: {}", documentId, e);
        }
    }

    /**
     * 验证上传的文件
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.trim().isEmpty()) {
            throw new IllegalArgumentException("文件名不能为空");
        }

        // 检查文件类型
        String extension = getFileExtension(filename);
        if (!"txt".equalsIgnoreCase(extension)) {
            throw new IllegalArgumentException("目前仅支持txt格式文件");
        }

        // 检查文件大小（限制为10MB）
        long maxSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("文件大小不能超过10MB");
        }
    }

    /**
     * 获取文件扩展名
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1);
    }

    /**
     * 转换实体为DTO
     */
    private DocumentDTO convertToDTO(ChatDocumentInfo document) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(String.valueOf(document.getId()));
        dto.setDocumentName(document.getDocumentName());
        dto.setDocumentType(document.getDocumentType());
        dto.setFileSize(document.getFileSize());
        dto.setFileSizeFormatted(formatFileSize(document.getFileSize()));
        dto.setUploadTime(document.getUploadTime());
        dto.setCreateTime(document.getCreateTime());
        dto.setStatus("completed"); // 简化状态，实际项目中可以添加状态字段
        
        // 生成内容预览（前100个字符）
        if (document.getContent() != null && document.getContent().length() > 100) {
            dto.setPreview(document.getContent().substring(0, 100) + "...");
        } else {
            dto.setPreview(document.getContent());
        }
        
        return dto;
    }

    /**
     * 格式化文件大小
     */
    private String formatFileSize(Long sizeInBytes) {
        if (sizeInBytes == null || sizeInBytes == 0) {
            return "0 B";
        }
        
        String[] units = {"B", "KB", "MB", "GB"};
        double size = sizeInBytes.doubleValue();
        int unitIndex = 0;
        
        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }
        
        return String.format("%.1f %s", size, units[unitIndex]);
    }
} 