import ReportClientWrapper from '@/components/report/ReportClientWrapper';
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

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 检查是否是示例报告
  if (id === 'sample-001') {
    const reportData: ReportData = sampleReportData;

    return (
      <div className="min-h-screen bg-gray-100">
        {/* 顶部导航栏 */}
        <ReportNavigation reportId={id} childName={reportData.childName} />

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

  // 对于动态生成的报告，使用客户端组件来读取 sessionStorage
  return <ReportClientWrapper reportId={id} />;
}
