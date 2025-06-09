# 组件结构说明

## 目录结构

```
src/components/
├── common/                    # 通用组件目录
│   ├── Navigation.tsx        # 导航栏组件 (全局通用)
│   └── index.ts             # common模块导出
├── home/                     # Home模块组件目录
│   ├── ResourcePanel.tsx    # 资源选择面板
│   ├── AgentsPanel.tsx      # AI助手选择面板
│   ├── ChatArea.tsx         # 对话区域
│   ├── Home.tsx             # Home页面主组件
│   └── index.ts             # home模块导出
└── index.ts                 # 总导出文件
```

## 设计理念

### 1. 模块化设计
- **按功能模块分类**：每个模块都有独立的目录
- **clear separation**：通用组件与特定模块组件分离
- **可扩展性**：便于添加新的功能模块

### 2. 导入导出规范

#### 在模块内部使用相对路径：
```typescript
// home/Home.tsx
import ResourcePanel from './ResourcePanel';
import ChatArea from './ChatArea';
import AgentsPanel from './AgentsPanel';
```

#### 跨模块使用命名导出：
```typescript
// home/Home.tsx
import { Navigation } from '../common';
```

#### 在应用层使用统一导出：
```typescript
// App.tsx
import { Home } from './components';
```

### 3. 模块说明

#### Common 模块
- **用途**：存放可在多个模块间复用的通用组件
- **组件**：Navigation（导航栏）
- **特点**：这些组件不依赖特定业务逻辑

#### Home 模块
- **用途**：聊天首页相关的所有组件
- **组件**：ResourcePanel、AgentsPanel、ChatArea、Home
- **特点**：这些组件专门为聊天功能设计

## 添加新模块

当需要添加新模块时，按照以下步骤：

### 1. 创建模块目录
```bash
mkdir src/components/新模块名
```

### 2. 创建模块组件
```bash
# 在新模块目录下创建组件文件
touch src/components/新模块名/组件名.tsx
```

### 3. 创建模块导出文件
```typescript
// src/components/新模块名/index.ts
export { default as 组件名 } from './组件名';
```

### 4. 更新总导出文件
```typescript
// src/components/index.ts
export * from './common';
export * from './home';
export * from './新模块名';  // 添加这行
```

## 示例：添加Settings模块

```
src/components/
├── common/
├── home/
├── settings/                  # 新增模块
│   ├── SettingsPanel.tsx
│   ├── UserProfile.tsx
│   ├── Settings.tsx
│   └── index.ts
└── index.ts
```

这样的结构使得：
- **代码组织清晰**：每个模块职责明确
- **维护性强**：修改某个模块不影响其他模块
- **可扩展性好**：添加新功能模块很容易
- **复用性高**：通用组件可以被多个模块使用 