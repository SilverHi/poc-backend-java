package cn.iocoder.boot.workflow.entity;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * 工作流执行记录实体
 *
 * @author workflow-team
 */
@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "wf_execution")
@EntityListeners(AuditingEntityListener.class)
public class WorkflowExecution {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 工作流ID
     */
    @Column(name = "workflow_id", nullable = false)
    private Long workflowId;

    /**
     * 执行状态
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ExecutionStatus status = ExecutionStatus.PENDING;

    /**
     * 当前执行节点
     */
    @Column(name = "current_node", length = 255)
    private String currentNode;

    /**
     * 错误信息
     */
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    /**
     * 执行结果
     */
    @Column(name = "result", columnDefinition = "TEXT")
    private String result;

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
     * 完成时间
     */
    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    /**
     * 执行状态枚举
     */
    public enum ExecutionStatus {
        PENDING,    // 等待中
        RUNNING,    // 运行中
        COMPLETED,  // 已完成
        FAILED      // 失败
    }
} 