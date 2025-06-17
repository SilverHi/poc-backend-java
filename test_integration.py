#!/usr/bin/env python3
"""
简单的集成测试脚本
验证workflow和chatbycard模块的集成是否正常
"""

import requests
import json
import sys

BASE_URL = "http://localhost:8080"

def test_workflow_apis():
    """测试workflow相关API"""
    print("🔍 测试Workflow API集成...")
    
    try:
        # 测试获取工作流列表
        print("1. 测试获取工作流列表...")
        response = requests.get(f"{BASE_URL}/api/workflows", timeout=10)
        print(f"   状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   工作流数量: {len(data)}")
        else:
            print(f"   错误: {response.text}")
            
        # 测试获取agents信息
        print("2. 测试获取外部Agents...")
        response = requests.get(f"{BASE_URL}/api/external-agents", timeout=10)
        print(f"   状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            agents = data.get('agents', [])
            print(f"   Agent数量: {len(agents)}")
        else:
            print(f"   错误: {response.text}")
            
        print("✅ Workflow API测试完成")
        
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到服务器，请确保服务器已启动")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False
        
    return True

def test_chatbycard_apis():
    """测试chatbycard相关API"""
    print("🔍 测试ChatByCard API集成...")
    
    try:
        # 测试获取agents
        print("1. 测试获取Agents列表...")
        response = requests.get(f"{BASE_URL}/api/chatbycard/agents", timeout=10)
        print(f"   状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data.get('success'):
                agents_data = data.get('data', {}).get('data', [])
                print(f"   Agent数量: {len(agents_data)}")
            else:
                print(f"   API错误: {data.get('error', 'Unknown error')}")
        else:
            print(f"   HTTP错误: {response.text}")
            
        print("✅ ChatByCard API测试完成")
        
    except requests.exceptions.ConnectionError:
        print("❌ 无法连接到服务器，请确保服务器已启动")
        return False
    except Exception as e:
        print(f"❌ 测试失败: {e}")
        return False
        
    return True

def main():
    """主测试函数"""
    print("🚀 开始集成测试...")
    print("=" * 50)
    
    # 等待服务器启动
    print("⏳ 等待服务器启动...")
    
    success = True
    
    # 测试workflow APIs
    if not test_workflow_apis():
        success = False
        
    print()
    
    # 测试chatbycard APIs  
    if not test_chatbycard_apis():
        success = False
        
    print("=" * 50)
    if success:
        print("🎉 所有测试通过！集成成功！")
        sys.exit(0)
    else:
        print("❌ 部分测试失败")
        sys.exit(1)

if __name__ == "__main__":
    main() 