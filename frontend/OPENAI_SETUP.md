# OpenAI API 配置说明

## 配置步骤

1. 打开文件 `src/openaicall/localConfig.ts`
2. 将你的OpenAI API Key替换到配置中：

```typescript
export const LOCAL_CONFIG = {
  OPENAI_API_KEY: 'sk-your-actual-api-key-here',
};
```

## 重要说明

- 确保API Key以 `sk-` 开头
- 不要将真实的API Key提交到代码仓库中
- 建议将 `localConfig.ts` 文件添加到 `.gitignore` 中
- 确保您的OpenAI账户有足够的配额

## 支持的模型

- gpt-4o-mini (默认，推荐用于开发)
- gpt-4
- gpt-4-turbo
- gpt-3.5-turbo

## 功能说明

- 如果用户引用了文档，文档内容会自动添加到prompt中
- 如果选择了Agent，会使用Agent的系统提示和指定模型
- 如果没有选择Agent，默认使用gpt-4o-mini模型
- Agent的调用次数会自动增加

## 错误处理

如果出现"OpenAI API Key未配置"错误，请检查：
1. `src/openaicall/localConfig.ts` 文件是否存在
2. API Key是否正确设置在 `LOCAL_CONFIG.OPENAI_API_KEY` 中
3. API Key格式是否正确（应该以 `sk-` 开头） 