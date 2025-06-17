@echo off
chcp 65001
echo 测试工作流API接口

echo.
echo 1. 测试模块状态
curl -X GET http://localhost:8080/api/workflow/test/status

echo.
echo.
echo 2. 测试健康检查
curl -X GET http://localhost:8080/api/workflow/test/health

echo.
echo.
echo 3. 测试获取工作流列表
curl -X GET "http://localhost:8080/api/workflows?skip=0&limit=10"

echo.
echo.
echo 4. 测试获取外部Agent信息
curl -X GET http://localhost:8080/api/external-agents

echo.
echo.
echo 5. 测试创建工作流
curl -X POST http://localhost:8080/api/workflows ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"测试工作流\", \"description\": \"这是一个测试工作流\", \"config\": \"{\\\"nodes\\\":[],\\\"edges\\\":[]}\"}"

echo.
echo.
echo 测试完成！
pause 