// 对话相关的类型定义

export interface ReferencedDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'txt' | 'md' | 'external';
  externalType?: 'confluence' | 'jira';
}

export interface SelectedAgent {
  id: string;
  name: string;
  type: 'workflow' | 'tool';
  description?: string;
  systemPrompt?: string;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ProcessStep {
  id: string;
  content: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  timestamp: Date;
}

// 新的统一对话回合结构
export interface ConversationTurn {
  id: string;                    // 对话回合唯一ID
  turnIndex: number;             // 在对话中的位置索引 (从0开始)
  timestamp: Date;               // 对话开始时间
  
  // 用户输入部分
  userInput: {
    content: string;
    referencedDocuments?: ReferencedDocument[];
    selectedAgent?: SelectedAgent;
    previousAiOutput?: string;   // 延续对话时的上一次AI输出
  };
  
  // AI回复部分
  aiResponse: {
    content: string;
    status: 'pending' | 'streaming' | 'completed' | 'error';
    isEditable?: boolean;        // 是否可编辑
    timestamp?: Date;            // AI回复完成时间
  };
  
  // 处理步骤
  processSteps?: ProcessStep[];
}

// 对话状态管理
export interface ConversationState {
  turns: ConversationTurn[];     // 统一的对话回合数组
  currentTurnId?: string;        // 当前正在处理的回合ID
}

// 工具函数
export class ConversationManager {
  
  /**
   * 生成新的对话回合ID
   */
  static generateTurnId(): string {
    return `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * 创建新的对话回合
   */
  static createTurn(
    userInput: string,
    referencedDocuments?: ReferencedDocument[],
    selectedAgent?: SelectedAgent,
    previousAiOutput?: string
  ): ConversationTurn {
    return {
      id: this.generateTurnId(),
      turnIndex: 0, // 需要在添加到数组时计算
      timestamp: new Date(),
      userInput: {
        content: userInput,
        referencedDocuments,
        selectedAgent,
        previousAiOutput
      },
      aiResponse: {
        content: '',
        status: 'pending',
        isEditable: false
      },
      processSteps: []
    };
  }
  
  /**
   * 检查是否是最后一次AI回复
   */
  static isLastAiResponse(turns: ConversationTurn[], turnId: string): boolean {
    const lastTurn = turns[turns.length - 1];
    return lastTurn?.id === turnId && lastTurn.aiResponse.status === 'completed';
  }
  
  /**
   * 根据ID获取对话回合
   */
  static getTurnById(turns: ConversationTurn[], turnId: string): ConversationTurn | undefined {
    return turns.find(turn => turn.id === turnId);
  }
  
  /**
   * 根据索引获取对话回合
   */
  static getTurnByIndex(turns: ConversationTurn[], index: number): ConversationTurn | undefined {
    return turns[index];
  }
  
  /**
   * 更新AI回复内容
   */
  static updateAiResponse(
    turns: ConversationTurn[], 
    turnId: string, 
    content: string, 
    status: 'pending' | 'streaming' | 'completed' | 'error' = 'completed'
  ): ConversationTurn[] {
    const updatedTurns = turns.map(turn => 
      turn.id === turnId 
        ? {
            ...turn,
            aiResponse: {
              ...turn.aiResponse,
              content,
              status,
              timestamp: status === 'completed' ? new Date() : turn.aiResponse.timestamp
            }
          }
        : turn
    );
    
    // 更新所有回复的可编辑状态
    return this.updateEditableStatus(updatedTurns);
  }
  
  /**
   * 设置所有回复的可编辑状态
   */
  static updateEditableStatus(turns: ConversationTurn[]): ConversationTurn[] {
    return turns.map((turn, index) => ({
      ...turn,
      aiResponse: {
        ...turn.aiResponse,
        isEditable: index === turns.length - 1 && turn.aiResponse.status === 'completed'
      }
    }));
  }
} 