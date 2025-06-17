package cn.iocoder.boot.workflow.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 工作流实体
 *
 * @author workflow-team
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "wf_workflow")
@EntityListeners(AuditingEntityListener.class)
public class Workflow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 工作流名称
     */
    @Column(name = "name", nullable = false, length = 255)
    private String name;

    /**
     * 工作流描述
     */
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    /**
     * 工作流配置（JSON格式）
     */
    @Column(name = "config", nullable = false, columnDefinition = "TEXT")
    private String config;

    /**
     * 工作流状态
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private WorkflowStatus status = WorkflowStatus.DRAFT;

    /**
     * 创建时间
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * 工作流状态枚举
     */
    public enum WorkflowStatus {
        DRAFT,    // 草稿
        ACTIVE,   // 激活
        ARCHIVED  // 归档
    }
} 