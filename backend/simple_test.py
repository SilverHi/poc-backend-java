#!/usr/bin/env python3
# 简单的API测试脚本
import urllib.request
import json

def test_url(url, name):
    try:
        print(f"\n测试 {name}: {url}")
        response = urllib.request.urlopen(url, timeout=3)
        code = response.getcode()
        content = response.read().decode('utf-8')
        print(f"✅ 状态码: {code}")
        if content.startswith('{') or content.startswith('['):
            try:
                data = json.loads(content)
                print(f"JSON响应: {json.dumps(data, ensure_ascii=False, indent=2)[:200]}...")
            except:
                print(f"响应内容: {content[:100]}...")
        else:
            print(f"响应内容: {content[:100]}...")
        return True
    except urllib.error.HTTPError as e:
        print(f"❌ HTTP错误: {e.code} - {e.reason}")
        return False
    except Exception as e:
        print(f"❌ 异常: {e}")
        return False

# 测试各个API
base_url = "http://localhost:8080"

print("🚀 开始API连接测试")
print("=" * 50)

# 测试已知存在的chatbycard API
test_url(f"{base_url}/api/chatbycard/test/status", "ChatByCard状态")

# 测试workflow相关API
test_url(f"{base_url}/api/workflow/test/status", "Workflow测试状态")
test_url(f"{base_url}/api/workflows", "工作流列表")
test_url(f"{base_url}/api/agents", "Agent列表")
test_url(f"{base_url}/api/external-agents", "外部Agent")

# 测试其他可能的端点
test_url(f"{base_url}/actuator/health", "Spring Boot健康检查")
test_url(f"{base_url}/", "根路径")

print("\n" + "=" * 50)
print("测试完成") 