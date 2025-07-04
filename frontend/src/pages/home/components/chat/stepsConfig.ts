// Steps configuration file - unified management of all step text descriptions
export interface StepConfig {
  id: string;
  getContent: (context?: any) => string;
  delay?: number; // Delay time between steps (milliseconds)
}

// Step configurations
export const STEP_CONFIGS: Record<string, StepConfig> = {
  // Initial processing step
  INIT_PROCESSING: {
    id: 'init_processing',
    getContent: (context?: { selectedAgent?: any }) => 
      context?.selectedAgent 
        ? `Processing with ${context.selectedAgent.name}...`
        : 'Starting to process your request...',
    delay: 300
  },

  // Document content retrieval step
  RETRIEVE_DOCUMENTS: {
    id: 'retrieve_documents',
    getContent: (context?: { documentCount?: number }) => {
      const count = context?.documentCount || 0;
      return `Retrieving content from ${count} referenced document${count > 1 ? 's' : ''}...`;
    },
    delay: 800
  },

  // Agent configuration loading step
  LOAD_AGENT_CONFIG: {
    id: 'load_agent_config',
    getContent: (context?: { agentName?: string }) => 
      `Loading ${context?.agentName || 'Agent'} configuration...`,
    delay: 600
  },

  // AI service call step
  CALL_AI_SERVICE: {
    id: 'call_ai_service',
    getContent: () => 'Calling backend AI service...',
    delay: 1000
  },

  // Error handling step
  ERROR_OCCURRED: {
    id: 'error_occurred',
    getContent: (context?: { error?: string }) => 
      `Processing failed: ${context?.error || 'Unknown error'}`,
    delay: 0
  },

  // AI service call failure step
  AI_SERVICE_FAILED: {
    id: 'ai_service_failed',
    getContent: (context?: { error?: string }) => 
      `AI service call failed: ${context?.error || 'Unknown error'}`,
    delay: 0
  }
};

// Step status types
export type StepStatus = 'waiting' | 'processing' | 'completed' | 'error';

// Step data interface
export interface ProcessStep {
  id: string;
  content: string;
  status: StepStatus;
  timestamp: Date;
  retryData?: any; // 重试所需的数据
  retryCount?: number; // 重试次数
}

// Step manager class
export class StepManager {
  private steps: ProcessStep[] = [];
  private onUpdate: (steps: ProcessStep[]) => void;

  constructor(onUpdate: (steps: ProcessStep[]) => void) {
    this.onUpdate = onUpdate;
  }

  // Initialize all steps (all set to waiting status)
  initSteps(stepIds: string[], contexts: Record<string, any> = {}) {
    this.steps = stepIds.map(stepId => {
      const config = STEP_CONFIGS[stepId];
      if (!config) {
        throw new Error(`Step config not found for: ${stepId}`);
      }
      
      return {
        id: config.id,
        content: config.getContent(contexts[stepId]),
        status: 'waiting' as StepStatus,
        timestamp: new Date(),
        retryCount: 0
      };
    });
    
    this.onUpdate([...this.steps]);
  }

  // Execute steps sequentially
  async executeStepsSequentially(stepIds: string[], contexts: Record<string, any> = {}) {
    for (let i = 0; i < stepIds.length; i++) {
      const stepId = stepIds[i];
      const config = STEP_CONFIGS[stepId];
      
      if (!config) {
        console.warn(`Step config not found for: ${stepId}`);
        continue;
      }

      // Update current step to processing status
      this.updateStepStatus(config.id, 'processing');
      
      // Wait for specified time if delay is configured
      if (config.delay && config.delay > 0) {
        await new Promise(resolve => setTimeout(resolve, config.delay));
      }
    }
  }

  // Update single step status
  updateStepStatus(stepId: string, status: StepStatus) {
    this.steps = this.steps.map(step => 
      step.id === stepId 
        ? { ...step, status, timestamp: new Date() }
        : step
    );
    this.onUpdate([...this.steps]);
  }

  // Complete single step
  completeStep(stepId: string) {
    this.updateStepStatus(stepId, 'completed');
  }

  // Complete all steps
  completeAllSteps() {
    this.steps = this.steps.map(step => ({
      ...step,
      status: 'completed' as StepStatus,
      timestamp: new Date()
    }));
    this.onUpdate([...this.steps]);
  }

  // Mark step as error status with retry data
  markStepAsError(stepId: string, retryData?: any) {
    this.steps = this.steps.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            status: 'error' as StepStatus, 
            timestamp: new Date(),
            retryData 
          }
        : step
    );
    this.onUpdate([...this.steps]);
  }

  // Retry a failed step
  retryStep(stepId: string): ProcessStep | null {
    const step = this.steps.find(s => s.id === stepId);
    if (!step || step.status !== 'error') {
      return null;
    }

    // Update retry count and reset status to processing
    this.steps = this.steps.map(s => 
      s.id === stepId 
        ? { 
            ...s, 
            status: 'processing' as StepStatus, 
            timestamp: new Date(),
            retryCount: (s.retryCount || 0) + 1
          }
        : s
    );
    this.onUpdate([...this.steps]);
    
    return this.steps.find(s => s.id === stepId) || null;
  }

  // Add new step (for error handling etc.)
  addStep(stepId: string, context?: any) {
    const config = STEP_CONFIGS[stepId];
    if (!config) {
      console.warn(`Step config not found for: ${stepId}`);
      return;
    }

    const newStep: ProcessStep = {
      id: config.id,
      content: config.getContent(context),
      status: 'completed',
      timestamp: new Date(),
      retryCount: 0
    };

    this.steps.push(newStep);
    this.onUpdate([...this.steps]);
  }

  // Add workflow step with custom content
  addWorkflowStep(stepId: string, context: { nodeName: string; nodeIndex: number; status: StepStatus }, retryData?: any) {
    const newStep: ProcessStep = {
      id: stepId,
      content: `Node ${context.nodeIndex}: Processing with ${context.nodeName}...`,
      status: context.status,
      timestamp: new Date(),
      retryData,
      retryCount: 0
    };

    this.steps.push(newStep);
    this.onUpdate([...this.steps]);
    return stepId; // 返回stepId以便后续更新
  }

  // Update workflow step status
  updateWorkflowStep(stepId: string, status: StepStatus, content?: string, retryData?: any) {
    this.steps = this.steps.map(step => 
      step.id === stepId 
        ? { 
            ...step, 
            status, 
            content: content || step.content,
            timestamp: new Date(),
            retryData: retryData !== undefined ? retryData : step.retryData
          }
        : step
    );
    this.onUpdate([...this.steps]);
  }

  // Remove specific step
  removeStep(stepId: string) {
    this.steps = this.steps.filter(step => step.id !== stepId);
    this.onUpdate([...this.steps]);
  }

  // Clear all steps
  clearSteps() {
    this.steps = [];
    this.onUpdate([]);
  }

  // Get current steps
  getSteps(): ProcessStep[] {
    return [...this.steps];
  }

  // Get step by id
  getStepById(stepId: string): ProcessStep | undefined {
    return this.steps.find(step => step.id === stepId);
  }

  // Add existing step for retry (for historical steps)
  addExistingStep(step: ProcessStep) {
    // Check if step already exists
    const existingIndex = this.steps.findIndex(s => s.id === step.id);
    if (existingIndex >= 0) {
      // Update existing step
      this.steps[existingIndex] = {
        ...step,
        status: 'processing',
        timestamp: new Date(),
        retryCount: (step.retryCount || 0) + 1
      };
    } else {
      // Add new step
      this.steps.push({
        ...step,
        status: 'processing',
        timestamp: new Date(),
        retryCount: (step.retryCount || 0) + 1
      });
    }
    this.onUpdate([...this.steps]);
    return this.steps.find(s => s.id === step.id) || null;
  }
} 