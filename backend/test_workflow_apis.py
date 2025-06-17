#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
工作流API测试脚本
测试目标：http://localhost:8080 上的所有workflow相关API
"""

import requests
import json
import time
import sys
from typing import Optional, Dict, Any

class WorkflowAPITester:
    def __init__(self, base_url: str = "http://localhost:8080"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.created_workflow_id: Optional[int] = None
        
    def log(self, message: str):
        """打印带时间戳的日志"""
        print(f"[{time.strftime('%H:%M:%S')}] {message}")
        
    def make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """发送HTTP请求"""
        url = f"{self.base_url}{endpoint}"
        try:
            response = self.session.request(method, url, **kwargs)
            return response
        except requests.exceptions.ConnectionError:
            self.log(f"❌ 连接失败: {url}")
            self.log("请确保后端服务正在运行 (mvn spring-boot:run)")
            sys.exit(1)
    
    def test_status_apis(self):
        """测试状态检查API"""
        self.log("🔍 开始测试状态检查API")
        
        # 测试模块状态
        response = self.make_request('GET', '/api/workflow/test/status')
        if response.status_code == 200:
            data = response.json()
            self.log(f"✅ 模块状态检查成功: {data.get('description', '')}")
        else:
            self.log(f"❌ 模块状态检查失败: {response.status_code}")
            
        # 测试健康检查
        response = self.make_request('GET', '/api/workflow/test/health')
        if response.status_code == 200:
            self.log("✅ 健康检查成功")
        else:
            self.log(f"❌ 健康检查失败: {response.status_code}")
    
    def test_workflow_management(self):
        """测试工作流管理API"""
        self.log("🔍 开始测试工作流管理API")
        
        # 1. 获取工作流列表（初始状态）
        response = self.make_request('GET', '/api/workflows?skip=0&limit=10')
        if response.status_code == 200:
            workflows = response.json()
            self.log(f"✅ 获取工作流列表成功，当前有 {len(workflows)} 个工作流")
        else:
            self.log(f"❌ 获取工作流列表失败: {response.status_code}")
            return
        
        # 2. 创建新工作流
        workflow_data = {
            "name": "测试工作流",
            "description": "这是一个API测试创建的工作流",
            "config": json.dumps({
                "nodes": [
                    {
                        "id": "start-1",
                        "type": "start",
                        "data": {
                            "label": "开始",
                            "config": {
                                "initialVariables": {"input": "测试输入"},
                                "variableDescriptions": {"input": "测试输入变量"}
                            }
                        }
                    },
                    {
                        "id": "end-1", 
                        "type": "end",
                        "data": {"label": "结束"}
                    }
                ],
                "edges": [
                    {"source": "start-1", "target": "end-1"}
                ]
            })
        }
        
        response = self.make_request('POST', '/api/workflows', json=workflow_data)
        if response.status_code == 200:
            created_workflow = response.json()
            self.created_workflow_id = created_workflow['id']
            self.log(f"✅ 创建工作流成功，ID: {self.created_workflow_id}")
        else:
            self.log(f"❌ 创建工作流失败: {response.status_code} - {response.text}")
            return
        
        # 3. 获取工作流详情
        if self.created_workflow_id:
            response = self.make_request('GET', f'/api/workflows/{self.created_workflow_id}')
            if response.status_code == 200:
                workflow = response.json()
                self.log(f"✅ 获取工作流详情成功: {workflow['name']}")
                if 'nodes' in workflow and workflow['nodes'] is not None:
                    self.log(f"   包含 {len(workflow['nodes'])} 个节点")
                if 'vars' in workflow and workflow['vars'] is not None:
                    self.log(f"   包含 {len(workflow['vars'])} 个变量")
            else:
                self.log(f"❌ 获取工作流详情失败: {response.status_code}")
        
        # 4. 更新工作流
        if self.created_workflow_id:
            update_data = {
                "name": "测试工作流（已更新）",
                "description": "这是一个更新后的工作流描述"
            }
            response = self.make_request('PUT', f'/api/workflows/{self.created_workflow_id}', json=update_data)
            if response.status_code == 200:
                self.log("✅ 更新工作流成功")
            else:
                self.log(f"❌ 更新工作流失败: {response.status_code}")

    def test_workflow_execution(self):
        """测试工作流执行API"""
        self.log("🔍 开始测试工作流执行API")
        
        if not self.created_workflow_id:
            self.log("❌ 没有可用的工作流ID，跳过执行测试")
            return
        
        # 1. 执行工作流
        execute_data = {
            "variables": {"input": "测试执行输入", "param1": "value1"}
        }
        response = self.make_request('POST', f'/api/workflows/{self.created_workflow_id}/execute', json=execute_data)
        if response.status_code == 200:
            result = response.json()
            self.log(f"✅ 执行工作流成功: {result.get('message', '')}")
        else:
            self.log(f"❌ 执行工作流失败: {response.status_code}")
        
        # 2. 运行工作流
        run_data = {
            "id": str(self.created_workflow_id),
            "args": {"input": "测试运行输入", "param2": "value2"}
        }
        response = self.make_request('POST', '/api/workflows/run_workflow', json=run_data)
        if response.status_code == 200:
            result = response.json()
            self.log(f"✅ 运行工作流成功: 状态码={result.get('code')}, 数据={result.get('data', '')}")
        else:
            self.log(f"❌ 运行工作流失败: {response.status_code}")

    def test_import_export(self):
        """测试导入导出API"""
        self.log("🔍 开始测试导入导出API")
        
        if not self.created_workflow_id:
            self.log("❌ 没有可用的工作流ID，跳过导入导出测试")
            return
        
        # 1. 导出工作流
        response = self.make_request('GET', f'/api/workflows/{self.created_workflow_id}/export')
        if response.status_code == 200:
            export_data = response.json()
            self.log("✅ 导出工作流成功")
            
            # 2. 测试导入工作流
            import_data = {
                "name": "导入的测试工作流",
                "description": "这是通过API导入的工作流",
                "workflow_data": export_data
            }
            response = self.make_request('POST', '/api/workflows/import', json=import_data)
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    imported_id = result.get('workflow_id')
                    self.log(f"✅ 导入工作流成功，新ID: {imported_id}")
                else:
                    self.log(f"❌ 导入工作流失败: {result.get('message')}")
            else:
                self.log(f"❌ 导入工作流失败: {response.status_code}")
        else:
            self.log(f"❌ 导出工作流失败: {response.status_code}")
        
        # 3. 测试下载工作流
        response = self.make_request('GET', f'/api/workflows/{self.created_workflow_id}/export/download')
        if response.status_code == 200:
            self.log("✅ 下载工作流成功")
            # 可以选择保存文件
            # with open('downloaded_workflow.json', 'w', encoding='utf-8') as f:
            #     f.write(response.text)
        else:
            self.log(f"❌ 下载工作流失败: {response.status_code}")

    def test_agent_apis(self):
        """测试Agent相关API"""
        self.log("🔍 开始测试Agent API")
        
        # 1. 获取Agent列表
        response = self.make_request('GET', '/api/agents?skip=0&limit=10')
        if response.status_code == 200:
            agents = response.json()
            self.log(f"✅ 获取Agent列表成功，当前有 {len(agents)} 个Agent")
        else:
            self.log(f"❌ 获取Agent列表失败: {response.status_code}")
        
        # 2. 获取外部Agent信息
        response = self.make_request('GET', '/api/external-agents')
        if response.status_code == 200:
            external_agents = response.json()
            agents_list = external_agents.get('agents', [])
            self.log(f"✅ 获取外部Agent信息成功，找到 {len(agents_list)} 个外部Agent")
        else:
            self.log(f"❌ 获取外部Agent信息失败: {response.status_code}")

    def test_cleanup(self):
        """清理测试数据"""
        self.log("🔍 开始清理测试数据")
        
        if self.created_workflow_id:
            response = self.make_request('DELETE', f'/api/workflows/{self.created_workflow_id}')
            if response.status_code == 200:
                self.log(f"✅ 删除测试工作流成功 (ID: {self.created_workflow_id})")
            else:
                self.log(f"❌ 删除测试工作流失败: {response.status_code}")

    def run_all_tests(self):
        """运行所有测试"""
        self.log("🚀 开始运行工作流API完整测试")
        self.log("=" * 60)
        
        try:
            self.test_status_apis()
            self.log("-" * 40)
            
            self.test_workflow_management()
            self.log("-" * 40)
            
            self.test_workflow_execution()
            self.log("-" * 40)
            
            self.test_import_export()
            self.log("-" * 40)
            
            self.test_agent_apis()
            self.log("-" * 40)
            
            # 可选：清理测试数据
            # self.test_cleanup()
            
        except Exception as e:
            self.log(f"❌ 测试过程中发生错误: {str(e)}")
        
        self.log("=" * 60)
        self.log("🎉 工作流API测试完成！")

def main():
    """主函数"""
    print("🔧 工作流API测试工具")
    print(f"📡 目标服务器: http://localhost:8080")
    print(f"⏰ 开始时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tester = WorkflowAPITester()
    tester.run_all_tests()

if __name__ == "__main__":
    main() 