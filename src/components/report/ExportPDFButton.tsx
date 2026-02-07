'use client';

import { Button } from '@/components/ui/button';
import { Download, Loader2, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface ExportPDFButtonProps {
  fileName?: string;
}

export default function ExportPDFButton({ fileName }: ExportPDFButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  const checkIsInIframe = (): boolean => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setError(null);
    setProgress('准备导出...');

    // 检查是否在iframe中
    const isInIframe = checkIsInIframe();
    if (isInIframe) {
      console.warn('当前在iframe环境中，PDF导出可能受限');
    }

    try {
      setProgress('正在收集报告内容...');

      // 查找所有报告页面section
      const sections = document.querySelectorAll('section.rounded-lg.bg-white');
      console.log('找到的sections数量:', sections.length);

      if (sections.length === 0) {
        const errorMsg = '未找到报告内容，请刷新页面后重试';
        console.error(errorMsg);
        setError(errorMsg);
        alert(errorMsg);
        return;
      }

      setProgress('正在生成HTML...');

      // 收集所有section的HTML
      const htmlSections: string[] = [];
      sections.forEach((section) => {
        const clonedSection = section.cloneNode(true) as HTMLElement;
        // 移除不需要的元素
        const noPrintElements = clonedSection.querySelectorAll('.no-print, button, nav');
        noPrintElements.forEach(el => el.remove());

        // 优化样式
        clonedSection.style.transform = 'none';
        clonedSection.style.boxShadow = 'none';
        clonedSection.style.filter = 'none';
        clonedSection.style.backdropFilter = 'none';
        clonedSection.style.position = 'static';
        clonedSection.style.borderRadius = '0';

        htmlSections.push(clonedSection.outerHTML);
      });

      // 组合完整的HTML
      const fullHtml = `
        <!DOCTYPE html>
        <html lang="zh-CN">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>儿童身高发育管理测评报告</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            section {
              width: 793px;
              height: 1122px;
              overflow: hidden;
              page-break-after: always;
              background: white;
            }
          </style>
        </head>
        <body>
          ${htmlSections.join('\n')}
        </body>
        </html>
      `;

      setProgress('正在调用PDF生成服务...');

      // 调用后端API
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: fullHtml,
          fileName: fileName || `儿童身高发育管理测评报告_${new Date().toISOString().slice(0, 10)}.pdf`,
          options: {
            format: 'A4',
            scale: 1.5,
            landscape: false,
            margin: {
              top: '15',    // 页眉高度
              bottom: '15', // 页脚高度
              left: '10',
              right: '10',
            },
          },
        }),
      });

      setProgress('正在下载PDF文件...');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'PDF生成失败');
      }

      // 下载PDF文件
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || `儿童身高发育管理测评报告_${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log('PDF导出成功！');
      setProgress('');
      alert('PDF导出成功！');

    } catch (error) {
      console.error('导出PDF失败:', error);
      const errorMsg = `导出PDF失败: ${error instanceof Error ? error.message : '未知错误'}\n\n建议：\n1. 使用"打印报告"功能\n2. 在打印对话框中选择"另存为PDF"`;
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintAsFallback = () => {
    console.log('使用打印功能作为降级方案...');
    window.print();
  };

  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={handleExportPDF}
        disabled={isExporting}
        size="lg"
        className="shadow-lg bg-blue-600 hover:bg-blue-700"
      >
        {isExporting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            {progress || '正在导出...'}
          </>
        ) : (
          <>
            <Download className="mr-2 h-5 w-5" />
            导出PDF
          </>
        )}
      </Button>

      {error && (
        <Button
          onClick={handlePrintAsFallback}
          variant="outline"
          size="sm"
          className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          导出失败？使用打印功能
        </Button>
      )}
    </div>
  );
}
