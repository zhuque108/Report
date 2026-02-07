'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Upload, FileSpreadsheet, Download, ArrowLeft,
  CheckCircle, XCircle, Loader2, AlertTriangle,
} from 'lucide-react';
import type { ReportData } from '@/types/report';
import BatchPDFGenerator from '@/components/report/BatchPDFGenerator';

// 解析结果行类型
interface ParsedRow {
  index: number;
  valid: boolean;
  errors: string[];
  data: ReportData | null;
  rawName: string;
  selected: boolean;
}

// 阶段枚举
type Stage = 'upload' | 'preview' | 'exporting';

export default function BatchPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('upload');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [validCount, setValidCount] = useState(0);
  const [invalidCount, setInvalidCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [exportReports, setExportReports] = useState<ReportData[]>([]);

  // 上传并解析 Excel
  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/batch/parse', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '解析失败');
      }

      const data = await res.json();
      setTotalCount(data.total);
      setValidCount(data.validCount);
      setInvalidCount(data.invalidCount);

      const parsedRows: ParsedRow[] = data.results.map((r: any) => ({
        ...r,
        selected: r.valid,
      }));
      setRows(parsedRows);
      setStage('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败');
    } finally {
      setUploading(false);
    }
  }, []);

  // 文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  // 拖拽上传
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  // 切换选中
  const toggleRow = (index: number) => {
    setRows(prev => prev.map(r =>
      r.index === index ? { ...r, selected: !r.selected } : r
    ));
  };

  // 全选/取消
  const toggleAll = (checked: boolean) => {
    setRows(prev => prev.map(r => r.valid ? { ...r, selected: checked } : r));
  };

  // 单个导出：存入 sessionStorage 后跳转到报告页面
  const handleExportSingle = (data: ReportData) => {
    const id = data.reportId || `report-${Date.now()}`;
    sessionStorage.setItem(`report-${id}`, JSON.stringify(data));
    window.open(`/report/${id}`, '_blank');
  };

  // 批量导出（客户端渲染方案）
  const handleExport = () => {
    const selected = rows.filter(r => r.selected && r.data);
    if (selected.length === 0) {
      setError('请至少选择一条有效数据');
      return;
    }

    setExporting(true);
    setExportProgress(0);
    setStage('exporting');
    setError(null);
    setExportReports(selected.map(r => r.data!));
  };

  const handleBatchProgress = (current: number, total: number) => {
    setExportProgress(Math.round((current / total) * 95));
  };

  const handleBatchComplete = (zipBlob: Blob) => {
    const url = window.URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `批量报告_${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    setExportProgress(100);
    setExporting(false);
    setExportReports([]);
  };

  const handleBatchError = (errMsg: string) => {
    setError(errMsg);
    setStage('preview');
    setExporting(false);
    setExportReports([]);
  };

  const selectedCount = rows.filter(r => r.selected).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4 sm:p-8">
      <div className="mx-auto max-w-5xl">
        {/* 头部 */}
        <PageHeader onBack={() => router.push('/')} />

        {/* 主内容 */}
        {stage === 'upload' && (
          <UploadStage
            uploading={uploading}
            error={error}
            onFileChange={handleFileChange}
            onDrop={handleDrop}
          />
        )}

        {stage === 'preview' && (
          <PreviewStage
            rows={rows}
            totalCount={totalCount}
            validCount={validCount}
            invalidCount={invalidCount}
            selectedCount={selectedCount}
            fileName={fileName}
            error={error}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onExport={handleExport}
            onExportSingle={handleExportSingle}
            onReset={() => { setStage('upload'); setRows([]); setError(null); }}
          />
        )}

        {stage === 'exporting' && (
          <ExportingStage
            progress={exportProgress}
            selectedCount={selectedCount}
            error={error}
            onBack={() => setStage('preview')}
          />
        )}

        {/* 隐藏的批量PDF渲染器 */}
        {exportReports.length > 0 && (
          <BatchPDFGenerator
            reports={exportReports}
            onProgress={handleBatchProgress}
            onComplete={handleBatchComplete}
            onError={handleBatchError}
          />
        )}
      </div>
    </div>
  );
}

// ========== 子组件 ==========

function PageHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#2A5C8E' }}>
          批量导入与导出
        </h1>
        <p className="text-sm text-gray-600">
          上传 Excel 模板，批量生成报告并导出 PDF
        </p>
      </div>
    </div>
  );
}

function UploadStage({
  uploading, error, onFileChange, onDrop,
}: {
  uploading: boolean;
  error: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          上传 Excel 文件
        </CardTitle>
        <CardDescription>
          请上传符合模板格式的 .xlsx 文件
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 transition-colors hover:border-blue-400 hover:bg-blue-50"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          {uploading ? (
            <>
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-500" />
              <p className="text-gray-600">正在解析文件...</p>
            </>
          ) : (
            <>
              <Upload className="mb-4 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-lg font-medium text-gray-700">
                拖拽文件到此处，或点击选择文件
              </p>
              <p className="mb-4 text-sm text-gray-500">
                支持 .xlsx 格式
              </p>
              <label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={onFileChange}
                />
                <Button asChild variant="default" style={{ backgroundColor: '#2A5C8E' }}>
                  <span>选择文件</span>
                </Button>
              </label>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PreviewStage({
  rows, totalCount, validCount, invalidCount, selectedCount,
  fileName, error,
  onToggleRow, onToggleAll, onExport, onReset, onExportSingle,
}: {
  rows: ParsedRow[];
  totalCount: number;
  validCount: number;
  invalidCount: number;
  selectedCount: number;
  fileName: string;
  error: string | null;
  onToggleRow: (index: number) => void;
  onToggleAll: (checked: boolean) => void;
  onExport: () => void;
  onReset: () => void;
  onExportSingle: (data: ReportData) => void;
}) {
  return (
    <div className="space-y-4">
      {/* 统计栏 */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="文件" value={fileName} small />
        <StatCard label="总行数" value={String(totalCount)} />
        <StatCard label="有效" value={String(validCount)} color="text-green-600" />
        <StatCard label="异常" value={String(invalidCount)} color="text-red-600" />
      </div>

      {/* 数据表格 */}
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">数据预览</CardTitle>
            <CardDescription>已选择 {selectedCount} 条数据</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onReset}>
              重新上传
            </Button>
            <Button
              size="sm"
              onClick={onExport}
              disabled={selectedCount === 0}
              style={{ backgroundColor: '#2A5C8E' }}
            >
              <Download className="mr-2 h-4 w-4" />
              批量导出 PDF ({selectedCount})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-3 py-2 text-left">
                    <Checkbox
                      checked={rows.filter(r => r.valid).every(r => r.selected)}
                      onCheckedChange={(c) => onToggleAll(!!c)}
                    />
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">序号</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">姓名</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">性别</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">身高</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">体重</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">报告编号</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">状态</th>
                  <th className="px-3 py-2 text-left font-medium text-gray-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.index}
                    className={`border-b ${!row.valid ? 'bg-red-50' : row.selected ? 'bg-blue-50/30' : ''}`}
                  >
                    <td className="px-3 py-2">
                      <Checkbox
                        checked={row.selected}
                        disabled={!row.valid}
                        onCheckedChange={() => onToggleRow(row.index)}
                      />
                    </td>
                    <td className="px-3 py-2 text-gray-500">{row.index + 1}</td>
                    <td className="px-3 py-2 font-medium">{row.rawName || '-'}</td>
                    <td className="px-3 py-2">
                      {row.data ? (row.data.gender === 'male' ? '男' : '女') : '-'}
                    </td>
                    <td className="px-3 py-2">
                      {row.data ? `${row.data.currentHeight} cm` : '-'}
                    </td>
                    <td className="px-3 py-2">
                      {row.data ? `${row.data.currentWeight} kg` : '-'}
                    </td>
                    <td className="px-3 py-2 text-xs text-gray-500">
                      {row.data?.reportId || '-'}
                    </td>
                    <td className="px-3 py-2">
                      {row.valid ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-3.5 w-3.5" /> 有效
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600" title={row.errors.join('\n')}>
                          <XCircle className="h-3.5 w-3.5" /> 异常
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {row.valid && row.data && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-xs"
                          onClick={() => onExportSingle(row.data!)}
                        >
                          <Download className="mr-1 h-3 w-3" />
                          导出
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ExportingStage({
  progress, selectedCount, error, onBack,
}: {
  progress: number;
  selectedCount: number;
  error: string | null;
  onBack: () => void;
}) {
  const done = progress >= 100;

  return (
    <Card className="shadow-xl">
      <CardContent className="flex flex-col items-center py-16">
        {done ? (
          <>
            <CheckCircle className="mb-4 h-16 w-16 text-green-500" />
            <h3 className="mb-2 text-xl font-bold text-gray-800">导出完成</h3>
            <p className="mb-6 text-gray-600">
              已成功生成 {selectedCount} 份报告，ZIP 文件已开始下载
            </p>
            <Button onClick={onBack} variant="outline">
              返回预览
            </Button>
          </>
        ) : (
          <>
            <Loader2 className="mb-4 h-16 w-16 animate-spin text-blue-500" />
            <h3 className="mb-2 text-xl font-bold text-gray-800">
              正在批量生成 PDF...
            </h3>
            <p className="mb-6 text-gray-600">
              共 {selectedCount} 份报告，请勿关闭页面
            </p>
            <div className="w-full max-w-md">
              <Progress value={progress} className="h-3" />
              <p className="mt-2 text-center text-sm text-gray-500">{progress}%</p>
            </div>
          </>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StatCard({ label, value, color, small }: {
  label: string; value: string; color?: string; small?: boolean;
}) {
  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <div className="text-xs text-gray-500">{label}</div>
      <div className={`mt-1 font-bold ${small ? 'text-sm truncate' : 'text-2xl'} ${color || 'text-gray-800'}`}>
        {value}
      </div>
    </div>
  );
}
