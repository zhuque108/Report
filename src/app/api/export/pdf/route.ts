import { NextRequest, NextResponse } from 'next/server';

interface ExportPDFRequest {
  html: string;
  fileName?: string;
  options?: {
    format?: 'A4';
    margin?: {
      top?: string;
      bottom?: string;
      left?: string;
      right?: string;
    };
    scale?: number;
    landscape?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportPDFRequest = await request.json();

    // 验证请求参数
    if (!body.html) {
      return NextResponse.json(
        { error: '缺少必需参数: html' },
        { status: 400 }
      );
    }

    // 获取配置
    const options = body.options || {};
    const scale = options.scale || 1.5;
    const format = options.format || 'A4';

    // A4尺寸（毫米）
    const pageWidth = 210;
    const pageHeight = 297;

    // 动态导入（避免服务端渲染问题）
    const { JSDOM } = await import('jsdom');

    // 创建DOM环境
    const dom = new JSDOM(body.html, {
      runScripts: 'dangerously',
      resources: 'usable',
    });

    const document = dom.window.document;

    // 查找所有报告页面
    const sections = document.querySelectorAll('section');

    if (sections.length === 0) {
      return NextResponse.json(
        { error: '未找到报告内容' },
        { status: 400 }
      );
    }

    // 动态导入jsPDF
    const { default: jsPDF } = await import('jspdf');

    // 创建PDF文档
    const pdf = new jsPDF({
      orientation: options.landscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: format,
    });

    // 动态导入html2canvas
    const { default: html2canvas } = await import('html2canvas');

    // 为每个页面生成PDF
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i] as HTMLElement;

      // 优化样式
      section.style.transform = 'none';
      section.style.boxShadow = 'none';
      section.style.filter = 'none';
      section.style.backdropFilter = 'none';
      section.style.position = 'static';

      // 添加页边距
      const marginTop = parseFloat(options.margin?.top || '0') || 0;
      const marginBottom = parseFloat(options.margin?.bottom || '0') || 0;
      const marginLeft = parseFloat(options.margin?.left || '0') || 0;
      const marginRight = parseFloat(options.margin?.right || '0') || 0;

      try {
        // 转换为canvas
        const canvas = await html2canvas(section, {
          scale: scale,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          allowTaint: false,
          foreignObjectRendering: false,
          imageTimeout: 0,
          removeContainer: true,
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
              if (element.style.backdropFilter && element.style.backdropFilter !== 'none') {
                element.style.backdropFilter = 'none';
              }
            });
          },
        });

        // 添加新页（除第一页）
        if (i > 0) {
          pdf.addPage();
        }

        // 添加页眉
        if (marginTop > 0) {
          pdf.setFontSize(10);
          pdf.setTextColor('#2A5C8E');
          pdf.text('儿童身高发育管理测评报告', pageWidth / 2, marginTop - 3, { align: 'center' });
          pdf.setDrawColor('#E8F4F8');
          pdf.line(10, marginTop, pageWidth - 10, marginTop);
        }

        // 计算图片尺寸（考虑页边距）
        const imgData = canvas.toDataURL('image/png', 1.0);
        const contentWidth = pageWidth - marginLeft - marginRight;
        const contentHeight = pageHeight - marginTop - marginBottom;
        const imgHeight = (canvas.height * contentWidth) / canvas.width;

        // 添加图片到PDF
        pdf.addImage(imgData, 'PNG', marginLeft, marginTop, contentWidth, imgHeight);

        // 添加页脚
        if (marginBottom > 0) {
          const footerY = pageHeight - marginBottom + 3;
          pdf.setFontSize(9);
          pdf.setTextColor('#666666');
          pdf.text(`第 ${i + 1} / ${sections.length} 页`, pageWidth / 2, footerY, { align: 'center' });
          pdf.setDrawColor('#E8F4F8');
          pdf.line(10, pageHeight - marginBottom, pageWidth - 10, pageHeight - marginBottom);
        }

      } catch (pageError) {
        console.error(`页面 ${i + 1} 转换失败:`, pageError);
        throw pageError;
      }
    }

    // 生成文件名
    const fileName = body.fileName || `儿童身高发育管理测评报告_${new Date().toISOString().slice(0, 10)}.pdf`;

    // 生成PDF二进制数据
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    // 返回PDF文件
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('PDF导出失败:', error);
    return NextResponse.json(
      {
        error: 'PDF导出失败',
        message: error instanceof Error ? error.message : '未知错误',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
