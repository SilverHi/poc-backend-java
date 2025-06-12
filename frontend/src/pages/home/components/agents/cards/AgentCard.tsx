import React from 'react';
import { Card, Avatar, Button, Tag, Typography, Dropdown, Modal, message } from 'antd';
import { MoreOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { deleteAgent } from '../../../../../api';

const { Text } = Typography;

interface Agent {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  model: string;
  capability: string[];
  category: string;
  callCount: number;
}

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (id: string) => void;
  formatCallCount: (count: number) => string;
  getIcon: (iconName: string) => React.ReactNode;
  onAgentUpdate?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  isSelected,
  onSelect,
  formatCallCount,
  getIcon,
  onAgentUpdate
}) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/agent-create/${agent.id}`);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除Agent "${agent.name}" 吗？此操作不可撤销。`,
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const result = await deleteAgent(agent.id);
          if (result.success) {
            message.success('Agent删除成功');
            if (onAgentUpdate) {
              onAgentUpdate();
            }
          } else {
            message.error(result.error || '删除失败');
          }
        } catch (error) {
          console.error('Delete agent error:', error);
          message.error('删除失败，请重试');
        }
      }
    });
  };

  const menuItems = [
    {
      key: 'edit',
      label: '编辑',
      icon: <EditOutlined />,
      onClick: handleEdit,
    },
    {
      key: 'delete',
      label: '删除',
      icon: <DeleteOutlined />,
      onClick: handleDelete,
      danger: true,
    },
  ];

  return (
    <Card
      hoverable
      className={`cursor-pointer transition-all duration-200 border rounded-lg ${
        isSelected
          ? 'border-blue-500 shadow-md bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      bodyStyle={{ padding: '12px' }}
      onClick={() => onSelect(agent.id)}
    >
      <div className="flex items-start space-x-3">
        <div className="relative">
          <Avatar 
            icon={getIcon(agent.icon)} 
            size={32}
            className={`${
              isSelected 
                ? 'bg-blue-500' 
                : 'bg-gray-500'
            }`}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <Text className="font-medium text-gray-800 truncate text-sm">
              {agent.name}
            </Text>
            <Dropdown 
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button 
                type="text" 
                size="small" 
                icon={<MoreOutlined />}
                className="text-gray-400 hover:text-gray-600"
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </div>
          
          <Text className="text-xs text-gray-500 block mb-1">
            {agent.description}
          </Text>
          
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-1">
              <span className="text-xs text-green-600 font-medium">
                Called {formatCallCount(agent.callCount)} times
              </span>
            </div>
            <Text className="text-xs text-gray-400">
              {agent.model}
            </Text>
          </div>
        
          {isSelected && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <Text className="text-xs text-gray-600 block mb-1">
                Capabilities:
              </Text>
              <div className="flex flex-wrap gap-1">
                {agent.capability.map((cap, index) => (
                  <Tag key={index} color="blue" className="text-xs">
                    {cap}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AgentCard; 