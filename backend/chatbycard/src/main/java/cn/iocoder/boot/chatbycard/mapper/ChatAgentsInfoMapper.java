package cn.iocoder.boot.chatbycard.mapper;

import cn.iocoder.boot.chatbycard.entity.ChatAgentsInfo;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;

/**
 * AI代理配置信息Mapper接口
 *
 * @author backend-team
 */
@Mapper
public interface ChatAgentsInfoMapper extends BaseMapper<ChatAgentsInfo> {
    
} 