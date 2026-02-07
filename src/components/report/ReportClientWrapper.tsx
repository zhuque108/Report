'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ReportData, sampleReportData } from '@/types/report';
import ReportCover from '@/components/report/ReportCover';
import ReportPage1 from '@/components/report/ReportPage1';
import ReportPage2 from '@/components/report/ReportPage2';
import ReportPage3 from '@/components/report/ReportPage3';
import ReportPage4 from '@/components/report/ReportPage4';
import ReportBackCover from '@/components/report/ReportBackCover';
import ReportNavigation from '@/components/report/ReportNavigation';
import PrintButton from '@/components/report/PrintButton';
import ExportPDFButton from '@/components/report/ExportPDFButton';

export default function ReportClientWrapper({ reportId }: { reportId: string }) {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 从 sessionStorage 读取数据
    const storedData = sessionStorage.getItem(`report-${reportId}`);

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData) as ReportData;
        setReportData(parsedData);
      } catch (error) {
        console.error('Failed to parse report data:', error);
        // 如果解析失败，使用示例数据
        setReportData(sampleReportData);
      }
    } else {
      // 如果没有找到数据，跳转回首页
      console.log('No report data found, redirecting to home');
      router.push('/');
    }
    setLoading(false);
  }, [reportId, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600">正在加载报告...</p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">未找到报告数据</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 顶部导航栏 */}
      <ReportNavigation reportId={reportId} childName={reportData.childName} />

      {/* 报告内容区 */}
      <div className="mx-auto max-w-[210mm] py-8">
        {/* 封面 */}
        <section className="mb-8 overflow-hidden rounded-lg bg-white shadow-lg">
          <ReportCover data={reportData} />
        </section>

        {/* 第一页：基础信息与遗传背景 */}
        <section className="mb-8 overflow-hidden rounded-lg bg-white shadow-lg">
          <ReportPage1 data={reportData} />
        </section>

        {/* 第二页：生长曲线可视化 */}
        <section className="mb-8 overflow-hidden rounded-lg bg-white shadow-lg">
          <ReportPage2 data={reportData} />
        </section>

        {/* 第三页：健康影响因素分析 */}
        <section className="mb-8 overflow-hidden rounded-lg bg-white shadow-lg">
          <ReportPage3 data={reportData} />
        </section>

        {/* 第四页：综合评测结论与处方 */}
        <section className="mb-8 overflow-hidden rounded-lg bg-white shadow-lg">
          <ReportPage4 data={reportData} />
        </section>

        {/* 封底 */}
        <section className="mb-8 overflow-hidden rounded-lg bg-white shadow-lg">
          <ReportBackCover data={reportData} />
        </section>
      </div>

      {/* 导出和打印按钮 */}
      <div className="fixed bottom-8 right-8 z-50 flex gap-3">
        <ExportPDFButton fileName={`${reportData.childName}_身高发育管理测评报告.pdf`} />
        <PrintButton />
      </div>
    </div>
  );
}
