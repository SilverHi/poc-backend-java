import React from 'react';
import { Layout, Typography, Avatar, Button } from 'antd';
import { MessageOutlined, SettingOutlined, UserOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Text } = Typography;

interface NavigationProps {
  onClearConversation?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ onClearConversation }) => {
  const handleEditWorkflow = () => {
    window.open('/workflow', '_blank');
  };

  return (
    <Header className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
            <MessageOutlined className="text-white text-sm" />
          </div>
          <Text className="text-lg font-semibold text-gray-800">ChatbyCard</Text>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:block">
          <Button 
            type="text" 
            onClick={handleEditWorkflow} 
            icon={<EditOutlined />}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-0 transition-all duration-200 font-medium"
            size="middle"
          >
            <span>Edit Workflow</span>
          </Button>
        </div>
        <div className="hidden md:block">
          <Button 
            type="text" 
            onClick={onClearConversation} 
            icon={<DeleteOutlined />}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 border-0 transition-all duration-200 font-medium"
            size="middle"
          >
            <span>Clear conversation</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
            <SettingOutlined className="text-gray-600" />
          </div>
          <Avatar size="small" icon={<UserOutlined />} className="bg-gray-500" />
        </div>
      </div>
    </Header>
  );
};

export default Navigation; 