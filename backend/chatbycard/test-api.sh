#!/bin/bash

# ChatByCard 文档管理API测试脚本
BASE_URL="http://localhost:8080"

echo "=== ChatByCard 文档管理API测试 ==="

# 1. 测试模块状态
echo "1. 测试模块状态..."
curl -X GET "${BASE_URL}/api/chatbycard/test/status" \
  -H "Content-Type: application/json" | jq .

echo -e "\n"

# 2. 测试获取文档列表（空列表）
echo "2. 测试获取文档列表..."
curl -X GET "${BASE_URL}/api/chatbycard/documents" \
  -H "Content-Type: application/json" | jq .

echo -e "\n"

# 3. 创建测试文件并上传
echo "3. 创建测试文件并上传..."
echo "这是一个测试文档。

本文档用于测试文档上传功能。

内容包括：
1. 文档管理
2. 文件上传
3. 异步处理
4. API接口

测试完成。" > test-document.txt

curl -X POST "${BASE_URL}/api/chatbycard/documents/upload" \
  -F "file=@test-document.txt" | jq .

echo -e "\n"

# 4. 再次获取文档列表
echo "4. 再次获取文档列表..."
curl -X GET "${BASE_URL}/api/chatbycard/documents" \
  -H "Content-Type: application/json" | jq .

echo -e "\n"

# 清理测试文件
rm -f test-document.txt

echo "=== 测试完成 ==="
echo "注意：请确保服务器已启动在 ${BASE_URL}"
echo "如需测试其他功能，请手动调用相应API" 