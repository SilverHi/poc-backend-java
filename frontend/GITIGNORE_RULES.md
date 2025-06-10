# Git 忽略规则建议

## 保护API Key安全

为了防止意外提交API Key到代码仓库，建议在项目根目录的 `.gitignore` 文件中添加以下规则：

```
# OpenAI API Key 配置文件
src/openaicall/localConfig.ts

# 环境变量文件
.env
.env.local
.env.development
.env.test
.env.production
```

## 如何添加到.gitignore

1. 打开项目根目录的 `.gitignore` 文件
2. 在文件末尾添加上述规则
3. 保存文件

这样可以确保你的API Key不会被意外提交到版本控制系统中。 