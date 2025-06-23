#!/usr/bin/env python3
"""
Mock Research API - 单文件FastAPI服务
提供一个模拟的研究查询接口，使用OpenAI 4o-mini生成回答

使用方法：
1. 安装依赖: pip install fastapi uvicorn openai python-multipart pydantic
2. 设置环境变量: export OPENAI_API_KEY="your-api-key"
3. 运行服务: python main.py

API接口:
POST /research
- query: str (用户查询)
- max_number: int (3 或 6，控制思考深度和响应时间)
"""

import asyncio
import random
import time
from typing import List, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os

# 尝试导入openai，如果失败则使用fallback模式
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    print("警告: OpenAI库未安装，将使用fallback模式")
    OPENAI_AVAILABLE = False

app = FastAPI(title="Mock Research API", version="1.0.0", description="模拟研究查询API服务")

# OpenAI配置
if OPENAI_AVAILABLE:
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if not openai_api_key:
        print("警告: 未设置OPENAI_API_KEY环境变量，将使用fallback模式")
        OPENAI_AVAILABLE = False

class QueryRequest(BaseModel):
    query: str
    max_number: int  # 3 or 6

class QueryResponse(BaseModel):
    result: str  # HTML格式的回答
    raw_result: str  # 不带格式的原始回答
    consume_token: int  # 消耗的token数
    metadata: Dict[str, Any]  # metadata对象
    chunk: List[str]  # 字符串数组，相关文档片段原文

@app.post("/research", response_model=QueryResponse)
async def research_query(request: QueryRequest):
    """
    研究查询的mock接口
    根据max_number参数模拟不同的响应时间：
    - max_number=3: 2-4分钟响应时间
    - max_number=6: 3-6分钟响应时间
    """
    
    # 验证max_number参数
    if request.max_number not in [3, 6]:
        raise HTTPException(status_code=400, detail="max_number must be 3 or 6")
    
    # 根据max_number设置延迟时间
    if request.max_number == 3:
        delay_seconds = random.randint(120, 240)  # 2-4分钟
    else:  # max_number == 6
        delay_seconds = random.randint(180, 360)  # 3-6分钟
    print(f"delay_seconds: {delay_seconds}")
    # 模拟处理时间
    # await asyncio.sleep(delay_seconds)
    
    # 尝试使用OpenAI生成真实回答
    if OPENAI_AVAILABLE:
        try:
            # 使用OpenAI 4o-mini生成回答
            client = openai.OpenAI(api_key=openai_api_key)
            
            # 生成原始回答
            completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system", 
                        "content": "你是一个专业的研究助手，请根据用户的查询提供详细且有用的回答。回答应该准确、全面且易于理解。"
                    },
                    {
                        "role": "user", 
                        "content": f"请详细回答以下问题：{request.query}"
                    }
                ],
                max_tokens=2000,
                temperature=0.7
            )
            
            raw_result = completion.choices[0].message.content
            consume_token = completion.usage.total_tokens
            
            # 将原始回答转换为HTML格式
            html_result = convert_to_html(raw_result)
            
            # 生成mock的文档片段
            chunk_completion = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "system",
                        "content": "请生成3-5个与查询相关的文档片段，每个片段应该是独立的信息块。"
                    },
                    {
                        "role": "user",
                        "content": f"为这个查询生成相关文档片段：{request.query}"
                    }
                ],
                max_tokens=800,
                temperature=0.5
            )
            
            chunk_text = chunk_completion.choices[0].message.content
            chunks = [chunk.strip() for chunk in chunk_text.split('\n\n') if chunk.strip()]
            
            # 更新总token消耗
            consume_token += chunk_completion.usage.total_tokens
            
            # 生成metadata
            metadata = {
                "query_complexity": request.max_number,
                "processing_time": delay_seconds,
                "model_used": "gpt-4o-mini",
                "timestamp": int(time.time()),
                "confidence_score": random.uniform(0.7, 0.95),
                "sources_count": len(chunks)
            }
            
            return QueryResponse(
                result=html_result,
                raw_result=raw_result,
                consume_token=consume_token,
                metadata=metadata,
                chunk=chunks
            )
            
        except Exception as e:
            print(f"OpenAI调用失败: {e}")
            # 如果OpenAI调用失败，返回mock数据
            return generate_fallback_response(request.query, request.max_number, delay_seconds)
    else:
        # 如果OpenAI不可用，直接返回mock数据
        return generate_fallback_response(request.query, request.max_number, delay_seconds)

def convert_to_html(text: str) -> str:
    """将纯文本转换为HTML格式"""
    if not text:
        return "<p>没有内容</p>"
    
    # 处理段落分隔
    paragraphs = text.split('\n\n')
    html_paragraphs = []
    
    for paragraph in paragraphs:
        if paragraph.strip():
            # 处理换行
            formatted_paragraph = paragraph.replace('\n', '<br>')
            html_paragraphs.append(f'<p>{formatted_paragraph}</p>')
    
    # 组合HTML内容
    content = '\n'.join(html_paragraphs)
    
    # 添加美观的样式
    html = f"""
    <div style="
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
        line-height: 1.8; 
        color: #2c3e50; 
        max-width: 800px; 
        margin: 0 auto;
        padding: 20px;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    ">
        <div style="
            background: white; 
            padding: 25px; 
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        ">
            {content}
        </div>
    </div>
    """
    return html

def generate_fallback_response(query: str, max_number: int, delay_seconds: int) -> QueryResponse:
    """生成fallback响应（当OpenAI不可用时）"""
    
    raw_result = f"""
    根据您的查询"{query}"，这是一个模拟的研究结果。
    
    在深度为{max_number}的分析中，我们发现以下关键信息：
    
    1. 相关概念和定义
    2. 主要影响因素
    3. 当前发展趋势
    4. 实际应用案例
    
    这个回答是基于广泛的资料分析和专业判断得出的。
    """
    
    html_result = convert_to_html(raw_result)
    
    chunks = [
        f"文档片段1：关于{query}的基础概念介绍...",
        f"文档片段2：{query}的历史发展和演变过程...",
        f"文档片段3：{query}在实际应用中的案例分析...",
        f"文档片段4：{query}的未来发展趋势和前景..."
    ]
    
    metadata = {
        "query_complexity": max_number,
        "processing_time": delay_seconds,
        "model_used": "fallback-mock",
        "timestamp": int(time.time()),
        "confidence_score": 0.8,
        "sources_count": len(chunks)
    }
    
    return QueryResponse(
        result=html_result,
        raw_result=raw_result.strip(),
        consume_token=random.randint(800, 1500),
        metadata=metadata,
        chunk=chunks
    )

@app.get("/")
async def root():
    return {"message": "Mock Research API is running", "endpoints": ["/research"]}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": int(time.time()),
        "openai_available": OPENAI_AVAILABLE,
        "version": "1.0.0"
    }

@app.get("/test")
async def test_endpoint():
    """快速测试接口，无延迟"""
    test_query = "这是一个测试查询"
    test_response = generate_fallback_response(test_query, 3, 0)
    return {
        "message": "测试接口正常",
        "sample_response": test_response,
        "note": "这是一个快速测试，实际/research接口会有2-6分钟的延迟"
    }

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 启动Mock Research API服务")
    print("=" * 60)
    print("📊 API文档地址: http://localhost:8000/docs")
    print("🏥 健康检查: http://localhost:8000/health")
    print("🔍 研究接口: POST http://localhost:8000/research")
    print("-" * 60)
    print("📋 请求示例:")
    print('curl -X POST "http://localhost:8000/research" \\')
    print('  -H "Content-Type: application/json" \\')
    print('  -d \'{"query": "什么是人工智能?", "max_number": 3}\'')
    print("=" * 60)
    
    try:
        import uvicorn
        uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
    except ImportError:
        print("❌ 错误: 未安装uvicorn")
        print("请运行: pip install uvicorn")
    except Exception as e:
        print(f"❌ 启动失败: {e}")
        print("请检查端口8000是否被占用") 