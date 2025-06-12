# 工作流执行功能需求文档

## 📋 功能概览

### 核心目标
实现工作流（Workflow）的自动化执行系统，支持多个Agent的链式调用，代替用户自动完成预设的对话流程。

### 本质描述
> **工作流 = 自动化的多Agent链式对话**
> 
> 按预设顺序自动选择不同的Agent完成一系列提问，实现复杂任务的分步骤自动化处理。

---

## 📊 数据结构

### 工作流数据来源
- **来源**：右侧Workflow组件透传
- **触发**：用户点击workflow卡片
- **传递方式**：通过props或回调函数传递完整数据到ChatArea组件

### 核心数据结构

#### 1. `vars` (启动变量)
```typescript
interface WorkflowVariable {
  name: string;        // 变量名
  description: string; // 变量描述/说明
}
```

#### 2. `nodes` (节点列表)
```typescript
interface WorkflowNode {
  agentid: string;      // Agent ID，"-1"表示开始/结束节点
  name: string;         // 节点名称
  user_prompt: string;  // 用户提示词，可包含{{变量名}}占位符，可能为null
}
```

#### 3. `workflow` (完整工作流)
```typescript
interface Workflow {
  id: string;
  name: string;
  type: string;
  icon: string;
  description: string;
  agents: string[];        // 关联的Agent列表
  estimatedTime: string;   // 预估执行时间
  category: 'workflow';
  callCount: number;       // 调用次数
  nodes: WorkflowNode[];   // 节点列表
  vars: WorkflowVariable[]; // 启动变量列表
}
```

---

## 🎨 UI界面变化

### 输入区域状态转换

#### 状态流转图
```
正常状态：Input输入框
    ↓ (点击workflow卡片)
Form状态：动态表单
    ↓ (提交表单)
执行状态：显示工作流执行过程
    ↓ (执行完成)
正常状态：恢复Input输入框
```

#### 各状态详情

**1. 正常状态**
- 显示：常规的TextArea输入框
- 功能：用户可输入文本进行对话

**2. Form状态**
- 触发：用户点击workflow卡片后
- 显示：根据`vars`动态生成表单字段
- 特性：
  - 所有字段必填
  - 字段类型默认为文本输入框
  - 显示字段标签（`vars.name`）
  - 支持描述提示（`vars.description`）
- 操作：用户填写完毕点击"发送"按钮

**3. 执行状态**
- 触发：表单提交后
- 显示：工作流执行过程中的Cards和Steps
- 特性：禁用输入区域，显示Stop按钮

---

## 🔄 执行流程设计

### 整体执行逻辑

#### 1. 初始阶段
```
用户提交表单 → 显示用户输入Card(包含表单信息) → 开始工作流执行 → 恢复正常输入状态
```

#### 2. 节点执行循环
```
当前节点 → 变量替换 → 调用Agent API → 显示AI回复Card → 继续下一节点
```

#### 3. 结束阶段
```
执行到结束节点(id=-1) → 不显示额外Card 
```

### 变量替换规则

**基础替换**
- `{{变量名}}` → 用户填写的实际值
- 所有在`userPrompt`中的变量占位符都需要被替换

**上下文传递**
- 如果上一个节点是Agent节点(id > 0)
- 将上一个AI回复内容添加到当前`userPrompt`的开头
- 格式：`[上一个AI回复]\n\n[当前userPrompt]`

### 节点类型处理

**开始/结束节点 (agentid = "-1")**
- 不调用Agent API
- 不显示任何Card
- 直接跳转到下一个节点或结束流程

**Agent节点 (agentid != "-1")**
- 根据`agentid`调用对应Agent的API
- 显示用户输入Card（包含替换后的`user_prompt`和Agent信息）
- 显示AI回复Card
- 自动触发下一节点执行

---

## 🃏 Card显示逻辑

### 用户输入Card (复用+增强)

**原有功能保持**
- 显示用户输入内容
- 显示Agent信息
- 显示引用文档等

**新增功能**
- **表单信息区域**：首次显示时包含用户填写的表单数据
- **替换后的userPrompt**：显示当前节点经过变量替换后的提示词
- **当前Agent信息**：显示当前节点对应的Agent

### AI回复Card (完全复用)
- 显示当前节点Agent的回复结果
- 回复完成后自动触发下一节点执行
- 保持现有的所有功能和样式

### Steps显示
- 在节点间切换时显示"正在调用下一个节点"
- 显示当前执行进度
- 复用现有的StepCard组件

---

## 🛑 用户交互控制

### 执行状态管理

**1. 禁止操作蒙板**
- **作用范围**：覆盖整个聊天区域
- **显示时机**：工作流开始执行到完全结束
- **功能**：防止用户进行其他操作（发送消息、选择文档等）

**2. Stop按钮**
- **位置**：整体对话区域下方（参考OpenAI的设计风格）
- **显示时机**：工作流执行期间
- **点击效果**：
  - 设置停止标志，不再执行后续节点
  - 等待当前Agent调用完成
  - 当前调用正常显示结果
  - 完成后恢复正常状态

### 恢复正常状态
- **触发条件**：工作流执行完成 或 用户点击Stop按钮
- **操作**：
  - 移除蒙板
  - 隐藏Stop按钮
  - 输入框从执行状态恢复为正常的TextArea
    - 重新启用所有交互功能

---

## 🔧 技术实现要点

### 状态管理扩展

**新增状态**
```typescript
interface WorkflowState {
  isExecuting: boolean;              // 是否正在执行工作流
  currentWorkflow?: Workflow;        // 当前执行的工作流数据
  currentNodeIndex: number;          // 当前执行的节点索引
  formValues: Record<string, string>; // 用户填写的表单值 (变量名 -> 值)
  shouldStop: boolean;               // 是否应该停止执行
  lastAgentResponse?: string;        // 上一个Agent的回复内容
}
```

**ChatArea组件扩展Props**
```typescript
interface ChatAreaProps {
  // ... 现有props
  selectedWorkflow?: Workflow | null;    // 选中的工作流
  onWorkflowComplete?: () => void;       // 工作流完成回调
  onClearWorkflow?: () => void;          // 清除工作流选择
}
```

### 关键函数设计

**1. 工作流启动**
- `startWorkflow(workflow: Workflow, formValues: Record<string, any>)`
- 初始化工作流状态
- 显示首个用户输入Card

**2. 节点执行**
- `executeNode(nodeIndex: number)`
- 处理变量替换
- 调用Agent API
- 管理执行流程

**3. 变量替换**
- `replaceVariables(template: string, values: Record<string, string>, lastResponse?: string): string`
- 处理`{{变量名}}`占位符替换
- 如果存在上一个Agent回复，添加到开头

**4. 停止控制**
- `stopWorkflow()`
- 设置停止标志
- 等待当前调用完成

### API调用适配
- 复用现有的`aiChat` API
- 传递当前节点的`agentid`（注意字段名）
- 传递替换变量后的`user_prompt`
- 将上一节点的AI回复作为`previousAiOutput`传递
- 跳过`agentid`为"-1"的开始/结束节点

---

## ✅ 验收标准

### 功能验收
1. ✅ 点击workflow卡片后输入框变为表单
2. ✅ 表单字段根据vars动态生成，全部必填
3. ✅ 提交表单后显示用户输入Card（包含表单信息）
4. ✅ 自动执行工作流节点，显示对应的AI回复
5. ✅ 变量替换正确工作
6. ✅ 上一节点AI回复正确传递给下一节点
7. ✅ 执行期间显示蒙板和Stop按钮
8. ✅ Stop按钮功能正确
9. ✅ 执行完成后恢复正常状态

### UI验收
1. ✅ 表单样式与整体设计一致
2. ✅ Card显示正确复用现有组件
3. ✅ Stop按钮位置和样式参考OpenAI
4. ✅ 蒙板覆盖范围正确
5. ✅ 状态转换流畅无闪烁

---

## 📝 开发优先级

### Phase 1: 基础框架
- [ ] 工作流状态管理
- [ ] 输入区域状态切换
- [ ] 表单动态生成

### Phase 2: 执行逻辑
- [ ] 节点执行函数
- [ ] 变量替换逻辑
- [ ] API调用适配

### Phase 3: 交互控制
- [ ] 蒙板和Stop按钮
- [ ] 状态恢复逻辑
- [ ] 错误处理

### Phase 4: 优化完善
- [ ] UI细节调优
- [ ] 性能优化
- [ ] 测试完善