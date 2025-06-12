import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Typography, Card, Tag, Space, message } from 'antd';
import { SendOutlined, PaperClipOutlined, AudioOutlined, CloseOutlined, FileTextOutlined, ToolOutlined, LinkOutlined, BugOutlined } from '@ant-design/icons';
import MessageCard from './MessageCard';
import StepCard from './StepCard';
import ConversationTurnCard from './ConversationTurnCard';
import { StepManager, ProcessStep } from './stepsConfig';
import { ConversationTurn, ConversationManager, ConversationState } from './types';

import { getDocumentsContent, incrementAgentCallCount, aiChat } from '../../../../api';
import type { AiChatRequest } from '../../../../api';

const { TextArea } = Input;
const { Text } = Typography;

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  timestamp: Date;
  
  // 用户消息相关
  userInput?: string;
  previousAiOutput?: string;
  referencedDocuments?: ReferencedDocument[];
  selectedAgent?: SelectedAgent;
  
  // AI回复相关
  aiResponse?: string;
  isTyping?: boolean;
}



interface ReferencedDocument {
  id: string;
  name: string;
  type: 'pdf' | 'doc' | 'txt' | 'md' | 'external';
  externalType?: 'confluence' | 'jira'; // 外部系统类型
}

interface SelectedAgent {
  id: string;
  name: string;
  type: 'workflow' | 'tool';
  description?: string;
  systemPrompt?: string;
  modelName?: string;
  temperature?: number;
  maxTokens?: number;
}

interface ChatAreaProps {
  referencedDocuments?: ReferencedDocument[];
  selectedAgent?: SelectedAgent | null;
  onRemoveDocument?: (docId: string) => void;
  onClearAgent?: () => void;
}


const ChatArea: React.FC<ChatAreaProps> = ({
  referencedDocuments = [],
  selectedAgent = null,
  onRemoveDocument,
  onClearAgent
}) => {
  // 新的对话回合状态管理
  const [conversationState, setConversationState] = useState<ConversationState>({
    turns: [],
    currentTurnId: undefined
  });
  
  // 兼容性：保持原有的状态（用于渐进式迁移）
  const [useNewStructure] = useState(true); // 开关：是否使用新结构
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastAiResponse, setLastAiResponse] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 创建步骤管理器
  const stepManagerRef = useRef<StepManager | null>(null);
  
  // 初始化步骤管理器
  useEffect(() => {
    stepManagerRef.current = new StepManager((steps) => {
      setProcessSteps(steps);
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, conversationState.turns]);

  // 新的辅助函数
  const handleEditAiResponse = (turnId: string, newContent: string) => {
    setConversationState(prev => ({
      ...prev,
      turns: ConversationManager.updateAiResponse(prev.turns, turnId, newContent, 'completed')
    }));
  };

  const getLastAiResponse = (): string => {
    if (useNewStructure) {
      const lastTurn = conversationState.turns[conversationState.turns.length - 1];
      const aiContent = lastTurn?.aiResponse.content || '';
      // 如果AI回复为空（去除空格后），则认为没有上次AI回复
      return aiContent.trim() === '' ? '' : aiContent;
    }
    // 对于旧结构也应用同样的逻辑
    return lastAiResponse.trim() === '' ? '' : lastAiResponse;
  };

  const handleSendMessage = async () => {
    // 检查是否有内容可以发送：用户输入、引用的文档、或上次AI回复
    const hasUserInput = inputValue.trim();
    const hasReferencedDocuments = referencedDocuments.length > 0;
    const hasPreviousAiOutput = getLastAiResponse();
    
    // 当三个内容任何一个有值时就可以发送消息
    const canSend = hasUserInput || hasReferencedDocuments || hasPreviousAiOutput;
    
    if (!canSend || isLoading) return;

    if (useNewStructure) {
      // 使用新的对话回合结构
      const newTurn = ConversationManager.createTurn(
        inputValue,
        referencedDocuments.length > 0 ? referencedDocuments : undefined,
        selectedAgent || undefined,
        getLastAiResponse() || undefined
      );
      
      // 设置正确的turnIndex
      newTurn.turnIndex = conversationState.turns.length;
      
      // 添加到对话状态
      setConversationState(prev => ({
        ...prev,
        turns: [...prev.turns, newTurn],
        currentTurnId: newTurn.id
      }));
      
      setInputValue('');
      setIsLoading(true);
      
      // 后续处理逻辑...
      await handleNewTurnProcessing(newTurn);
    } else {
      // 保持原有逻辑（兼容性）
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        userInput: inputValue,
        previousAiOutput: lastAiResponse || undefined,
        referencedDocuments: referencedDocuments.length > 0 ? referencedDocuments : undefined,
        selectedAgent: selectedAgent || undefined,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
      setIsLoading(true);
      
      // 继续原有的处理逻辑...
      await handleLegacyMessageProcessing();
    }
  };

  // 新的对话回合处理函数
  const handleNewTurnProcessing = async (turn: ConversationTurn) => {
    // 清空之前的步骤
    stepManagerRef.current?.clearSteps();

    try {
      // 确定需要执行的步骤
      const stepIds = ['INIT_PROCESSING'];
      const contexts: Record<string, any> = {
        'INIT_PROCESSING': { selectedAgent: turn.userInput.selectedAgent }
      };

      // 准备文档内容相关步骤
      let documentsWithContent: Array<{id: string, name: string, content: string}> = [];
      const actualDocuments = turn.userInput.referencedDocuments?.filter(doc => doc.type !== 'external') || [];
      
      if (actualDocuments.length > 0) {
        stepIds.push('RETRIEVE_DOCUMENTS');
        contexts['RETRIEVE_DOCUMENTS'] = { documentCount: actualDocuments.length };
      }

      // 准备Agent信息相关步骤
      let agentInfo = turn.userInput.selectedAgent;
      if (turn.userInput.selectedAgent && turn.userInput.selectedAgent.id) {
        stepIds.push('LOAD_AGENT_CONFIG');
        contexts['LOAD_AGENT_CONFIG'] = { agentName: turn.userInput.selectedAgent.name };
      }

      // AI服务调用步骤
      stepIds.push('CALL_AI_SERVICE');

      // 初始化所有步骤
      stepManagerRef.current?.initSteps(stepIds, contexts);

      // 开始按顺序执行步骤
      const executeStepsWithActions = async () => {
        // 步骤1: 开始处理
        stepManagerRef.current?.updateStepStatus('init_processing', 'processing');
        await new Promise(resolve => setTimeout(resolve, 300));
        stepManagerRef.current?.completeStep('init_processing');

        // 步骤2: 准备文档内容 (如果有引用文档)
        if (actualDocuments.length > 0) {
          stepManagerRef.current?.updateStepStatus('retrieve_documents', 'processing');
          
          const documentIds = actualDocuments.map(doc => doc.id);
          const documentsContentResponse = await getDocumentsContent(documentIds);
          
          if (documentsContentResponse.success && documentsContentResponse.data) {
            documentsWithContent = actualDocuments.map(doc => ({
              id: doc.id,
              name: doc.name,
              content: documentsContentResponse.data![doc.id] || 'Unable to retrieve document content'
            }));
          }
          
          stepManagerRef.current?.completeStep('retrieve_documents');
        }

        // 步骤3: 准备Agent信息 (如果选择了Agent)
        if (turn.userInput.selectedAgent && turn.userInput.selectedAgent.id) {
          stepManagerRef.current?.updateStepStatus('load_agent_config', 'processing');
          
          // 获取完整的Agent信息
          try {
            const response = await fetch(`http://localhost:8080/api/chatbycard/agents/${turn.userInput.selectedAgent.id}`);
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data && result.data.data) {
                const backendAgent = result.data.data;
                agentInfo = {
                  ...turn.userInput.selectedAgent,
                  systemPrompt: backendAgent.systemPrompt || '',
                  modelName: backendAgent.modelName || 'gpt-4o-mini',
                  temperature: backendAgent.temperature,
                  maxTokens: backendAgent.maxTokens
                };
              }
            }
          } catch (error) {
            console.warn('Failed to retrieve Agent information:', error);
          }
          
          stepManagerRef.current?.completeStep('load_agent_config');
        }

        // 步骤4: 调用后端AI服务
        stepManagerRef.current?.updateStepStatus('call_ai_service', 'processing');
        
        return { agentInfo, documentsWithContent };
      };

      // 执行所有步骤
      const { agentInfo: finalAgentInfo, documentsWithContent: finalDocuments } = await executeStepsWithActions();

      // 准备AI聊天请求数据 (外部系统引用不传递给API)
      const aiChatRequest: AiChatRequest = {
        agentId: finalAgentInfo?.id || undefined,
        documentIds: actualDocuments.length > 0 ? actualDocuments.map(doc => doc.id) : undefined,
        userInput: turn.userInput.content || undefined,
        previousAiOutput: turn.userInput.previousAiOutput || undefined,
      };

      // 调用真实的AI聊天API
      const aiResponse = await aiChat(aiChatRequest);

      if (aiResponse.success && aiResponse.data) {
        // 如果使用了Agent，增加调用次数
        if (finalAgentInfo && finalAgentInfo.id) {
          await incrementAgentCallCount(finalAgentInfo.id);
        }

        // 完成AI服务调用步骤
        stepManagerRef.current?.completeStep('call_ai_service');

        // 更新对话回合的AI回复，并保存处理步骤
        setConversationState(prev => ({
          ...prev,
          turns: prev.turns.map(t => 
            t.id === turn.id 
              ? {
                  ...t,
                  aiResponse: {
                    ...t.aiResponse,
                    content: aiResponse.data?.content || '',
                    status: 'completed' as const,
                    timestamp: new Date()
                  },
                  processSteps: [...processSteps] // 保存当前的步骤
                }
              : t
          ),
          currentTurnId: undefined
        }));
        
        // 更新所有回复的可编辑状态
        setConversationState(prev => ({
          ...prev,
          turns: ConversationManager.updateEditableStatus(prev.turns)
        }));
        
        // 更新最后AI回复（兼容性）
        setLastAiResponse(aiResponse.data?.content || '');
      } else {
        // 处理AI聊天失败的情况
        stepManagerRef.current?.markStepAsError('call_ai_service');
        stepManagerRef.current?.addStep('AI_SERVICE_FAILED', { error: aiResponse.error });

        // 更新对话回合的错误回复，并保存处理步骤
        setConversationState(prev => ({
          ...prev,
          turns: prev.turns.map(t => 
            t.id === turn.id 
              ? {
                  ...t,
                  aiResponse: {
                    ...t.aiResponse,
                    content: `Sorry, an error occurred while processing your request: ${aiResponse.error || 'Unknown error'}`,
                    status: 'error' as const,
                    timestamp: new Date()
                  },
                  processSteps: [...processSteps] // 保存当前的步骤
                }
              : t
          ),
          currentTurnId: undefined
        }));
      }
    } catch (error) {
      console.error('Error occurred while processing message:', error);
      
      // Add error step
      stepManagerRef.current?.addStep('ERROR_OCCURRED', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });

      // 更新对话回合的错误回复，并保存处理步骤
      setConversationState(prev => ({
        ...prev,
        turns: prev.turns.map(t => 
          t.id === turn.id 
            ? {
                ...t,
                aiResponse: {
                  ...t.aiResponse,
                  content: `Sorry, an error occurred while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`,
                  status: 'error' as const,
                  timestamp: new Date()
                },
                processSteps: [...processSteps] // 保存当前的步骤
              }
            : t
        ),
        currentTurnId: undefined
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // 兼容性：保持原有的处理逻辑
  const handleLegacyMessageProcessing = async () => {
    // 清空之前的步骤
    stepManagerRef.current?.clearSteps();

    try {
      // 确定需要执行的步骤
      const stepIds = ['INIT_PROCESSING'];
      const contexts: Record<string, any> = {
        'INIT_PROCESSING': { selectedAgent }
      };

      // 准备文档内容相关步骤
      let documentsWithContent: Array<{id: string, name: string, content: string}> = [];
      const actualDocuments = referencedDocuments.filter(doc => doc.type !== 'external');
      
      if (actualDocuments.length > 0) {
        stepIds.push('RETRIEVE_DOCUMENTS');
        contexts['RETRIEVE_DOCUMENTS'] = { documentCount: actualDocuments.length };
      }

      // 准备Agent信息相关步骤
      let agentInfo = selectedAgent;
      if (selectedAgent && selectedAgent.id) {
        stepIds.push('LOAD_AGENT_CONFIG');
        contexts['LOAD_AGENT_CONFIG'] = { agentName: selectedAgent.name };
      }

      // AI服务调用步骤
      stepIds.push('CALL_AI_SERVICE');

      // 初始化所有步骤
      stepManagerRef.current?.initSteps(stepIds, contexts);

      // 开始按顺序执行步骤
      const executeStepsWithActions = async () => {
        // 步骤1: 开始处理
        stepManagerRef.current?.updateStepStatus('init_processing', 'processing');
        await new Promise(resolve => setTimeout(resolve, 300));
        stepManagerRef.current?.completeStep('init_processing');

        // 步骤2: 准备文档内容 (如果有引用文档)
        if (actualDocuments.length > 0) {
          stepManagerRef.current?.updateStepStatus('retrieve_documents', 'processing');
          
          const documentIds = actualDocuments.map(doc => doc.id);
          const documentsContentResponse = await getDocumentsContent(documentIds);
          
          if (documentsContentResponse.success && documentsContentResponse.data) {
            documentsWithContent = actualDocuments.map(doc => ({
              id: doc.id,
              name: doc.name,
              content: documentsContentResponse.data![doc.id] || 'Unable to retrieve document content'
            }));
          }
          
          stepManagerRef.current?.completeStep('retrieve_documents');
        }

        // 步骤3: 准备Agent信息 (如果选择了Agent)
        if (selectedAgent && selectedAgent.id) {
          stepManagerRef.current?.updateStepStatus('load_agent_config', 'processing');
          
          // 获取完整的Agent信息
          try {
            const response = await fetch(`http://localhost:8080/api/chatbycard/agents/${selectedAgent.id}`);
            if (response.ok) {
              const result = await response.json();
              if (result.success && result.data && result.data.data) {
                const backendAgent = result.data.data;
                agentInfo = {
                  ...selectedAgent,
                  systemPrompt: backendAgent.systemPrompt || '',
                  modelName: backendAgent.modelName || 'gpt-4o-mini',
                  temperature: backendAgent.temperature,
                  maxTokens: backendAgent.maxTokens
                };
              }
            }
          } catch (error) {
            console.warn('Failed to retrieve Agent information:', error);
          }
          
          stepManagerRef.current?.completeStep('load_agent_config');
        }

        // 步骤4: 调用后端AI服务
        stepManagerRef.current?.updateStepStatus('call_ai_service', 'processing');
        
        return { agentInfo, documentsWithContent };
      };

      // 执行所有步骤
      const { agentInfo: finalAgentInfo, documentsWithContent: finalDocuments } = await executeStepsWithActions();

      // 准备AI聊天请求数据 (外部系统引用不传递给API)
      const aiChatRequest: AiChatRequest = {
        agentId: finalAgentInfo?.id || undefined,
        documentIds: actualDocuments.length > 0 ? actualDocuments.map(doc => doc.id) : undefined,
        userInput: inputValue || undefined,
        previousAiOutput: lastAiResponse || undefined,
      };

      // 调用真实的AI聊天API
      const aiResponse = await aiChat(aiChatRequest);

      if (aiResponse.success && aiResponse.data) {
        // 如果使用了Agent，增加调用次数
        if (finalAgentInfo && finalAgentInfo.id) {
          await incrementAgentCallCount(finalAgentInfo.id);
        }

        // 完成AI服务调用步骤
        stepManagerRef.current?.completeStep('call_ai_service');

        // 创建AI回复消息
        const assistantReply: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          aiResponse: aiResponse.data.content,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantReply]);
        setLastAiResponse(aiResponse.data.content);
      } else {
        // 处理AI聊天失败的情况
        stepManagerRef.current?.markStepAsError('call_ai_service');
        stepManagerRef.current?.addStep('AI_SERVICE_FAILED', { error: aiResponse.error });

        // 创建错误回复
        const errorReply: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          aiResponse: `Sorry, an error occurred while processing your request: ${aiResponse.error || 'Unknown error'}`,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorReply]);
      }
    } catch (error) {
      console.error('Error occurred while processing message:', error);
      
      // Add error step
      stepManagerRef.current?.addStep('ERROR_OCCURRED', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });

      // Create error reply
      const errorReply: ChatMessage = {
        id: (Date.now() + 2).toString(),
        type: 'assistant',
        aiResponse: `Sorry, an error occurred while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const removeReferencedDocument = (docId: string) => {
    onRemoveDocument?.(docId);
  };

  const clearSelectedAgent = () => {
    onClearAgent?.();
  };

  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden">
      {/* 聊天区域 */}
      <div className="flex-1 overflow-auto px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 空状态提示 */}
          {((useNewStructure && conversationState.turns.length === 0) || (!useNewStructure && messages.length === 0)) && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="text-gray-600 text-xl font-medium">
                  开始您的AI对话
                </div>
                <div className="text-gray-400 text-sm space-y-2 leading-relaxed">
                  <p>选择文档资源和AI助手</p>
                  <p>输入您的问题开始对话</p>
                  <p>体验智能工作流</p>
                  {useNewStructure && (
                    <p className="text-green-500 text-xs">🚀 使用新的对话回合结构</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* 对话显示 */}
          {useNewStructure ? (
            /* 新的对话回合显示 - 保持三个独立卡片的结构 */
            conversationState.turns.length > 0 && (
              <div className="space-y-8">
                {conversationState.turns.map((turn, index) => (
                  <div key={turn.id} className="relative">
                    {/* 1. 用户输入卡片 */}
                    <div className="relative">
                      <MessageCard
                        id={`${turn.id}_user`}
                        type="user"
                        timestamp={turn.timestamp}
                        userInput={turn.userInput.content}
                        previousAiOutput={turn.userInput.previousAiOutput}
                        referencedDocuments={turn.userInput.referencedDocuments}
                        selectedAgent={turn.userInput.selectedAgent}
                      />
                    </div>
                    
                    {/* 2. 处理步骤卡片 - 显示当前处理中或已完成的步骤 */}
                    {((conversationState.currentTurnId === turn.id && processSteps.length > 0) ||
                      (turn.processSteps && turn.processSteps.length > 0)) && (
                      <div className="mt-8 space-y-4">
                        {/* 优先显示当前processSteps，否则显示保存的processSteps */}
                        {(conversationState.currentTurnId === turn.id ? processSteps : turn.processSteps || []).map((step, stepIndex) => (
                          <div key={step.id} className="relative">
                            <StepCard
                              id={step.id}
                              content={step.content}
                              status={step.status}
                              timestamp={step.timestamp}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* 3. AI回复卡片 - 在AI完成回复后显示（包括空回复） */}
                    {(turn.aiResponse.status === 'completed' || turn.aiResponse.status === 'error' || turn.aiResponse.content) && (
                      <div className="mt-8">
                        <MessageCard
                          id={`${turn.id}_assistant`}
                          type="assistant"
                          timestamp={turn.aiResponse.timestamp || turn.timestamp}
                          aiResponse={turn.aiResponse.content}
                          isTyping={turn.aiResponse.status === 'pending' || turn.aiResponse.status === 'streaming'}
                          isEditable={turn.aiResponse.isEditable}
                          onEditSave={(newContent) => handleEditAiResponse(turn.id, newContent)}
                        />
                        

                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            /* 原有的消息显示（兼容性） */
            messages.length > 0 && (
              <div className="space-y-8">
                {messages.map((message, index) => (
                <div key={message.id} className="relative">
                  {/* 消息卡片 */}
                  <div className="relative">
                    <MessageCard
                      id={message.id}
                      type={message.type}
                      timestamp={message.timestamp}
                      userInput={message.userInput}
                      previousAiOutput={message.previousAiOutput}
                      referencedDocuments={message.referencedDocuments}
                      selectedAgent={message.selectedAgent}
                      aiResponse={message.aiResponse}
                      isTyping={message.isTyping}
                    />
                  </div>
                  
                  {/* 如果是用户消息，显示对应的处理步骤 */}
                  {message.type === 'user' && processSteps.length > 0 && (
                    <div className="mt-8 space-y-4">
                      {processSteps.map((step, stepIndex) => (
                        <div key={step.id} className="relative">
                          <StepCard
                            id={step.id}
                            content={step.content}
                            status={step.status}
                            timestamp={step.timestamp}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="bg-gray-50 rounded-b-xl">
        <div className="max-w-3xl mx-auto p-6">
          {/* Agent选择卡片头部 */}
          {selectedAgent && (
            <div className="mb-4 p-3 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <ToolOutlined className="text-blue-600 text-sm" />
                  </div>
                  <div>
                    <Text className="font-medium text-blue-900">{selectedAgent.name}</Text>
                    {selectedAgent.description && (
                      <Text className="text-xs text-blue-700 ml-2">{selectedAgent.description}</Text>
                    )}
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md font-medium">
                    {selectedAgent.type === 'workflow' ? 'Workflow' : 'Tool'}
                  </span>
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={clearSelectedAgent}
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                />
              </div>
            </div>
          )}

          {/* 主输入卡片 */}
          <div className="bg-white shadow-lg border border-gray-200 rounded-lg p-4">
            {/* 引用文档区域 */}
            {referencedDocuments.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-3">
                  <FileTextOutlined className="text-gray-600 mr-2" />
                  <Text className="text-sm text-gray-600 font-medium">Referenced Documents</Text>
                </div>
                <Space wrap>
                  {referencedDocuments.map((doc) => {
                    const getDocIcon = (doc: ReferencedDocument) => {
                      if (doc.type === 'external') {
                        switch (doc.externalType) {
                          case 'confluence':
                            return <FileTextOutlined className="text-blue-500" />;
                          case 'jira':
                            return <BugOutlined className="text-blue-500" />;
                          default:
                            return <LinkOutlined className="text-blue-500" />;
                        }
                      }
                      return <FileTextOutlined className="text-gray-500" />;
                    };

                    const getTagClass = (doc: ReferencedDocument) => {
                      if (doc.type === 'external') {
                        return "flex items-center space-x-1 px-2 py-1 bg-blue-50 border border-blue-300";
                      }
                      return "flex items-center space-x-1 px-2 py-1 bg-white border border-gray-300";
                    };

                    return (
                      <Tag
                        key={doc.id}
                        closable
                        onClose={() => removeReferencedDocument(doc.id)}
                        className={getTagClass(doc)}
                      >
                        {getDocIcon(doc)}
                        <span className="text-sm">{doc.name}</span>
                        {doc.type === 'external' && (
                          <span className="text-xs opacity-75 ml-1">
                            ({doc.externalType?.toUpperCase()})
                          </span>
                        )}
                      </Tag>
                    );
                  })}
                </Space>
              </div>
            )}

            {/* 输入框区域 */}
            <div className="flex items-end space-x-3">
              <div className="flex space-x-2">
                <Button 
                  type="text" 
                  icon={<PaperClipOutlined />}
                  className="text-gray-400 hover:text-gray-600"
                  size="small"
                  title="Add document reference"
                />
                <Button 
                  type="text" 
                  icon={<AudioOutlined />}
                  className="text-gray-400 hover:text-gray-600"
                  size="small"
                  title="Voice input"
                />
              </div>
              
              <div className="flex-1">
                <TextArea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    selectedAgent 
                      ? `Message using ${selectedAgent.name}...`
                      : referencedDocuments.length > 0
                        ? "Ask questions based on selected documents..."
                        : getLastAiResponse()
                          ? "Continue the conversation..."
                          : "Send a message to ChatbyCard..."
                  }
                  autoSize={{ minRows: 1, maxRows: 6 }}
                  className="border-0 resize-none focus:shadow-none"
                  style={{ 
                    boxShadow: 'none',
                    padding: '8px 0'
                  }}
                  disabled={isLoading}
                />
              </div>
              
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSendMessage}
                disabled={(!inputValue.trim() && referencedDocuments.length === 0 && !getLastAiResponse()) || isLoading}
                className="bg-black hover:bg-gray-800 border-black rounded-lg px-6"
                size="large"
              />
            </div>
          </div>
          
          

        </div>
      </div>
    </div>
  );
};

export default ChatArea; 