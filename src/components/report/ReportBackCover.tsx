import { ReportData } from '@/types/report';
import { TrendingUp } from 'lucide-react';

interface ReportBackCoverProps {
  data: ReportData;
}

export default function ReportBackCover({ data }: ReportBackCoverProps) {
  return (
    <div className="relative h-[1122px] w-[793px] bg-white p-12 flex flex-col">
      {/* 主内容区 */}
      <div className="flex-1 space-y-6">
        {/* 干预方案模块 */}
        <div className="rounded-xl border-2 p-6" style={{ borderColor: '#2A5C8E', background: 'linear-gradient(135deg, #E8F4F8 0%, #F0F8FF 100%)' }}>
          <div className="mb-6">
            <h3 className="mb-2 text-xl font-semibold flex items-center" style={{ color: '#2A5C8E' }}>
              <TrendingUp className="mr-2 h-6 w-6" />
              抓住生长发育的黄金期
            </h3>
            <p className="text-sm text-gray-700">
              及时联系您的健康管理顾问，制定个性化干预方案，突破自然生长限制
            </p>
          </div>

          {/* 四周干预方案示例 */}
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <h4 className="mb-4 text-base font-semibold text-gray-800">四周干预方案示例</h4>

            <div className="grid grid-cols-2 gap-4">
              {/* 第一周 */}
              <div className="rounded-lg border p-4" style={{ borderColor: '#E8F4F8' }}>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#2A5C8E' }}>
                    1
                  </div>
                  <span className="font-semibold text-gray-800">第一周</span>
                </div>
                <div className="mb-2 text-xs font-medium text-gray-600">基础评估与准备</div>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-start gap-1">
                    <span className="text-blue-500">•</span>
                    <span>建立身高监测日志</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-blue-500">•</span>
                    <span>评估当前营养状况</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-blue-500">•</span>
                    <span>制定作息时间表</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-blue-500">•</span>
                    <span>准备运动器材</span>
                  </li>
                </ul>
              </div>

              {/* 第二周 */}
              <div className="rounded-lg border p-4" style={{ borderColor: '#E8F4F8' }}>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#2A5C8E' }}>
                    2
                  </div>
                  <span className="font-semibold text-gray-800">第二周</span>
                </div>
                <div className="mb-2 text-xs font-medium text-gray-600">营养与睡眠优化</div>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-start gap-1">
                    <span className="text-green-500">•</span>
                    <span>补充高蛋白食物</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-green-500">•</span>
                    <span>增加钙质摄入</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-green-500">•</span>
                    <span>固定睡眠时间</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-green-500">•</span>
                    <span>优化睡眠环境</span>
                  </li>
                </ul>
              </div>

              {/* 第三周 */}
              <div className="rounded-lg border p-4" style={{ borderColor: '#E8F4F8' }}>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#2A5C8E' }}>
                    3
                  </div>
                  <span className="font-semibold text-gray-800">第三周</span>
                </div>
                <div className="mb-2 text-xs font-medium text-gray-600">运动强化阶段</div>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-start gap-1">
                    <span className="text-orange-500">•</span>
                    <span>每日跳绳30分钟</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-orange-500">•</span>
                    <span>增加摸高训练</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-orange-500">•</span>
                    <span>游泳或篮球运动</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-orange-500">•</span>
                    <span>运动后拉伸15分钟</span>
                  </li>
                </ul>
              </div>

              {/* 第四周 */}
              <div className="rounded-lg border p-4" style={{ borderColor: '#E8F4F8' }}>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#2A5C8E' }}>
                    4
                  </div>
                  <span className="font-semibold text-gray-800">第四周</span>
                </div>
                <div className="mb-2 text-xs font-medium text-gray-600">综合提升与评估</div>
                <ul className="space-y-1 text-xs text-gray-600">
                  <li className="flex items-start gap-1">
                    <span className="text-purple-500">•</span>
                    <span>全面执行综合计划</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-purple-500">•</span>
                    <span>记录生长变化</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-purple-500">•</span>
                    <span>调整干预策略</span>
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-purple-500">•</span>
                    <span>联系顾问反馈</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* 提示信息 */}
            <div className="mt-4 rounded bg-orange-50 p-3 text-xs text-gray-600">
              <span className="font-semibold" style={{ color: '#FFA726' }}>
                💡 提示：
              </span>
              每周坚持执行，可突破自然生长0.3-0.5cm。建议在健康管理师指导下制定个性化方案。
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <div className="absolute bottom-6 left-12 right-12 flex justify-between text-xs text-gray-400">
        <span>第 6 页</span>
        <span>共 6 页</span>
      </div>
    </div>
  );
}
