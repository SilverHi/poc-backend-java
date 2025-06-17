#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API比较测试脚本
比较 /export 和 /export/download 两个API的差异
"""

import requests
import json
from datetime import datetime

def test_api_comparison():
    base_url = "http://localhost:8080"
    workflow_id = 1
    
    print("🔍 API比较测试")
    print("=" * 60)
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"工作流ID: {workflow_id}")
    print()
    
    # 测试 export API
    print("📋 测试 1: /api/workflows/{id}/export")
    print("-" * 40)
    
    try:
        response1 = requests.get(f"{base_url}/api/workflows/{workflow_id}/export")
        print(f"状态码: {response1.status_code}")
        print(f"Content-Type: {response1.headers.get('Content-Type', 'N/A')}")
        print(f"Content-Disposition: {response1.headers.get('Content-Disposition', '无')}")
        
        if response1.status_code == 200:
            try:
                data1 = response1.json()
                print(f"返回数据类型: {type(data1)}")
                print(f"数据字段: {list(data1.keys()) if isinstance(data1, dict) else 'N/A'}")
                print(f"响应内容预览:")
                print(json.dumps(data1, indent=2, ensure_ascii=False)[:500] + "...")
            except:
                print(f"响应内容 (文本): {response1.text[:200]}...")
        else:
            print(f"错误响应: {response1.text}")
            
    except Exception as e:
        print(f"请求失败: {e}")
    
    print()
    
    # 测试 export/download API
    print("📋 测试 2: /api/workflows/{id}/export/download")
    print("-" * 40)
    
    try:
        response2 = requests.get(f"{base_url}/api/workflows/{workflow_id}/export/download")
        print(f"状态码: {response2.status_code}")
        print(f"Content-Type: {response2.headers.get('Content-Type', 'N/A')}")
        print(f"Content-Disposition: {response2.headers.get('Content-Disposition', '无')}")
        
        if response2.status_code == 200:
            try:
                data2 = response2.json()
                print(f"返回数据类型: {type(data2)}")
                print(f"数据字段: {list(data2.keys()) if isinstance(data2, dict) else 'N/A'}")
                print(f"响应内容预览:")
                print(json.dumps(data2, indent=2, ensure_ascii=False)[:500] + "...")
            except:
                print(f"响应内容 (文本): {response2.text[:200]}...")
        else:
            print(f"错误响应: {response2.text}")
            
    except Exception as e:
        print(f"请求失败: {e}")
    
    print()
    
    # 分析差异
    print("📊 API差异分析")
    print("=" * 60)
    
    print("根据代码分析:")
    print()
    print("1. GET /api/workflows/{id}/export")
    print("   - 返回类型: Map<String, Object> (JSON)")
    print("   - Content-Type: application/json")
    print("   - 用途: 获取工作流的导出数据对象")
    print("   - 场景: 程序化使用，前端获取数据进行处理")
    print()
    print("2. GET /api/workflows/{id}/export/download")
    print("   - 返回类型: ResponseEntity<String> (文件下载)")
    print("   - Content-Type: application/json")
    print("   - Content-Disposition: attachment; filename=<name>_workflow.json")
    print("   - 用途: 触发浏览器下载JSON文件")
    print("   - 场景: 用户通过浏览器下载工作流配置文件")
    print()
    
    print("🎯 结论:")
    print("两个API的功能确实有区别:")
    print("- /export: API调用，返回JSON数据对象")
    print("- /export/download: 文件下载，触发浏览器保存文件")
    print()
    print("建议:")
    print("- 保留两个API，它们服务于不同的使用场景")
    print("- 修复 /export/download 的500错误")
    print("- 在API文档中明确说明两个接口的区别")

if __name__ == "__main__":
    test_api_comparison() 