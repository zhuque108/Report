# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此仓库中工作时提供指导。

## 项目概述

**Hreport** 是一个基于 Next.js 16 的全栈应用，使用 shadcn/ui 构建，用于生成和导出报告。该项目使用 Coze CLI 进行开发和部署，重点关注报告生成、PDF 导出和表单提交工作流。

## 快速开始命令

### 开发
```bash
# 启动开发服务器（运行在端口 5000，支持热重载）
pnpm dev
# 或
bash ./scripts/dev.sh
```

### 构建与生产
```bash
# 为生产环境构建
pnpm build
# 或
bash ./scripts/build.sh

# 启动生产服务器（端口 5000）
pnpm start
# 或
bash ./scripts/start.sh
```

### 代码质量
```bash
# 运行 linter
pnpm lint

# 类型检查
pnpm ts-check
```

### 依赖管理
```bash
# 安装依赖（仅使用 pnpm）
pnpm install

# 添加新依赖
pnpm add package-name

# 添加开发依赖
pnpm add -D package-name
```

**重要提示**：此项目通过 preinstall 钩子强制使用 **pnpm**。使用 npm 或 yarn 会失败。

## 架构概览

### 技术栈
- **框架**：Next.js 16.1.1（App Router）
- **UI 组件**：shadcn/ui（基于 Radix UI）
- **样式**：Tailwind CSS v4
- **表单**：React Hook Form + Zod 验证
- **数据库**：Drizzle ORM（已配置但可能未被积极使用）
- **PDF 导出**：html2canvas + jspdf
- **AWS 集成**：AWS SDK S3 客户端用于文件上传
- **图标**：Lucide React
- **包管理器**：pnpm 9+
- **语言**：TypeScript 5.x

### 目录结构

```
src/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── export/pdf/route.ts   # PDF 导出端点
│   ├── report/[id]/page.tsx      # 动态报告显示页面
│   ├── submit/page.tsx           # 表单提交页面
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页
│   └── globals.css               # 全局样式 + 主题变量
├── components/
│   ├── ui/                       # shadcn/ui 基础组件（50+ 个组件）
│   └── report/                   # 报告特定组件
│       ├── ReportCover.tsx
│       ├── ReportPage1-4.tsx
│       ├── ReportBackCover.tsx
│       ├── ReportNavigation.tsx
│       ├── ExportPDFButton.tsx
│       ├── PrintButton.tsx
│       └── ReportClientWrapper.tsx
└── lib/
    └── utils.ts                  # 工具函数（cn() 用于类名合并）
```

### 关键应用流程

1. **首页** (`src/app/page.tsx`) - 登陆/入口点
2. **提交页面** (`src/app/submit/page.tsx`) - 报告数据提交表单
3. **报告显示** (`src/app/report/[id]/page.tsx`) - 动态报告渲染（多页面）
4. **PDF 导出** (`src/app/api/export/pdf/route.ts`) - 服务端 PDF 生成端点

### 报告组件架构

报告系统使用多页面组件结构：
- `ReportCover.tsx` - 封面
- `ReportPage1-4.tsx` - 内容页面
- `ReportBackCover.tsx` - 封底
- `ReportNavigation.tsx` - 页面导航
- `ExportPDFButton.tsx` - 触发 PDF 导出 API
- `PrintButton.tsx` - 浏览器打印功能
- `ReportClientWrapper.tsx` - 交互功能的客户端包装器

## 开发指南

### 组件开发

**始终优先使用 shadcn/ui 组件**（来自 `src/components/ui/`）。项目包含 50+ 个预构建组件：
- 表单：button、input、textarea、select、checkbox、radio-group、switch、slider
- 布局：card、separator、tabs、accordion、collapsible、scroll-area
- 反馈：alert、dialog、toast (sonner)、progress
- 导航：dropdown-menu、menubar、navigation-menu、context-menu
- 数据：table、avatar、badge、tooltip、popover
- 其他：calendar、command、carousel、resizable、sidebar

### 路由

Next.js App Router 使用基于文件系统的路由：
- `src/app/page.tsx` → `/`
- `src/app/about/page.tsx` → `/about`
- `src/app/posts/[id]/page.tsx` → `/posts/:id`（动态）
- `src/app/api/users/route.ts` → `/api/users`（API 端点）

### 样式

- 直接使用 Tailwind CSS v4 类名
- 主题变量定义在 `src/app/globals.css`（支持亮色/暗色模式）
- 使用 `@/lib/utils` 中的 `cn()` 工具有条件地合并类名
- 可用主题变量：`--background`、`--foreground`、`--primary`、`--secondary`、`--accent`、`--destructive`、`--border`、`--input`、`--ring` 等

### 表单

使用 React Hook Form + Zod 进行类型安全的表单验证：
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export default function MyForm() {
  const form = useForm({ resolver: zodResolver(schema) });
  // ...
}
```

### 路径别名

使用 `@/` 前缀进行导入（在 tsconfig.json 中配置）：
```tsx
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
```

## PDF 导出实现

项目使用 **html2canvas + jspdf** 进行 PDF 生成：
- 客户端：`ExportPDFButton.tsx` 捕获 DOM 并发送到 API
- 服务端：`src/app/api/export/pdf/route.ts` 处理并返回 PDF
- 如需要可使用 jsdom 进行服务端渲染

## 配置文件

- `next.config.ts` - Next.js 配置（Coze CDN 的远程图像模式）
- `tsconfig.json` - TypeScript 配置（包含 `@/*` 路径别名）
- `tailwind.config.ts` - Tailwind CSS v4 配置
- `package.json` - 依赖和脚本（强制使用 pnpm）

## 环境与部署

- **开发端口**：5000（可通过 `DEPLOY_RUN_PORT` 配置）
- **工作区路径**：可通过 `COZE_WORKSPACE_PATH` 环境变量配置
- **构建脚本**：位于 `scripts/` 目录（基于 bash）
- **部署**：为 Coze 平台集成设计

## 常见开发任务

### 添加新页面
1. 创建 `src/app/[route]/page.tsx`
2. 使用 shadcn/ui 组件构建 UI
3. 如需要添加元数据导出用于 SEO

### 创建报告组件
1. 在 `src/components/report/` 中创建组件
2. 参考现有报告组件
3. 与 `ReportClientWrapper.tsx` 集成以实现客户端交互

### 添加 API 端点
1. 创建 `src/app/api/[route]/route.ts`
2. 根据需要导出 `GET`、`POST`、`PUT`、`DELETE` 函数
3. 使用 `NextResponse` 返回响应

### 样式组件
1. 直接使用 Tailwind 类名
2. 参考主题变量以保持颜色一致性
3. 使用 `cn()` 进行条件类名合并

## 重要说明

- **TypeScript**：启用严格模式 - 所有代码必须类型安全
- **包管理器**：仅允许使用 pnpm（通过 preinstall 钩子强制）
- **组件**：优先使用 shadcn/ui 组件的组合而非自定义实现
- **服务端 vs 客户端**：使用 `'use client'` 指令进行客户端交互；服务端组件为默认
- **路径导入**：始终使用 `@/` 别名进行内部导入
