import React from 'react';
import { Input, Select, Slider, InputNumber, Typography, Card, Button, message } from 'antd';
import { 
  SettingOutlined, 
  ToolOutlined, 
  ApartmentOutlined, 
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import type { AgentFormData } from '../index';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

interface AgentFormPanelProps {
  formData: AgentFormData;
  onFormDataChange: (data: Partial<AgentFormData>) => void;
}

const AgentFormPanel: React.FC<AgentFormPanelProps> = ({
  formData,
  onFormDataChange
}) => {
  // 可选的图标
  const iconOptions = [
    { value: 'robot', label: '🤖 Robot' },
    { value: 'user', label: '👤 User' },
    { value: 'bulb', label: '💡 Creative' },
    { value: 'code', label: '💻 Code' },
    { value: 'chart', label: '📊 Chart' },
    { value: 'service', label: '🛠️ Service' }
  ];

  // 可选的类型
  const typeOptions = [
    { value: 'assistant', label: 'General Assistant' },
    { value: 'specialist', label: 'Specialist Assistant' },
    { value: 'creative', label: 'Creative Assistant' },
    { value: 'analytical', label: 'Analytical Assistant' }
  ];

  // 可选的模型
  const modelOptions = [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
    { value: 'gpt-4o-mini', label: 'GPT-4o-mini' },
  ];

  // 处理添加工具
  const handleAddTool = () => {
    message.info('No tools available at the moment');
  };

  // 处理添加工作流
  const handleAddWorkflow = () => {
    message.info('No workflows available at the moment');
  };

  // 处理移除工具
  const handleRemoveTool = (index: number) => {
    const newTools = formData.tools.filter((_, i) => i !== index);
    onFormDataChange({ tools: newTools });
  };

  // 处理移除工作流
  const handleRemoveWorkflow = (index: number) => {
    const newWorkflows = formData.workflows.filter((_, i) => i !== index);
    onFormDataChange({ workflows: newWorkflows });
  };

  return (
    <div className="h-full flex flex-col rounded-xl overflow-hidden">
      {/* 头部 */}
      <div className="p-8 pb-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <SettingOutlined className="text-blue-600 text-sm" />
          </div>
          <Title level={4} className="m-0 text-gray-900 font-medium">
            Configuration
          </Title>
        </div>
        <Text className="text-gray-500 text-sm leading-relaxed">
          Set up your agent's basic information, model settings, and capabilities.
        </Text>
      </div>

      {/* 表单内容 */}
      <div className="flex-1 px-8 pb-8 overflow-auto">
        <div className="space-y-8">
          {/* 基本信息 */}
          <div className="space-y-6">
            <Title level={5} className="text-gray-900 mb-4 font-medium">
              Basic Information
            </Title>
            <div className="space-y-4">
              <div>
                <Text className="text-sm font-medium text-gray-700 block mb-2">
                  Agent Name <span className="text-red-500">*</span>
                </Text>
                <Input
                  value={formData.name}
                  onChange={(e) => onFormDataChange({ name: e.target.value })}
                  placeholder="Enter agent name"
                  maxLength={50}
                  showCount
                  className="border-gray-300 rounded-lg hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
              </div>

              <div>
                <Text className="text-sm font-medium text-gray-700 block mb-2">
                  Description <span className="text-red-500">*</span>
                </Text>
                <TextArea
                  value={formData.description}
                  onChange={(e) => onFormDataChange({ description: e.target.value })}
                  placeholder="Describe your agent's purpose and capabilities"
                  rows={3}
                  maxLength={200}
                  showCount
                  className="border-gray-300 rounded-lg hover:border-gray-400 focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Text className="text-sm font-medium text-gray-700 block mb-2">
                    Type
                  </Text>
                  <Select
                    value={formData.type}
                    onChange={(value) => onFormDataChange({ type: value })}
                    className="w-full"
                  >
                    {typeOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>

                <div>
                  <Text className="text-sm font-medium text-gray-700 block mb-2">
                    Icon
                  </Text>
                  <Select
                    value={formData.icon}
                    onChange={(value) => onFormDataChange({ icon: value })}
                    className="w-full"
                  >
                    {iconOptions.map(option => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* 模型配置 */}
          <div className="space-y-6">
            <Title level={5} className="text-gray-900 mb-4 font-medium">
              Model Settings
            </Title>
            <div className="space-y-4">
              <div>
                <Text className="text-sm font-medium text-gray-700 block mb-2">
                  Model Name
                </Text>
                <Select
                  value={formData.modelName}
                  onChange={(value) => onFormDataChange({ modelName: value })}
                  className="w-full"
                >
                  {modelOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </div>

              <div>
                <Text className="text-sm font-medium text-gray-700 block mb-2">
                  Temperature: {formData.temperature}
                </Text>
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  value={formData.temperature}
                  onChange={(value) => onFormDataChange({ temperature: value })}
                  marks={{
                    0: 'Conservative',
                    1: 'Balanced',
                    2: 'Creative'
                  }}
                />
                <Text className="text-xs text-gray-500">
                  Lower values produce more deterministic responses, higher values produce more creative responses
                </Text>
              </div>

              <div>
                <Text className="text-sm font-medium text-gray-700 block mb-2">
                  Max Tokens
                </Text>
                <InputNumber
                  value={formData.maxTokens}
                  onChange={(value) => onFormDataChange({ maxTokens: value || 2048 })}
                  min={1}
                  max={8192}
                  className="w-full"
                  formatter={(value) => `${value} tokens`}
                  parser={(value) => parseInt(value?.replace(' tokens', '') || '2048')}
                />
                <Text className="text-xs text-gray-500">
                  Controls the maximum length of responses, recommended: 1024-4096
                </Text>
              </div>
            </div>
          </div>

          {/* Skills技能配置 */}
          <div className="space-y-6">
            <Title level={5} className="text-gray-900 mb-4 font-medium">
              Capabilities
            </Title>
            
            {/* Tools工具 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ToolOutlined className="text-blue-500" />
                  <Text className="text-sm font-medium text-gray-700">
                    Tools
                  </Text>
                </div>
                <Button 
                  type="dashed" 
                  size="small" 
                  icon={<PlusOutlined />}
                  onClick={handleAddTool}
                >
                  Add Tool
                </Button>
              </div>
              
              {formData.tools.length > 0 ? (
                <div className="space-y-2">
                  {formData.tools.map((tool, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <Text className="text-sm">{tool}</Text>
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleRemoveTool(index)}
                        className="text-gray-400 hover:text-red-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
                  <Text className="text-gray-400 text-sm">
                    No tools added yet
                  </Text>
                </div>
              )}
            </div>

            {/* Workflows工作流 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <ApartmentOutlined className="text-purple-500" />
                  <Text className="text-sm font-medium text-gray-700">
                    Workflows
                  </Text>
                </div>
                <Button 
                  type="dashed" 
                  size="small" 
                  icon={<PlusOutlined />}
                  onClick={handleAddWorkflow}
                >
                  Add Workflow
                </Button>
              </div>
              
              {formData.workflows.length > 0 ? (
                <div className="space-y-2">
                  {formData.workflows.map((workflow, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <Text className="text-sm">{workflow}</Text>
                      <Button 
                        type="text" 
                        size="small" 
                        icon={<DeleteOutlined />} 
                        onClick={() => handleRemoveWorkflow(index)}
                        className="text-gray-400 hover:text-red-500"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
                  <Text className="text-gray-400 text-sm">
                    No workflows added yet
                  </Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentFormPanel; 