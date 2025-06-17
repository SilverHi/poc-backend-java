#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
单个API测试脚本 - 用于调试API路径问题
"""

import requests
import json

def test_api(url, description):
    print(f"\n🔍 测试: {description}")
    print(f"URL: {url}")
    try:
        response = requests.get(url, timeout=5)
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            print(f"✅ 成功")
            if response.headers.get('content-type', '').startswith('application/json'):
                try:
                    data = response.json()
                    print(f"响应: {json.dumps(data, ensure_ascii=False, indent=2)}")
                except:
                    print(f"响应文本: {response.text[:200]}")
            else:
                print(f"响应文本: {response.text[:200]}")
        else:
            print(f"❌ 失败")
            print(f"响应: {response.text[:200]}")
    except requests.exceptions.ConnectionError:
        print(f"❌ 连接失败 - 服务可能未启动")
    except Exception as e:
        print(f"❌ 异常: {e}")

def main():
    base_url = "http://localhost:8080"
    
    print("🚀 开始单API测试")
    print("="*50)
    
    # 测试各种可能的API路径
    test_apis = [
        ("/", "根路径"),
        ("/api", "API根路径"),
        ("/actuator/health", "Spring Boot健康检查"),
        ("/api/chatbycard/test/status", "ChatByCard测试状态"),
        ("/api/workflow/test/status", "Workflow测试状态"),
        ("/api/workflows", "工作流列表"),
        ("/api/agents", "Agent列表"),
        ("/api/external-agents", "外部Agent信息"),
    ]
    
    for endpoint, description in test_apis:
        test_api(f"{base_url}{endpoint}", description)
        
    print("\n" + "="*50)
    print("🎉 测试完成")

if __name__ == "__main__":
    main() 