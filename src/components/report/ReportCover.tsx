import { ReportData } from '@/types/report';
import { Baby } from 'lucide-react';

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
            {data.organization.name}
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
            "科学监测，助力成长，让孩子多长10厘米"
          </p>
        </div>
      </div>
    </div>
  );
}
