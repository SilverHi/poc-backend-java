import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Typography, Tag, Space } from 'antd';
import { SendOutlined, PaperClipOutlined, AudioOutlined, CloseOutlined, FileTextOutlined, ToolOutlined, LinkOutlined, BugOutlined, ApartmentOutlined } from '@ant-design/icons';
import MessageCard from './MessageCard';
import StepCard from './StepCard';

import { StepManager, ProcessStep } from './stepsConfig';
import { ConversationTurn, ConversationManager, ConversationState, ReferencedDocument, SelectedAgent, Workflow, WorkflowState, InputAreaState } from './types';

import { getDocumentsContent, incrementAgentCallCount, aiChat } from '../../../../api';
import type { AiChatRequest } from '../../../../api';

const { TextArea } = Input;
const { Text } = Typography;

interface ChatAreaProps {
  referencedDocuments?: ReferencedDocument[];
  selectedAgent?: SelectedAgent | null;
  selectedWorkflow?: Workflow | null;
  onRemoveDocument?: (docId: string) => void;
  onClearAgent?: () => void;
  onWorkflowComplete?: () => void;
  onClearWorkflow?: () => void;
  onClearConversation?: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({
  referencedDocuments = [],
  selectedAgent = null,
  selectedWorkflow = null,
  onRemoveDocument,
  onClearAgent,
  onWorkflowComplete,
  onClearWorkflow,
  onClearConversation
}) => {
  // 新的对话回合状态管理
  const [conversationState, setConversationState] = useState<ConversationState>({
    turns: [],
    currentTurnId: undefined
  });
  
  // 工作流状态管理
  const [workflowState, setWorkflowState] = useState<WorkflowState>({
    isExecuting: false,
    currentNodeIndex: 0,
    formValues: {},
    shouldStop: false
  });
  
  // 输入区域状态管理
  const [inputAreaState, setInputAreaState] = useState<InputAreaState>('normal');
  
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // 创建步骤管理器
  const stepManagerRef = useRef<StepManager | null>(null);
  
  // 初始化步骤管理器
  useEffect(() => {
    stepManagerRef.current = new StepManager((steps) => {
      setProcessSteps(steps);
    });
  }, []);

  // 清空对话函数
  const clearConversation = () => {
    setConversationState({
      turns: [],
      currentTurnId: undefined
    });
    setWorkflowState({
      isExecuting: false,
      currentNodeIndex: 0,
      formValues: {},
      shouldStop: false
    });
    setInputAreaState('normal');
    setProcessSteps([]);
    setInputValue('');
    setIsLoading(false);
    stepManagerRef.current?.clearSteps();
  };

  // 暴露清空函数给父组件
  useEffect(() => {
    // 将清空函数挂载到全局，供父组件调用
    (window as any).clearChatAreaConversation = clearConversation;
    
    return () => {
      delete (window as any).clearChatAreaConversation;
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationState.turns]);

  // 监听工作流选择变化
  useEffect(() => {
    if (selectedWorkflow && !workflowState.isExecuting) {
      // 如果选择了工作流且不在执行状态，切换到表单状态
      setInputAreaState('form');
    } else if (!selectedWorkflow) {
      // 如果清除了工作流选择，回到正常状态
      if (inputAreaState === 'form' || inputAreaState === 'executing') {
        setInputAreaState('normal');
      }
    }
  }, [selectedWorkflow, inputAreaState, workflowState.isExecuting]);

  // 新的辅助函数
  const handleEditAiResponse = (turnId: string, newContent: string) => {
    setConversationState(prev => ({
      ...prev,
      turns: ConversationManager.updateAiResponse(prev.turns, turnId, newContent, 'completed')
    }));
  };

  // 工作流相关函数
  
  // 变量替换函数
  const replaceVariables = (template: string, values: Record<string, string>, lastResponse?: string): string => {
    if (!template) {
      console.warn('Template is empty or undefined');
      return '';
    }

    let result = template;
    
    // 替换{{变量名}}占位符 - 转义大括号
    Object.entries(values).forEach(([key, value]) => {
      const placeholder = `\\{\\{${key}\\}\\}`;
      // 确保value不是undefined，如果是则使用空字符串
      const safeValue = value || '';
      result = result.replace(new RegExp(placeholder, 'g'), safeValue);
      console.log(`Replacing ${placeholder} with "${safeValue}" in template`);
    });
    
    // 如果有上一个Agent回复，添加到开头
    if (lastResponse && lastResponse.trim()) {
      result = `${lastResponse}\n\n${result}`;
    }
    
    console.log(`Final processed prompt: "${result}"`);
    return result;
  };

  // 启动工作流
  const startWorkflow = (workflow: Workflow, formValues: Record<string, string>) => {
    setWorkflowState({
      isExecuting: true,
      currentWorkflow: workflow,
      currentNodeIndex: 0,
      formValues,
      shouldStop: false,
      lastAgentResponse: undefined
    });
    
    setInputAreaState('executing');
    
    // 创建首个用户输入Card（包含表单信息）
    const initialTurn = ConversationManager.createTurn(
      'Starting workflow execution...',
      referencedDocuments.length > 0 ? referencedDocuments : undefined,
      selectedAgent || undefined,
      undefined
    );
    
    // 设置turnIndex
    initialTurn.turnIndex = conversationState.turns.length;
    
    // 添加表单数据到用户输入中
    initialTurn.userInput.workflowFormData = formValues;
    initialTurn.userInput.workflowInfo = {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description
    };
    
    setConversationState(prev => ({
      ...prev,
      turns: [...prev.turns, initialTurn],
      currentTurnId: initialTurn.id
    }));
    
    // 开始执行第一个节点
    setTimeout(() => executeCurrentNode(0, workflow, formValues), 1000);
  };

  // 执行当前节点
  const executeCurrentNode = async (nodeIndex: number, workflow: Workflow, formValues: Record<string, string>, lastResponse?: string) => {
    if (workflowState.shouldStop) {
      stopWorkflow();
      return;
    }

    const currentNode = workflow.nodes[nodeIndex];
    if (!currentNode) {
      // 所有节点执行完毕
      completeWorkflow();
      return;
    }

    // 调试信息：打印当前节点信息
    console.log(`Executing node ${nodeIndex}: ${currentNode.name}, id: "${currentNode.id}" (type: ${typeof currentNode.id})`);
    console.log('Full node object:', currentNode);
    console.log('Available node keys:', Object.keys(currentNode));

    // 检查是否是开始节点
    if (currentNode.id === "-1") {
      // 跳过开始节点，直接执行下一个
      console.log(`Skipping start node: ${currentNode.name}`);
      const nextIndex = nodeIndex + 1;
      if (nextIndex < workflow.nodes.length) {
        executeCurrentNode(nextIndex, workflow, formValues, lastResponse);
      } else {
        completeWorkflow();
      }
      return;
    }

    // 检查是否是结束节点
    if (currentNode.id === "-2") {
      // 到达结束节点，完成工作流
      console.log(`Reached end node: ${currentNode.name}, completing workflow`);
      completeWorkflow();
      return;
    }

    // 执行Agent节点
    await executeAgentNode(nodeIndex, workflow, formValues, lastResponse);
  };

  // 执行Agent节点
  const executeAgentNode = async (nodeIndex: number, workflow: Workflow, formValues: Record<string, string>, lastResponse?: string) => {
    const currentNode = workflow.nodes[nodeIndex];
    
    if (!currentNode) {
      console.error('Current node is undefined at index:', nodeIndex);
      stopWorkflow();
      return;
    }

    // 处理user_prompt为null或'null'的情况
    const userPrompt = currentNode.user_prompt === 'null' || currentNode.user_prompt === null || !currentNode.user_prompt 
      ? '' 
      : currentNode.user_prompt;
    
    // 更新当前节点索引
    setWorkflowState(prev => ({
      ...prev,
      currentNodeIndex: nodeIndex,
      lastAgentResponse: lastResponse
    }));

    // 首先尝试替换变量
    console.log(`Original userPrompt: "${userPrompt}"`);
    console.log(`Form values:`, formValues);
    let processedPrompt = replaceVariables(userPrompt, formValues, lastResponse);

    // 如果替换后还是空的，检查是否有上个AI的输出
    if (!processedPrompt || processedPrompt.trim() === '') {
      if (lastResponse && lastResponse.trim() !== '') {
        // 如果有上个AI的输出，使用上个AI的输出作为prompt
        processedPrompt = lastResponse;
        console.log(`Node ${currentNode.name} using previous AI response as prompt`);
      } else {
        console.warn(`Node ${currentNode.name} has no prompt and no previous AI response, skipping API call`);
        
        // 如果既没有prompt也没有上个AI的输出，跳过这个节点
        const nextIndex = nodeIndex + 1;
        if (nextIndex < workflow.nodes.length && !workflowState.shouldStop) {
          setTimeout(() => {
            executeCurrentNode(nextIndex, workflow, formValues, lastResponse);
          }, 500);
        } else {
          completeWorkflow();
        }
        return;
      }
    }

    // 创建用户输入Card
    const userTurn = ConversationManager.createTurn(
      processedPrompt,
      referencedDocuments.length > 0 ? referencedDocuments : undefined,
      { 
        id: currentNode.id, 
        name: currentNode.name, 
        type: 'tool',
        description: `Workflow node: ${currentNode.name}`
      },
      lastResponse
    );
    
    userTurn.turnIndex = conversationState.turns.length;
    
    setConversationState(prev => ({
      ...prev,
      turns: [...prev.turns, userTurn],
      currentTurnId: userTurn.id
    }));

    // 为当前节点创建唯一的步骤ID
            const nodeStepId = `workflow_node_${nodeIndex}_${currentNode.id}`;
    
    // 添加当前节点的处理步骤，不清除之前的steps
    stepManagerRef.current?.addWorkflowStep(nodeStepId, {
      nodeName: currentNode.name,
      nodeIndex: nodeIndex + 1,
      status: 'processing'
    });

    setIsLoading(true);

    try {
      // 调用AI API
      const aiResponse = await aiChat({
                  agentId: currentNode.id,
        userInput: processedPrompt,
        previousAiOutput: lastResponse,
        documentIds: referencedDocuments.length > 0 ? referencedDocuments.map(doc => doc.id) : undefined
      });

      if (aiResponse.success && aiResponse.data) {
        // 完成当前节点的步骤
        stepManagerRef.current?.updateWorkflowStep(nodeStepId, 'completed', 
          `Node ${nodeIndex + 1}: Completed processing with ${currentNode.name}`);

        // 更新AI回复，并保存所有步骤历史到该turn
        const allSteps = stepManagerRef.current?.getSteps() || [];
        
        setConversationState(prev => ({
          ...prev,
          turns: prev.turns.map(t => 
            t.id === userTurn.id 
              ? {
                  ...ConversationManager.updateAiResponse([t], userTurn.id, aiResponse.data!.content, 'completed')[0],
                  processSteps: [...allSteps] // 保存所有步骤历史
                }
              : t
          )
        }));

        // 继续下一个节点
        const nextIndex = nodeIndex + 1;
        if (nextIndex < workflow.nodes.length && !workflowState.shouldStop) {
          setTimeout(() => {
            executeCurrentNode(nextIndex, workflow, formValues, aiResponse.data!.content);
          }, 1500);
        } else {
          completeWorkflow();
        }
      } else {
        // 处理错误 - 保存错误步骤到对应turn，添加重试数据
        const retryData = {
          type: 'workflow_node',
          nodeIndex,
          workflow,
          formValues,
          lastResponse,
          userTurnId: userTurn.id
        };
        stepManagerRef.current?.updateWorkflowStep(nodeStepId, 'error', 
          `Node ${nodeIndex + 1}: Error processing with ${currentNode.name} - ${aiResponse.error || 'Unknown error'}`, retryData);
        
        const allSteps = stepManagerRef.current?.getSteps() || [];
        
        setConversationState(prev => ({
          ...prev,
          turns: prev.turns.map(t => 
            t.id === userTurn.id 
              ? {
                  ...ConversationManager.updateAiResponse([t], userTurn.id, 
                    `Error: ${aiResponse.error || 'Unknown error'}`, 'error')[0],
                  processSteps: [...allSteps] // 保存所有步骤历史
                }
              : t
          )
        }));
        
        stopWorkflow();
      }
    } catch (error) {
      console.error('Error executing agent node:', error);
      const retryData = {
        type: 'workflow_node',
        nodeIndex,
        workflow,
        formValues,
        lastResponse,
        userTurnId: userTurn.id
      };
      stepManagerRef.current?.updateWorkflowStep(nodeStepId, 'error', 
        `Node ${nodeIndex + 1}: Error processing with ${currentNode.name} - ${error instanceof Error ? error.message : 'Unknown error'}`, retryData);
      
      const allSteps = stepManagerRef.current?.getSteps() || [];
      
      setConversationState(prev => ({
        ...prev,
        turns: prev.turns.map(t => 
          t.id === userTurn.id 
            ? {
                ...ConversationManager.updateAiResponse([t], userTurn.id, 
                  `Error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error')[0],
                processSteps: [...allSteps] // 保存所有步骤历史
              }
            : t
        )
      }));
      
      stopWorkflow();
    } finally {
      setIsLoading(false);
    }
  };

  // 停止工作流
  const stopWorkflow = () => {
    setWorkflowState(prev => ({
      ...prev,
      shouldStop: true,
      isExecuting: false
    }));
    
    setInputAreaState('normal');
    setIsLoading(false);
    
    // 清除工作流选择
    onClearWorkflow?.();
    onWorkflowComplete?.();
  };

  // 完成工作流
  const completeWorkflow = () => {
    // 在完成工作流前，将最终的步骤历史保存到最后一个工作流turn中
    const allSteps = stepManagerRef.current?.getSteps() || [];
    let lastWorkflowTurn = null;
    
    // 找到最后一个工作流turn
    for (let i = conversationState.turns.length - 1; i >= 0; i--) {
      if (conversationState.turns[i].userInput.workflowInfo) {
        lastWorkflowTurn = conversationState.turns[i];
        break;
      }
    }
    
    if (lastWorkflowTurn && allSteps.length > 0) {
      setConversationState(prev => ({
        ...prev,
        turns: prev.turns.map(t => 
          t.id === lastWorkflowTurn!.id 
            ? {
                ...t,
                processSteps: [...allSteps] // 保存完整的步骤历史
              }
            : t
        )
      }));
    }

    setWorkflowState({
      isExecuting: false,
      currentNodeIndex: 0,
      formValues: {},
      shouldStop: false
    });
    
    setInputAreaState('normal');
    setIsLoading(false);
    
    // 清除工作流选择，让用户可以进行正常对话或重新选择工作流
    onClearWorkflow?.();
    onWorkflowComplete?.();
  };

  const getLastAiResponse = (): string => {
    const lastTurn = conversationState.turns[conversationState.turns.length - 1];
    const aiContent = lastTurn?.aiResponse.content || '';
    // 如果AI回复为空（去除空格后），则认为没有上次AI回复
    return aiContent.trim() === '' ? '' : aiContent;
  };

  const handleSendMessage = async () => {
    // 如果是表单状态，处理工作流表单提交
    if (inputAreaState === 'form' && selectedWorkflow) {
      await handleWorkflowFormSubmit();
      return;
    }

    // 正常消息发送逻辑
    const hasUserInput = inputValue.trim();
    const hasReferencedDocuments = referencedDocuments.length > 0;
    const hasPreviousAiOutput = getLastAiResponse();
    
    const canSend = hasUserInput || hasReferencedDocuments || hasPreviousAiOutput;
    
    if (!canSend || isLoading) return;

    const newTurn = ConversationManager.createTurn(
      inputValue,
      referencedDocuments.length > 0 ? referencedDocuments : undefined,
      selectedAgent || undefined,
      getLastAiResponse() || undefined
    );
    
    newTurn.turnIndex = conversationState.turns.length;
    
    setConversationState(prev => ({
      ...prev,
      turns: [...prev.turns, newTurn],
      currentTurnId: newTurn.id
    }));
    
    setInputValue('');
    setIsLoading(true);
    
    await handleTurnProcessing(newTurn);
  };

  // 处理工作流表单提交
  const handleWorkflowFormSubmit = async () => {
    if (!selectedWorkflow) return;

    // 验证表单数据
    const formData: Record<string, string> = {};
    for (const variable of selectedWorkflow.vars) {
      const value = workflowState.formValues[variable.name];
      if (!value || value.trim() === '') {
        alert(`Please fill in the required field: ${variable.name}`);
        return;
      }
      formData[variable.name] = value.trim();
    }

    // 启动工作流
    startWorkflow(selectedWorkflow, formData);
  };

  // 新的对话回合处理函数
  const handleTurnProcessing = async (turn: ConversationTurn) => {
    // 清空之前的步骤
    // stepManagerRef.current?.clearSteps(); // 注释掉：不要清空历史步骤

    // 准备AI聊天请求数据 (外部系统引用不传递给API)
    let aiChatRequest: AiChatRequest = {
      agentId: undefined,
      documentIds: undefined,
      userInput: undefined,
      previousAiOutput: undefined,
    };

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
      aiChatRequest = {
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
        const allSteps = stepManagerRef.current?.getSteps() || [];
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
                  processSteps: [...allSteps] // 保存完整的步骤历史
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
      } else {
        // 处理AI聊天失败的情况
        const retryData = {
          type: 'ai_chat',
          request: aiChatRequest,
          turnId: turn.id
        };
        stepManagerRef.current?.markStepAsError('call_ai_service', retryData);
        stepManagerRef.current?.addStep('AI_SERVICE_FAILED', { error: aiResponse.error });

        // 更新对话回合的错误回复，并保存处理步骤
        const allStepsForError = stepManagerRef.current?.getSteps() || [];
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
                  processSteps: [...allStepsForError] // 保存完整的步骤历史
                }
              : t
          ),
          currentTurnId: undefined
        }));
      }
    } catch (error) {
      console.error('Error occurred while processing message:', error);
      
      // Add error step with retry data
      const retryData = {
        type: 'ai_chat',
        request: aiChatRequest,
        turnId: turn.id
      };
      stepManagerRef.current?.markStepAsError('call_ai_service', retryData);
      stepManagerRef.current?.addStep('ERROR_OCCURRED', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });

      // 更新对话回合的错误回复，并保存处理步骤
      const allStepsForCatchError = stepManagerRef.current?.getSteps() || [];
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
                processSteps: [...allStepsForCatchError] // 保存完整的步骤历史
              }
            : t
        ),
        currentTurnId: undefined
      }));
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

  const clearSelectedWorkflow = () => {
    setInputAreaState('normal');
    setWorkflowState({
      isExecuting: false,
      currentNodeIndex: 0,
      formValues: {},
      shouldStop: false
    });
    onClearWorkflow?.();
  };

  // 处理表单值变化
  const handleFormValueChange = (fieldName: string, value: string) => {
    setWorkflowState(prev => ({
      ...prev,
      formValues: {
        ...prev.formValues,
        [fieldName]: value
      }
    }));
  };

  // 重试失败的步骤
  const handleRetryStep = async (stepId: string) => {
    console.log('🔄 Attempting to retry step:', stepId);
    
    // 查找包含该步骤的turn和step信息
    let step: ProcessStep | undefined;
    let targetTurnId: string | undefined;
    
    // 从历史记录中查找步骤
    for (const turn of conversationState.turns) {
      if (turn.processSteps) {
        const historyStep = turn.processSteps.find(s => s.id === stepId);
        if (historyStep && historyStep.status === 'error' && historyStep.retryData) {
          step = historyStep;
          targetTurnId = turn.id;
          break;
        }
      }
    }
    
    if (!step || !targetTurnId) {
      console.warn('❌ Step not found in conversation history:', stepId);
      return;
    }
    
    console.log('✅ Found step for retry:', {
      stepId: step.id,
      turnId: targetTurnId,
      retryData: step.retryData
    });

    const retryData = step.retryData;
    
    // 为重试创建新的步骤 - 清空当前管理器并添加重试步骤
    stepManagerRef.current?.clearSteps();
    
    // 添加重试步骤
    const retryStepId = `${stepId}_retry_${Date.now()}`;
    stepManagerRef.current?.addExistingStep({
      ...step,
      id: retryStepId,
      status: 'processing',
      timestamp: new Date(),
      retryCount: (step.retryCount || 0) + 1
    });
    
    // 设置当前turn为重试的turn
    setConversationState(prev => ({
      ...prev,
      currentTurnId: targetTurnId
    }));

    try {
      // 根据重试数据的类型执行相应的重试逻辑
      if (retryData.type === 'ai_chat') {
        // AI聊天重试
        await retryAiChat(retryStepId, retryData);
      } else if (retryData.type === 'workflow_node') {
        // 工作流节点重试
        await retryWorkflowNode(retryStepId, retryData);
      } else {
        console.warn('Unknown retry type:', retryData.type);
        stepManagerRef.current?.markStepAsError(retryStepId, retryData);
      }
    } catch (error) {
      console.error('Retry failed:', error);
      stepManagerRef.current?.markStepAsError(retryStepId, retryData);
    }
  };

  // 重试AI聊天
  const retryAiChat = async (stepId: string, retryData: any) => {
    try {
      const aiResponse = await aiChat(retryData.request);
      
      if (aiResponse.success && aiResponse.data) {
        // 重试成功
        stepManagerRef.current?.completeStep(stepId);
        
        // 更新对应的对话回合，包括步骤状态
        const { turnId } = retryData;
        const allSteps = stepManagerRef.current?.getSteps() || [];
        setConversationState(prev => ({
          ...prev,
          turns: prev.turns.map(t => 
            t.id === turnId 
              ? {
                  ...t,
                  aiResponse: {
                    ...t.aiResponse,
                    content: aiResponse.data!.content,
                    status: 'completed' as const,
                    timestamp: new Date()
                  },
                  processSteps: allSteps.length > 0 ? [...allSteps] : t.processSteps
                }
              : t
          ),
          currentTurnId: undefined
        }));

        // 更新可编辑状态
        setConversationState(prev => ({
          ...prev,
          turns: ConversationManager.updateEditableStatus(prev.turns)
        }));
      } else {
        // 重试失败
        stepManagerRef.current?.markStepAsError(stepId, retryData);
        
        // 更新错误回复，包括步骤状态
        const { turnId } = retryData;
        const allStepsForRetryError = stepManagerRef.current?.getSteps() || [];
        setConversationState(prev => ({
          ...prev,
          turns: prev.turns.map(t => 
            t.id === turnId 
              ? {
                  ...t,
                  aiResponse: {
                    ...t.aiResponse,
                    content: `Retry failed: ${aiResponse.error || 'Unknown error'}`,
                    status: 'error' as const,
                    timestamp: new Date()
                  },
                  processSteps: allStepsForRetryError.length > 0 ? [...allStepsForRetryError] : t.processSteps
                }
              : t
          )
        }));
      }
    } catch (error) {
      stepManagerRef.current?.markStepAsError(stepId, retryData);
      throw error;
    }
  };

  // 重试工作流节点
  const retryWorkflowNode = async (stepId: string, retryData: any) => {
    const { nodeIndex, workflow, formValues, lastResponse } = retryData;
    
    try {
      // 重新执行工作流节点
      await executeAgentNode(nodeIndex, workflow, formValues, lastResponse);
    } catch (error) {
      stepManagerRef.current?.markStepAsError(stepId, retryData);
      throw error;
    }
  };

  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden">
      {/* 聊天区域 */}
      <div className="flex-1 overflow-auto px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 空状态提示 */}
          {conversationState.turns.length === 0 && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-6">
                <div className="text-gray-600 text-xl font-medium">
                  Start your AI conversation
                </div>
                <div className="text-gray-400 text-sm space-y-2 leading-relaxed">
                  <p>Select document resources and AI assistant</p>
                  <p>Enter your question to start the conversation</p>
                  <p>Experience intelligent workflows</p>
                </div>
              </div>
            </div>
          )}
          
          {/* 对话显示 */}
          {conversationState.turns.length > 0 && (
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
                      workflowFormData={turn.userInput.workflowFormData}
                      workflowInfo={turn.userInput.workflowInfo}
                    />
                  </div>
                  
                  {/* 2. 处理步骤卡片 - 永远显示所有步骤历史 */}
                  {(() => {
                    let stepsToShow: ProcessStep[] = [];
                    
                    // 如果是当前正在处理的turn，显示实时步骤
                    if (conversationState.currentTurnId === turn.id && processSteps.length > 0) {
                      stepsToShow = processSteps;
                    } 
                    // 否则显示已保存的步骤历史
                    else if (turn.processSteps && turn.processSteps.length > 0) {
                      stepsToShow = turn.processSteps;
                    }
                    
                    // 只要有步骤就显示
                    if (stepsToShow.length > 0) {
                      return (
                        <div className="mt-8 space-y-4">
                          {stepsToShow.map((step, stepIndex) => (
                            <div key={step.id} className="relative">
                              <StepCard
                                id={step.id}
                                content={step.content}
                                status={step.status}
                                timestamp={step.timestamp}
                                onRetry={step.status === 'error' ? handleRetryStep : undefined}
                                retryData={step.retryData}
                              />
                            </div>
                          ))}
                        </div>
                      );
                    }
                    
                    return null;
                  })()}
                  
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
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 输入区域 */}
      <div className="bg-gray-50 rounded-b-xl">
        <div className="max-w-3xl mx-auto p-6">
          {/* Agent选择卡片头部 */}
          {selectedAgent && !selectedWorkflow && (
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

          {/* 工作流选择卡片头部 */}
          {selectedWorkflow && !workflowState.isExecuting && (
            <div className="mb-4 p-3 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                    <ApartmentOutlined className="text-green-600 text-sm" />
                  </div>
                  <div>
                    <Text className="font-medium text-green-900">{selectedWorkflow.name}</Text>
                    {selectedWorkflow.description && (
                      <Text className="text-xs text-green-700 ml-2">{selectedWorkflow.description}</Text>
                    )}
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-md font-medium">
                    Workflow
                  </span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                    {selectedWorkflow.estimatedTime}
                  </span>
                </div>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={clearSelectedWorkflow}
                  className="text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
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

            {/* 动态输入区域 */}
            {inputAreaState === 'form' && selectedWorkflow ? (
              // 工作流表单
              <div className="space-y-4">
                <div className="mb-3">
                  <Text className="text-sm font-medium text-gray-700">
                    Workflow Variables
                  </Text>
                  <Text className="text-xs text-gray-500 block mt-1">
                    Please fill in all required variables to start the workflow
                  </Text>
                </div>
                
                {selectedWorkflow.vars.map((variable) => (
                  <div key={variable.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {variable.name} <span className="text-red-500">*</span>
                    </label>
                    <TextArea
                      placeholder={variable.description}
                      value={workflowState.formValues[variable.name] || ''}
                      onChange={(e) => handleFormValueChange(variable.name, e.target.value)}
                      autoSize={{ minRows: 2, maxRows: 4 }}
                      className="resize-none"
                    />
                    <Text className="text-xs text-gray-500">{variable.description}</Text>
                  </div>
                ))}
                
                <div className="flex justify-end pt-3">
                  <Button
                    type="primary"
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600"
                    icon={<SendOutlined />}
                  >
                    Start Workflow
                  </Button>
                </div>
              </div>
            ) : inputAreaState === 'executing' ? (
              // 执行状态 - 显示停止按钮
              <div className="text-center py-4">
                <Text className="text-gray-600 block mb-3">
                  Workflow is executing...
                </Text>
                <Button
                  type="default"
                  onClick={stopWorkflow}
                  disabled={isLoading}
                  className="border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600"
                >
                  Stop Workflow
                </Button>
              </div>
            ) : (
              // 正常输入框
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
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea; 