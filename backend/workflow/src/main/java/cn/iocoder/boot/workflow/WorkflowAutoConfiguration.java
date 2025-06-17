package cn.iocoder.boot.workflow;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * 工作流自动配置类
 *
 * @author workflow-team
 */
@Configuration
@ComponentScan(basePackages = "cn.iocoder.boot.workflow")
@EntityScan(basePackages = "cn.iocoder.boot.workflow.entity")
@EnableJpaRepositories(basePackages = "cn.iocoder.boot.workflow.repository")
public class WorkflowAutoConfiguration {
} 