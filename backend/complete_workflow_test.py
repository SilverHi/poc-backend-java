#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
完整的工作流API测试脚本
测试所有workflow相关的API接口
"""

import requests
import json
import time
import sys
from typing import Optional, Dict, Any

class ComprehensiveWorkflowTester:
    def __init__(self, base_url: str = "http://localhost:8080"):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = {
            'total': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        self.created_workflow_ids = []
        
    def log(self, message: str):
        """打印带时间戳的日志"""
        timestamp = time.strftime('%H:%M:%S')
        print(f"[{timestamp}] {message}")
        
    def test_api(self, name: str, method: str, endpoint: str, **kwargs) -> tuple[bool, dict]:
        """测试单个API并返回结果"""
        self.test_results['total'] += 1
        url = f"{self.base_url}{endpoint}"
        
        try:
            response = self.session.request(method, url, **kwargs)
            success = 200 <= response.status_code < 300
            
            if success:
                self.test_results['passed'] += 1
                self.log(f"✅ {name}: 成功 ({response.status_code})")
            else:
                self.test_results['failed'] += 1
                self.log(f"❌ {name}: 失败 ({response.status_code})")
                self.test_results['errors'].append(f"{name}: {response.status_code}")
            
            try:
                return success, response.json()
            except:
                return success, {"text": response.text}
                
        except requests.exceptions.ConnectionError:
            self.test_results['failed'] += 1
            self.log(f"❌ {name}: 连接失败")
            self.test_results['errors'].append(f"{name}: 连接失败")
            return False, {}
        except Exception as e:
            self.test_results['failed'] += 1
            self.log(f"❌ {name}: 异常 - {str(e)}")
            self.test_results['errors'].append(f"{name}: {str(e)}")
            return False, {}

    def run_comprehensive_tests(self):
        """运行所有comprehensive tests"""
        self.log("🚀 开始运行workflow模块完整API测试")
        self.log("=" * 80)
        
        # 1. 测试模块状态API
        self.log("\n📋 第1部分：模块状态测试")
        self.log("-" * 50)
        
        success, data = self.test_api(
            "模块状态检查", "GET", "/api/workflow/test/status"
        )
        if success and data:
            self.log(f"   模块: {data.get('module', 'N/A')}")
            self.log(f"   状态: {data.get('status', 'N/A')}")
            self.log(f"   描述: {data.get('description', 'N/A')}")
            
        self.test_api("健康检查", "GET", "/api/workflow/test/health")
        
        # 2. 测试工作流管理API
        self.log("\n📋 第2部分：工作流管理API")
        self.log("-" * 50)
        
        # 获取工作流列表
        success, workflows = self.test_api(
            "获取工作流列表", "GET", "/api/workflows?skip=0&limit=10"
        )
        if success:
            self.log(f"   当前有 {len(workflows)} 个工作流")
        
        # 创建工作流
        workflow_data = {
            "name": "测试工作流API",
            "description": "完整API测试创建的工作流",
            "config": json.dumps({
                "nodes": [
                    {
                        "id": "start-1",
                        "type": "start",
                        "data": {
                            "label": "开始",
                            "config": {
                                "initialVariables": {"input": "测试数据"},
                                "variableDescriptions": {"input": "测试输入"}
                            }
                        }
                    },
                    {
                        "id": "end-1",
                        "type": "end",
                        "data": {"label": "结束"}
                    }
                ],
                "edges": [{"source": "start-1", "target": "end-1"}]
            })
        }
        
        success, created_workflow = self.test_api(
            "创建工作流", "POST", "/api/workflows", json=workflow_data
        )
        
        workflow_id = None
        if success and 'id' in created_workflow:
            workflow_id = created_workflow['id']
            self.created_workflow_ids.append(workflow_id)
            self.log(f"   创建的工作流ID: {workflow_id}")
        
        # 获取工作流详情
        if workflow_id:
            success, workflow_detail = self.test_api(
                "获取工作流详情", "GET", f"/api/workflows/{workflow_id}"
            )
            if success:
                self.log(f"   工作流名称: {workflow_detail.get('name', 'N/A')}")
                
        # 更新工作流
        if workflow_id:
            update_data = {
                "name": "测试工作流API（已更新）",
                "description": "更新后的描述"
            }
            self.test_api(
                "更新工作流", "PUT", f"/api/workflows/{workflow_id}", json=update_data
            )
            
        # 3. 测试工作流执行API
        self.log("\n📋 第3部分：工作流执行API")
        self.log("-" * 50)
        
        if workflow_id:
            # 执行工作流
            execute_data = {"variables": {"input": "执行测试", "param": "value"}}
            self.test_api(
                "执行工作流", "POST", f"/api/workflows/{workflow_id}/execute", 
                json=execute_data
            )
            
            # 运行工作流
            run_data = {
                "id": str(workflow_id),
                "args": {"input": "运行测试", "param": "value"}
            }
            self.test_api(
                "运行工作流", "POST", "/api/workflows/run_workflow", json=run_data
            )
        
        # 4. 测试导入导出API
        self.log("\n📋 第4部分：导入导出API")
        self.log("-" * 50)
        
        if workflow_id:
            # 导出工作流
            success, export_data = self.test_api(
                "导出工作流", "GET", f"/api/workflows/{workflow_id}/export"
            )
            
            # 下载工作流
            self.test_api(
                "下载工作流", "GET", f"/api/workflows/{workflow_id}/export/download"
            )
            
            # 导入工作流
            if success and export_data:
                import_data = {
                    "name": "导入测试工作流",
                    "description": "通过API导入的工作流",
                    "workflow_data": export_data
                }
                success, import_result = self.test_api(
                    "导入工作流", "POST", "/api/workflows/import", json=import_data
                )
                if success and import_result.get('success'):
                    imported_id = import_result.get('workflow_id')
                    if imported_id:
                        self.created_workflow_ids.append(imported_id)
                        self.log(f"   导入的工作流ID: {imported_id}")
        
        # 5. 测试Agent相关API
        self.log("\n📋 第5部分：Agent相关API")
        self.log("-" * 50)
        
        # 获取Agent列表
        success, agents = self.test_api(
            "获取Agent列表", "GET", "/api/agents?skip=0&limit=10"
        )
        if success:
            self.log(f"   找到 {len(agents)} 个Agent")
            
        # 获取外部Agent信息（通过WorkflowAgentController）
        success, external_agents1 = self.test_api(
            "获取外部Agent信息1", "GET", "/api/agents/external"
        )
        if success:
            agents_list = external_agents1.get('agents', [])
            self.log(f"   外部Agent数量1: {len(agents_list)}")
            
        # 获取外部Agent信息（通过ExternalAgentController）
        success, external_agents2 = self.test_api(
            "获取外部Agent信息2", "GET", "/api/external-agents"
        )
        if success:
            agents_list = external_agents2.get('agents', [])
            self.log(f"   外部Agent数量2: {len(agents_list)}")
        
        # 6. 边界情况和错误处理测试
        self.log("\n📋 第6部分：边界情况测试")
        self.log("-" * 50)
        
        # 获取不存在的工作流
        self.test_api(
            "获取不存在的工作流", "GET", "/api/workflows/99999"
        )
        
        # 删除不存在的工作流
        self.test_api(
            "删除不存在的工作流", "DELETE", "/api/workflows/99999"
        )
        
        # 创建无效的工作流
        invalid_workflow = {"name": ""}  # 空名称
        self.test_api(
            "创建无效工作流", "POST", "/api/workflows", json=invalid_workflow
        )
        
        # 7. 清理测试数据
        self.log("\n📋 第7部分：清理测试数据")
        self.log("-" * 50)
        
        for workflow_id in self.created_workflow_ids:
            self.test_api(
                f"删除测试工作流 {workflow_id}", "DELETE", f"/api/workflows/{workflow_id}"
            )
        
        # 8. 显示测试结果摘要
        self.show_test_summary()
    
    def show_test_summary(self):
        """显示测试结果摘要"""
        self.log("\n" + "=" * 80)
        self.log("📊 测试结果摘要")
        self.log("=" * 80)
        
        total = self.test_results['total']
        passed = self.test_results['passed']
        failed = self.test_results['failed']
        success_rate = (passed / total * 100) if total > 0 else 0
        
        self.log(f"总测试数量: {total}")
        self.log(f"✅ 成功: {passed}")
        self.log(f"❌ 失败: {failed}")
        self.log(f"🎯 成功率: {success_rate:.1f}%")
        
        if self.test_results['errors']:
            self.log("\n❌ 失败的测试:")
            for error in self.test_results['errors']:
                self.log(f"   - {error}")
        
        if success_rate >= 90:
            self.log("\n🎉 测试结果：优秀！所有主要功能正常工作")
        elif success_rate >= 80:
            self.log("\n✅ 测试结果：良好！大部分功能正常，有少量问题")
        elif success_rate >= 60:
            self.log("\n⚠️  测试结果：一般！有较多问题需要修复")
        else:
            self.log("\n🚨 测试结果：不佳！有严重问题需要立即修复")

def main():
    """主函数"""
    print("🔧 Workflow模块完整API测试工具")
    print(f"📡 目标服务器: http://localhost:8080")
    print(f"⏰ 开始时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    tester = ComprehensiveWorkflowTester()
    
    try:
        tester.run_comprehensive_tests()
    except KeyboardInterrupt:
        print("\n\n⏹️  测试被用户中断")
    except Exception as e:
        print(f"\n\n❌ 测试过程中发生未预期的错误: {str(e)}")
    
    print(f"\n⏰ 完成时间: {time.strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main() 