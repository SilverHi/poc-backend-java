#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复 download API 问题的诊断脚本
"""

import requests
import json

def test_download_issue():
    base_url = "http://localhost:8080"
    workflow_id = 1
    
    print("🔧 下载API问题诊断")
    print("=" * 50)
    
    # 首先获取export数据，看看数据结构
    print("1. 获取export数据结构...")
    try:
        response = requests.get(f"{base_url}/api/workflows/{workflow_id}/export")
        if response.status_code == 200:
            export_data = response.json()
            print("导出数据结构:")
            print(json.dumps(export_data, indent=2, ensure_ascii=False))
            
            print("\n2. 尝试手动序列化...")
            try:
                json_str = json.dumps(export_data, indent=2, ensure_ascii=False)
                print(f"手动序列化成功，长度: {len(json_str)} 字符")
                
                print("\n3. 分析可能的问题...")
                # 检查是否包含不可序列化的对象
                for key, value in export_data.items():
                    print(f"  {key}: {type(value)} - {str(value)[:100]}...")
                    
                print("\n问题分析:")
                print("- export API正常工作")
                print("- 数据结构可以正常序列化")
                print("- download API的500错误可能是:")
                print("  1. Jackson ObjectMapper配置问题")
                print("  2. 日期序列化问题 (exported_at字段)")
                print("  3. 中文文件名问题")
                print("  4. 响应头设置问题")
                
            except Exception as e:
                print(f"手动序列化失败: {e}")
                
        else:
            print(f"获取export数据失败: {response.status_code}")
            
    except Exception as e:
        print(f"请求失败: {e}")
    
    print("\n🎯 建议的修复方案:")
    print("1. 修改 downloadWorkflow 方法，使用与 exportWorkflow 相同的序列化方式")
    print("2. 处理日期序列化格式")
    print("3. 确保文件名编码正确")
    print("4. 添加异常处理和日志")

if __name__ == "__main__":
    test_download_issue() 