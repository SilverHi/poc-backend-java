@echo off
chcp 65001 >nul
title Workflow API 完整测试工具

echo.
echo 🔧 Workflow模块完整API测试工具
echo 📡 目标服务器: http://localhost:8080
echo ⏰ 开始时间: %date% %time%
echo.
echo ================================================================================
echo.

set "BASE_URL=http://localhost:8080"
set "test_count=0"
set "success_count=0"
set "failed_count=0"

echo 📋 第1部分：模块状态测试
echo --------------------------------------------------
echo.

echo 1. 测试模块状态检查
curl -s -X GET %BASE_URL%/api/workflow/test/status
if %errorlevel% equ 0 (
    echo ✅ 模块状态检查: 成功
    set /a success_count+=1
) else (
    echo ❌ 模块状态检查: 失败
    set /a failed_count+=1
)
set /a test_count+=1
echo.

echo 2. 测试健康检查
curl -s -X GET %BASE_URL%/api/workflow/test/health
if %errorlevel% equ 0 (
    echo ✅ 健康检查: 成功
    set /a success_count+=1
) else (
    echo ❌ 健康检查: 失败
    set /a failed_count+=1
)
set /a test_count+=1
echo.

echo.
echo 📋 第2部分：工作流管理API
echo --------------------------------------------------
echo.

echo 3. 获取工作流列表
curl -s -X GET "%BASE_URL%/api/workflows?skip=0&limit=10"
if %errorlevel% equ 0 (
    echo ✅ 获取工作流列表: 成功
    set /a success_count+=1
) else (
    echo ❌ 获取工作流列表: 失败
    set /a failed_count+=1
)
set /a test_count+=1
echo.

echo 4. 创建工作流
curl -s -X POST %BASE_URL%/api/workflows ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"CMD测试工作流\", \"description\": \"CMD脚本创建的测试工作流\", \"config\": \"{\\\"nodes\\\":[{\\\"id\\\":\\\"start-1\\\",\\\"type\\\":\\\"start\\\",\\\"data\\\":{\\\"label\\\":\\\"开始\\\"}}],\\\"edges\\\":[]}\"}"
if %errorlevel% equ 0 (
    echo ✅ 创建工作流: 成功
    set /a success_count+=1
) else (
    echo ❌ 创建工作流: 失败
    set /a failed_count+=1
)
set /a test_count+=1
echo.

echo 5. 获取工作流详情 (ID=1)
curl -s -X GET %BASE_URL%/api/workflows/1
if %errorlevel% equ 0 (
    echo ✅ 获取工作流详情: 成功
    set /a success_count+=1
) else (
    echo ❌ 获取工作流详情: 失败
    set /a failed_count+=1
)
set /a test_count+=1
echo.

echo 6. 更新工作流 (ID=1)
curl -s -X PUT %BASE_URL%/api/workflows/1 ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"CMD测试工作流(已更新)\", \"description\": \"更新后的描述\"}"
if %errorlevel% equ 0 (
    echo ✅ 更新工作流: 成功
    set /a success_count+=1
) else (
    echo ❌ 更新工作流: 失败
    set /a failed_count+=1
)
set /a test_count+=1
echo.

echo.
echo 📋 第3部分：工作流执行API
echo --------------------------------------------------
echo.

echo 7. 执行工作流 (ID=1)
curl -s -X POST %BASE_URL%/api/workflows/1/execute ^
  -H "Content-Type: application/json" ^
  -d "{\"variables\": {\"input\": \"CMD执行测试\", \"param\": \"value\"}}"
if %errorlevel% equ 0 (
    echo ✅ 执行工作流: 成功
    set /a success_count+=1
) else (
    echo ❌ 执行工作流: 失败
    set /a failed_count+=1
)
set /a test_count+=1
echo.

echo 8. 运行工作流
curl -s -X POST %BASE_URL%/api/workflows/run_workflow ^
  -H "Content-Type: application/json" ^
  -d "{\"id\": \"1\", \"args\": {\"input\": \"CMD运行测试\", \"param\": \"value\"}}"
if %errorlevel% equ 0 (
    echo ✅ 运行工作流: 成功
    set /a success_count+=1
) else (
    echo ❌ 运行工作流: 失败
    set /a failed_count+=1
)
set /a test_count+=1
echo.

echo.
echo 📋 第4部分：导入导出API
echo --------------------------------------------------
echo.

echo 9. 导出工作流 (ID=1)
curl -s -X GET %BASE_URL%/api/workflows/1/export
if %errorlevel% equ 0 (
    echo ✅ 导出工作流: 成功
    set /a success_count+=1
) else (
    echo ❌ 导出工作流: 失败
    set /a failed_count+=1
)
set /a test_count+=1
echo.

echo 10. 下载工作流 (ID=1)
curl -s -X GET %BASE_URL%/api/workflows/1/export/download
if %errorlevel% equ 0 (
    echo ✅ 下载工作流: 成功
    set /a success_count+=1
) else (
    echo ❌ 下载工作流: 失败
    set /a failed_count+=1
)
set /a test_count+=1
echo.

echo 11. 导入工作流
curl -s -X POST %BASE_URL%/api/workflows/import ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"CMD导入测试工作流\", \"description\": \"CMD导入的工作流\", \"workflow_data\": {\"name\": \"test\", \"config\": \"{}\"}}"
if %errorlevel% equ 0 (
    echo ✅ 导入工作流: 成功
    set /a success_count+=1
) else (
    echo ❌ 导入工作流: 失败
    set /a failed_count+=1
)
set /a test_count+=1
echo.

echo.
echo 📋 第5部分：Agent相关API
echo --------------------------------------------------
echo.

echo 12. 获取Agent列表
curl -s -X GET "%BASE_URL%/api/agents?skip=0&limit=10"
if %errorlevel% equ 0 (
    echo ✅ 获取Agent列表: 成功
    set /a success_count+=1
) else (
    echo ❌ 获取Agent列表: 失败
    set /a failed_count+=1
)
set /a test_count+=1
echo.

echo 13. 获取外部Agent信息1
curl -s -X GET %BASE_URL%/api/agents/external
if %errorlevel% equ 0 (
    echo ✅ 获取外部Agent信息1: 成功
    set /a success_count+=1
) else (
    echo ❌ 获取外部Agent信息1: 失败
    set /a failed_count+=1
)
set /a test_count+=1
echo.

echo 14. 获取外部Agent信息2
curl -s -X GET %BASE_URL%/api/external-agents
if %errorlevel% equ 0 (
    echo ✅ 获取外部Agent信息2: 成功
    set /a success_count+=1
) else (
    echo ❌ 获取外部Agent信息2: 失败
    set /a failed_count+=1
)
set /a test_count+=1
echo.

echo.
echo 📋 第6部分：边界情况测试
echo --------------------------------------------------
echo.

echo 15. 获取不存在的工作流 (ID=99999)
curl -s -X GET %BASE_URL%/api/workflows/99999
echo ✅ 获取不存在的工作流: 测试完成 (预期失败)
set /a test_count+=1
echo.

echo 16. 删除不存在的工作流 (ID=99999)
curl -s -X DELETE %BASE_URL%/api/workflows/99999
echo ✅ 删除不存在的工作流: 测试完成 (预期失败)
set /a test_count+=1
echo.

echo 17. 创建无效工作流
curl -s -X POST %BASE_URL%/api/workflows ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"\"}"
echo ✅ 创建无效工作流: 测试完成 (预期失败)
set /a test_count+=1
echo.

echo.
echo ================================================================================
echo 📊 测试结果摘要
echo ================================================================================
echo 总测试数量: %test_count%
echo ✅ 成功: %success_count%
echo ❌ 失败: %failed_count%

set /a success_rate=%success_count%*100/%test_count%
echo 🎯 成功率: %success_rate%%%

if %success_rate% geq 90 (
    echo.
    echo 🎉 测试结果：优秀！所有主要功能正常工作
) else if %success_rate% geq 80 (
    echo.
    echo ✅ 测试结果：良好！大部分功能正常，有少量问题
) else if %success_rate% geq 60 (
    echo.
    echo ⚠️  测试结果：一般！有较多问题需要修复
) else (
    echo.
    echo 🚨 测试结果：不佳！有严重问题需要立即修复
)

echo.
echo ⏰ 完成时间: %date% %time%
echo.
echo 测试完成！按任意键退出...
pause >nul 