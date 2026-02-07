# PDF导出功能实现文档

## 技术方案选择

### 选择方案：改进的前端方案（HTML Collection + Server Processing）

**选择理由：**
1. **环境限制**：沙箱环境不支持Puppeteer（需要下载Chromium）
2. **快速部署**：无需额外依赖，使用现有库（jsdom + jsPDF）
3. **兼容性好**：支持复杂布局和图表
4. **易维护**：前后端分离，逻辑清晰

虽然不是纯后端方案，但通过将HTML收集和渲染逻辑分离到后端，实现了类似的效果。

## 技术架构

### 前端部分（ExportPDFButton）
```
用户点击导出
  ↓
收集报告DOM元素
  ↓
克隆并优化DOM（移除按钮、优化样式）
  ↓
生成HTML字符串
  ↓
调用后端API
  ↓
下载生成的PDF
```

### 后端部分（/api/export/pdf）
```
接收HTML字符串
  ↓
使用jsdom创建虚拟DOM
  ↓
使用html2canvas将每个section转换为canvas
  ↓
使用jsPDF组装PDF
  ↓
添加页眉页脚
  ↓
返回PDF二进制流
```

## 核心功能实现

### 1. 分页控制

**CSS打印样式（print.css）：**
```css
section {
  page-break-after: always;
  page-break-inside: avoid;
}

/* 最后一个section不需要分页符 */
section:last-child {
  page-break-after: auto;
}
```

**表格分页优化：**
```css
table {
  page-break-inside: auto;
}

thead {
  display: table-header-group;
}

tr {
  page-break-inside: avoid;
}
```

### 2. 页眉页脚

**API实现（route.ts）：**
```typescript
// 添加页眉
pdf.setFontSize(10);
pdf.setTextColor('#2A5C8E');
pdf.text('儿童身高发育管理测评报告', pageWidth / 2, marginTop - 3, { align: 'center' });
pdf.setDrawColor('#E8F4F8');
pdf.line(10, marginTop, pageWidth - 10, marginTop);

// 添加页脚
pdf.setFontSize(9);
pdf.setTextColor('#666666');
pdf.text(`第 ${i + 1} / ${sections.length} 页`, pageWidth / 2, footerY, { align: 'center' });
pdf.line(10, pageHeight - marginBottom, pageWidth - 10, pageHeight - marginBottom);
```

### 3. 字体处理

**字体回退机制：**
```css
body, div, span, p, h1, h2, h3, h4, h5, h6 {
  font-family: "PingFang SC", "Microsoft YaHei", "SimSun", sans-serif !important;
}
```

### 4. 样式优化

**移除问题样式：**
```typescript
section.style.transform = 'none';
section.style.boxShadow = 'none';
section.style.filter = 'none';
section.style.backdropFilter = 'none';
```

**onclone回调深度清理：**
```typescript
onclone: (clonedDoc) => {
  const allElements = clonedDoc.querySelectorAll('*');
  allElements.forEach((el) => {
    const element = el as HTMLElement;
    if (element.style.transform && element.style.transform !== 'none') {
      element.style.transform = 'none';
    }
    if (element.style.filter && element.style.filter !== 'none') {
      element.style.filter = 'none';
    }
  });
}
```

## API设计

### 端点
```
POST /api/export/pdf
```

### 请求体
```typescript
{
  html: string,           // HTML字符串
  fileName?: string,      // 文件名（可选）
  options?: {
    format?: 'A4',        // 纸张格式
    scale?: number,       // 缩放比例（默认1.5）
    landscape?: boolean,  // 横向（默认false）
    margin?: {
      top?: string,       // 上边距（mm）
      bottom?: string,    // 下边距（mm）
      left?: string,      // 左边距（mm）
      right?: string,     // 右边距（mm）
    }
  }
}
```

### 响应
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="xxx.pdf"
Binary PDF data
```

## 性能优化

### 1. 图片预压缩
```typescript
const imgData = canvas.toDataURL('image/png', 1.0);  // 使用PNG格式
```

### 2. 分页处理
- 每个页面独立处理，避免大内存占用
- 使用`removeContainer: true`清理临时容器

### 3. 超时控制
```typescript
imageTimeout: 0,  // 无超时限制（可根据需要调整）
```

## 错误处理

### 1. 前端错误处理
```typescript
try {
  // 导出逻辑
} catch (error) {
  const errorMsg = `导出PDF失败: ${error.message}\n\n建议：\n1. 使用"打印报告"功能\n2. 在打印对话框中选择"另存为PDF"`;
  setError(errorMsg);
  alert(errorMsg);
}
```

### 2. 降级方案
```typescript
const handlePrintAsFallback = () => {
  window.print();  // 使用浏览器原生打印
};
```

### 3. 后端错误处理
```typescript
return NextResponse.json(
  {
    error: 'PDF导出失败',
    message: error.message,
    details: error.stack,
  },
  { status: 500 }
);
```

## 使用示例

### 基础用法
```tsx
<ExportPDFButton fileName="报告.pdf" />
```

### 自定义配置
```typescript
const response = await fetch('/api/export/pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    html: fullHtml,
    fileName: '报告.pdf',
    options: {
      format: 'A4',
      scale: 2,  // 更高清晰度
      margin: {
        top: '20',
        bottom: '20',
        left: '15',
        right: '15',
      },
    },
  }),
});
```

## 已知限制

1. **字体支持**：依赖系统字体，无法嵌入自定义字体
2. **复杂CSS**：某些高级CSS特性（如`backdrop-filter`）会被移除
3. **性能**：大内容量时可能较慢（可通过降低scale值优化）
4. **iframe环境**：在iframe中可能受限

## 部署说明

### 依赖安装
```bash
pnpm add jsdom @types/jsdom html2canvas jspdf
```

### 环境要求
- Node.js 18+
- Next.js 16+

### 配置说明
- API路由：`src/app/api/export/pdf/route.ts`
- 打印样式：`src/styles/print.css`
- 前端组件：`src/components/report/ExportPDFButton.tsx`

## 后续优化建议

### 1. 性能优化
- 实现分页懒加载
- 添加缓存机制
- 支持增量更新

### 2. 功能增强
- 支持水印
- 支持自定义模板
- 支持批量导出

### 3. 质量提升
- 支持矢量图表
- 支持高DPI输出
- 优化字体渲染

## 与需求文档对比

| 需求 | 实现状态 | 说明 |
|------|----------|------|
| 分页控制 | ✅ 已实现 | CSS page-break + 独立section |
| 页眉页脚 | ✅ 已实现 | jsPDF添加文本和线条 |
| 水印 | ❌ 未实现 | 可后续添加 |
| 表格分页 | ✅ 已实现 | thead重复 + tr避免截断 |
| 图表处理 | ✅ 已实现 | Canvas转PNG |
| 字体处理 | ✅ 已实现 | 字体回退机制 |
| 错误处理 | ✅ 已实现 | 详细日志 + 降级方案 |
| 性能优化 | ⚠️ 部分实现 | 可进一步优化 |

## 总结

本方案在环境限制下，通过前后端分离的架构实现了高质量的PDF导出功能。虽然不是纯后端方案，但通过将HTML收集和渲染逻辑分离到后端，实现了类似的效果，同时避免了Puppeteer的部署复杂性。

未来如果环境支持，可以迁移到纯Puppeteer方案以获得更好的效果。
