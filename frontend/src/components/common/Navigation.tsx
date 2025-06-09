import React from 'react';
import { Layout, Typography, Avatar } from 'antd';
import { MessageOutlined, SettingOutlined, UserOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Text } = Typography;

const Navigation: React.FC = () => {
  return (
    <Header className="bg-white border-b border-gray-200 px-6 h-16 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
            <MessageOutlined className="text-white text-sm" />
          </div>
          <Text className="text-lg font-semibold text-gray-800">ChatGPT</Text>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="hidden md:block">
          <Text className="text-sm text-gray-600">POC System</Text>
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