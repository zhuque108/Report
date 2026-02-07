import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { validateRow, excelRowToReportData, type ExcelRow } from '@/lib/batch-utils';
import type { ReportData } from '@/types/report';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: '请上传 Excel 文件' },
        { status: 400 }
      );
    }

    // 读取文件
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });

    // 取第一个 sheet
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return NextResponse.json(
        { error: 'Excel 文件中没有工作表' },
        { status: 400 }
      );
    }

    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<ExcelRow>(sheet);

    // 过滤空行
    const rows = rawRows.filter(row => {
      const name = row.姓名;
      return name && String(name).trim() !== '';
    });

    if (rows.length === 0) {
      return NextResponse.json(
        { error: '未找到有效数据行，请检查 Excel 格式' },
        { status: 400 }
      );
    }

    // 校验并转换每行
    const results: Array<{
      index: number;
      valid: boolean;
      errors: string[];
      data: ReportData | null;
      rawName: string;
    }> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const validation = validateRow(row, i);
      results.push({
        index: i,
        valid: validation.valid,
        errors: validation.errors,
        data: validation.data || null,
        rawName: String(row.姓名 || '').trim(),
      });
    }

    const validCount = results.filter(r => r.valid).length;
    const invalidCount = results.filter(r => !r.valid).length;

    return NextResponse.json({
      total: rows.length,
      validCount,
      invalidCount,
      results,
    });
  } catch (error) {
    console.error('Excel 解析失败:', error);
    return NextResponse.json(
      {
        error: 'Excel 解析失败',
        message: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
