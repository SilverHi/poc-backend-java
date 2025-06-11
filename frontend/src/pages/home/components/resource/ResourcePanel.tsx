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
        message.error(result.error || 'Failed to load documents');
      }
    } catch (error) {
      message.error('Failed to load documents');
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
        message.success('Document uploaded successfully');
        await loadDocuments(); // 重新加载文档列表
        setSelectedDocument(result.document.id); // 选中新上传的文档
      } else {
        message.error(result.error || 'Upload failed');
      }
    } catch (error) {
      message.error('Error occurred during upload');
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
    <div className="h-full flex flex-col rounded-xl overflow-hidden">
      {/* 头部区域 */}
      <div className="p-8 pb-6">
        <Title level={4} className="text-gray-900 mb-3 font-medium">
          Resource Library
        </Title>
        <Text className="text-gray-500 text-sm mb-6 block leading-relaxed">
          Upload and manage your document resources. Currently supports text files (.txt).
        </Text>
        
        <Upload
          accept=".txt"
          showUploadList={false}
          beforeUpload={() => false} // 禁用自动上传，手动控制
          onChange={handleUpload}
          className="w-full"
          disabled={uploading}
        >
          <Button 
            type="primary" 
            icon={<UploadOutlined />} 
            loading={uploading}
            className="w-full h-10 bg-black hover:bg-gray-800 border-black rounded-lg font-medium"
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </Upload>
      </div>

      {/* 文档列表区域 */}
      <div className="flex-1 px-8 pb-8 overflow-auto">
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