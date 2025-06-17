package cn.iocoder.boot.workflow.repository;

import cn.iocoder.boot.workflow.entity.WorkflowExecution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 工作流执行记录数据访问接口
 *
 * @author workflow-team
 */
@Repository
public interface WorkflowExecutionRepository extends JpaRepository<WorkflowExecution, Long> {

    /**
     * 根据工作流ID查询执行记录
     */
    List<WorkflowExecution> findByWorkflowId(Long workflowId);

    /**
     * 根据状态查询执行记录
     */
    List<WorkflowExecution> findByStatus(WorkflowExecution.ExecutionStatus status);

    /**
     * 根据工作流ID和状态查询执行记录
     */
    List<WorkflowExecution> findByWorkflowIdAndStatus(Long workflowId, WorkflowExecution.ExecutionStatus status);
} 