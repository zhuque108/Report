import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Baby, FileText, ArrowRight, PlusCircle, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '儿童身高发育管理测评报告',
  description: '专业科学的儿童身高发育评估与管理系统',
};

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 text-foreground">
      {/* 主容器 */}
      <main className="flex min-h-screen w-full max-w-4xl flex-col items-center justify-between px-8 py-16 sm:px-16">
        {/* 头部：Logo 和 产品名称 */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
            <Baby className="h-10 w-10" style={{ color: '#2A5C8E' }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#2A5C8E' }}>
              儿童身高发育管理
            </h1>
            <p className="text-sm text-gray-600">专业测评报告系统</p>
          </div>
        </div>

        {/* 中间内容区：主标题和功能介绍 */}
        <div className="flex flex-col items-center gap-8 text-center">
          <h2 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-gray-800">
            科学监测，助力成长
            <br />
            让孩子多长10厘米
          </h2>
          <p className="max-w-2xl text-lg leading-8 text-gray-600">
            基于WHO标准的身高发育评估，提供专业的生长曲线分析、
            健康因素诊断和个性化身高管理处方
          </p>

          {/* 功能卡片 */}
          <div className="grid gap-6 py-8 sm:grid-cols-3">
            <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800">全面评估</h3>
              <p className="text-sm text-gray-600">
                5大维度综合评测，精准分析生长状况
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Baby className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-800">专业可视化</h3>
              <p className="text-sm text-gray-600">
                WHO标准曲线对比，直观展示发育水平
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 rounded-xl bg-white p-6 shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <ArrowRight className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-800">个性化处方</h3>
              <p className="text-sm text-gray-600">
                饮食、睡眠、运动全方位指导建议
              </p>
            </div>
          </div>
        </div>

        {/* 底部按钮区 */}
        <div className="flex w-full flex-col gap-4 text-base font-medium sm:w-auto sm:flex-row">
          <Button
            asChild
            size="lg"
            className="h-14 min-w-[200px] rounded-full px-8 text-lg shadow-lg"
            style={{ backgroundColor: '#2A5C8E' }}
          >
            <Link href="/submit">
              <PlusCircle className="mr-2 h-5 w-5" />
              填写测评信息
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 min-w-[200px] rounded-full px-8 text-lg shadow-md"
          >
            <Link href="/report/sample-001">
              <FileText className="mr-2 h-5 w-5" />
              查看示例报告
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-14 min-w-[200px] rounded-full px-8 text-lg shadow-md border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <Link href="/batch">
              <FileSpreadsheet className="mr-2 h-5 w-5" />
              批量导入导出
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
