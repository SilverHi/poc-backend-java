package cn.iocoder.boot.server;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * 后端服务主启动类
 *
 * @author backend-team
 */
@SpringBootApplication(scanBasePackages = {
    "cn.iocoder.boot.server",
    "cn.iocoder.boot.workflow",
    "cn.iocoder.boot.chatbycard"
})
@MapperScan(basePackages = {
    "cn.iocoder.boot.server.mapper",
    "cn.iocoder.boot.workflow.mapper",
    "cn.iocoder.boot.chatbycard.mapper"
})
@EntityScan(basePackages = "cn.iocoder.boot.workflow.entity")
@EnableJpaRepositories(basePackages = "cn.iocoder.boot.workflow.repository")
public class BackendServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendServerApplication.class, args);
        System.out.println("(♥◠‿◠)ﾉﾞ  后端服务启动成功   ლ(´ڡ`ლ)ﾞ");
        System.out.println(" _____                 _                   _ ");
        System.out.println("| __ )  __ _  ___| | _____ _ __   __| |");
        System.out.println("|  _ \\ / _` |/ __| |/ / _ \\ '_ \\ / _` |");
        System.out.println("| |_) | (_| | (__|   <  __/ | | | (_| |");
        System.out.println("|____/ \\__,_|\\___|_|\\_\\___|_| |_|\\__,_|");
    }
} 