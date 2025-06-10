package cn.iocoder.boot.chatbycard.dto;

import lombok.Data;

/**
 * 统一API响应类
 *
 * @author backend-team
 */
@Data
public class ApiResponse<T> {

    /**
     * 是否成功
     */
    private boolean success;

    /**
     * 响应数据
     */
    private T data;

    /**
     * 错误信息
     */
    private String error;

    /**
     * 响应消息
     */
    private String message;

    /**
     * 响应码
     */
    private int code;

    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setData(data);
        response.setCode(200);
        return response;
    }

    public static <T> ApiResponse<T> success(T data, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setData(data);
        response.setMessage(message);
        response.setCode(200);
        return response;
    }

    public static <T> ApiResponse<T> error(String error) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setError(error);
        response.setCode(500);
        return response;
    }

    public static <T> ApiResponse<T> error(int code, String error) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setError(error);
        response.setCode(code);
        return response;
    }
} 