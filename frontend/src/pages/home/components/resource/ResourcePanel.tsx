import React, { useState, useEffect } from 'react';
import { Typography, Button, Upload, message, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { getDocuments, uploadDocument, type Document } from '../../../../api';
import ResourceCard from './ResourceCard';

const { Text, Title } = Typography;

interface ResourcePanelProps {
  onDocumentSelect?: (document: Document) => void;
}

const ResourcePanel: React.FC<ResourcePanelProps> = ({ onDocumentSelect }) => {
  const [selectedDocument, setSelectedDocument] = useState<string>('1');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);

  // 加载文档列表
  const loadDocuments = async () => {
    setLoading(true);
    try {
      const result = await getDocuments();
      if (result.success && result.data) {
        setDocuments(result.data);
        if (result.data.length > 0 && !selectedDocument) {
          setSelectedDocument(result.data[0].id);
        }
      } else {
        message.error(result.error || '加载文档失败');
      }
    } catch (error) {
      message.error('加载文档失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleUpload = async (info: any) => {
    const file = info.file;
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadDocument(file);
      
      if (result.success && result.document) {
        message.success('文档上传成功');
        await loadDocuments(); // 重新加载文档列表
        setSelectedDocument(result.document.id); // 选中新上传的文档
      } else {
        message.error(result.error || '上传失败');
      }
    } catch (error) {
      message.error('上传过程中发生错误');
    } finally {
      setUploading(false);
    }
  };

  // 处理文档选择
  const handleDocumentSelect = (docId: string) => {
    setSelectedDocument(docId);
    
    // 找到对应的文档并调用回调函数
    const document = documents.find(doc => doc.id === docId);
    if (document && onDocumentSelect) {
      onDocumentSelect(document);
    }
  };

  return (
    <div className="h-full bg-white border border-gray-200 rounded-lg flex flex-col">
      {/* 头部区域 */}
      <div className="p-6 border-b border-gray-200">
        <Title level={4} className="text-gray-900 mb-2 font-semibold">
          资源库
        </Title>
        <Text className="text-gray-600 text-sm mb-4 block">
          上传和管理您的文档资源，目前支持txt文本格式
        </Text>
        
        <Upload
          accept=".txt"
          showUploadList={false}
          onChange={handleUpload}
          className="w-full"
          disabled={uploading}
        >
          <Button 
            type="primary" 
            icon={<UploadOutlined />} 
            loading={uploading}
            className="w-full h-10 bg-black hover:bg-gray-800 border-none rounded-lg font-medium"
          >
            {uploading ? '上传中...' : '上传文档'}
          </Button>
        </Upload>
      </div>

      {/* 文档列表区域 */}
      <div className="flex-1 p-4 overflow-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Spin size="large" />
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc: Document) => (
              <ResourceCard
                key={doc.id}
                document={doc}
                isSelected={selectedDocument === doc.id}
                onSelect={handleDocumentSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcePanel; 