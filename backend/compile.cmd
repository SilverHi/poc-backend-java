echo off
echo 开始编译项目...
cd /d "%~dp0"
mvn clean install -DskipTests
if %ERRORLEVEL% EQU 0 (
    echo ✅ 编译成功！
) else (
    echo ❌ 编译失败！
)
pause 