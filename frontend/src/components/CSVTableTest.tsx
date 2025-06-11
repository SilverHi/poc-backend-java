import React from 'react';
import { Card, Typography } from 'antd';
import MarkdownRenderer from './MarkdownRenderer';

const { Title, Text } = Typography;

const CSVTableTest: React.FC = () => {
  // 测试用的CSV数据
  const csvTest1 = `
# CSV表格测试

## 测试1：基础CSV数据
\`\`\`csv
姓名,年龄,城市,职业
张三,25,北京,程序员
李四,30,上海,设计师
王五,28,广州,产品经理
\`\`\`

## 测试2：带引号的CSV数据
\`\`\`csv
产品名称,价格,描述,状态
"iPhone 15",7999,"最新款iPhone，支持5G",在售
"MacBook Pro",12999,"13寸M2芯片，256GB存储",在售
"AirPods Pro",1899,"主动降噪，空间音频",在售
\`\`\`

## 测试3：内联CSV数据
姓名,部门,工资,入职日期
张三,技术部,15000,2023-01-15
李四,设计部,12000,2023-02-20
王五,产品部,14000,2023-03-10

## 测试4：普通markdown表格
| 项目 | 状态 | 完成度 |
|------|------|--------|
| 前端开发 | 进行中 | 80% |
| 后端开发 | 已完成 | 100% |
| 测试 | 待开始 | 0% |
`;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <Title level={2}>CSV表格渲染测试</Title>
        <Text type="secondary">
          这个测试页面验证CSV数据是否能正确转换为表格格式
        </Text>
      </Card>

      <Card>
        <MarkdownRenderer content={csvTest1} />
      </Card>
    </div>
  );
};

export default CSVTableTest; 