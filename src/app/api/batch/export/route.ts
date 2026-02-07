import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';
import type { ReportData } from '@/types/report';
import { generateReportPDF, closeBrowser } from '@/lib/puppeteer-pdf';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reports } = body as { reports: ReportData[] };

    if (!reports || !Array.isArray(reports) || reports.length === 0) {
      return NextResponse.json(
        { error: '请提供报告数据数组' },
        { status: 400 }
      );
    }

    const zip = new JSZip();

    // 逐个生成 PDF（串行，避免内存过高）
    try {
      for (let i = 0; i < reports.length; i++) {
        const reportData = reports[i];
        const reportId = reportData.reportId || `batch-${i}`;
        const fileName = `${reportData.childName}_${reportId}.pdf`;

        try {
          const pdfBuffer = await generateReportPDF(reportData, reportId);
          zip.file(fileName, pdfBuffer);
        } catch (err) {
          console.error(`生成 ${fileName} 失败:`, err);
          // 跳过失败的，继续生成其他的
        }
      }
    } finally {
      await closeBrowser();
    }

    // 打包 ZIP
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    const zipName = `批量报告_${dateStr}.zip`;

    const uint8 = new Uint8Array(zipBuffer);

    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(zipName)}"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('批量导出失败:', error);
    return NextResponse.json(
      {
        error: '批量导出失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
