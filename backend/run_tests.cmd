@echo off
chcp 65001
echo 准备运行工作流API测试...
echo.

echo 检查Python环境...
python --version
if errorlevel 1 (
    echo ❌ Python未安装或不在PATH中
    echo 请先安装Python 3.6+
    pause
    exit /b 1
)

echo.
echo 检查requests库...
python -c "import requests; print('✅ requests库已安装，版本:', requests.__version__)" 2>nul
if errorlevel 1 (
    echo ❌ requests库未安装，正在安装...
    pip install requests
    if errorlevel 1 (
        echo ❌ 安装requests失败，请手动安装: pip install requests
        pause
        exit /b 1
    )
)

echo.
echo 🚀 开始运行工作流API测试...
echo ========================================
python test_workflow_apis.py

echo.
echo ========================================
echo 测试完成！按任意键退出...
pause 