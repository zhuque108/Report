import { ReportData } from '@/types/report';
import { Baby, Building2, Shield } from 'lucide-react';

interface ReportCoverProps {
  data: ReportData;
}

export default function ReportCover({ data }: ReportCoverProps) {
  return (
    <div className="relative h-[1122px] w-[793px] overflow-hidden" style={{ backgroundColor: '#E8F4F8' }}>
      {/* 主要内容区 */}
      <div className="relative flex h-full flex-col items-center justify-center px-16">
        {/* 顶部：机构信息 */}
        <div className="mb-16 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-white p-4 shadow-md">
            <Baby className="h-12 w-12" style={{ color: '#2A5C8E' }} />
          </div>
          <h2 className="text-xl font-semibold tracking-wider" style={{ color: '#2A5C8E' }}>
            儿童健康成长管理中心
          </h2>
          <div className="mt-2 h-0.5 w-24 mx-auto" style={{ backgroundColor: '#FFA726' }} />
        </div>

        {/* 中部：核心内容 */}
        <div className="mb-16 text-center">
          <div className="mb-8 text-2xl font-light text-gray-600">
            身高管理专属测评报告
          </div>

          {/* 儿童姓名 */}
          <div className="mb-4">
            <h1 className="text-6xl font-bold" style={{ color: '#2A5C8E' }}>
              {data.childName}
            </h1>
          </div>

          <div className="text-4xl font-semibold text-gray-700">
            身高发育档案
          </div>
        </div>

        {/* Slogan */}
        <div className="mb-20 px-12 py-6 rounded-2xl bg-white/60 backdrop-blur-sm">
          <p className="text-2xl font-medium" style={{ color: '#FFA726' }}>
            专注家庭场景的"儿童健康"管理
          </p>
        </div>

        {/* 页脚背书信息 */}
        <div className="absolute bottom-8 left-0 right-0 px-12">
          <div className="flex items-center justify-center gap-2 rounded-xl bg-white/80 px-6 py-4 shadow-sm">
            <Building2 className="h-5 w-5" style={{ color: '#2A5C8E' }} />
            <span className="text-sm font-medium text-gray-700">
              本报告由益康顺儿童健康成长管理中心出具
            </span>
            <span className="mx-2 text-gray-400">|</span>
            <Shield className="h-5 w-5" style={{ color: '#FFA726' }} />
            <span className="text-sm font-medium" style={{ color: '#2A5C8E' }}>
              西南儿童医院战略合作机构
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
