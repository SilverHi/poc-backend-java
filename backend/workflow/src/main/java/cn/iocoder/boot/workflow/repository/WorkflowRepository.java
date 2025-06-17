package cn.iocoder.boot.workflow.repository;

import cn.iocoder.boot.workflow.entity.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 工作流数据访问接口
 *
 * @author workflow-team
 */
@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, Long> {

    /**
     * 根据状态查询工作流
     */
    List<Workflow> findByStatus(Workflow.WorkflowStatus status);

    /**
     * 根据名称查询工作流（支持模糊查询）
     */
    @Query("SELECT w FROM Workflow w WHERE w.name LIKE %:name%")
    List<Workflow> findByNameContaining(@Param("name") String name);

    /**
     * 根据名称和描述查询工作流（支持模糊查询）
     */
    @Query("SELECT w FROM Workflow w WHERE w.name LIKE %:keyword% OR w.description LIKE %:keyword%")
    List<Workflow> findByNameOrDescriptionContaining(@Param("keyword") String keyword);
} 