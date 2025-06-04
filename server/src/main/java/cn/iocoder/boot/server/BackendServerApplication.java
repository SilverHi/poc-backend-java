package cn.iocoder.boot.server;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * 后端服务主启动类
 *
 * @author backend-team
 */
@SpringBootApplication(scanBasePackages = {
    "cn.iocoder.boot.server",
    "cn.iocoder.boot.workflow"
})
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