'use client';

import { ReportData, generatePersonalizedAdvice } from '@/types/report';
import { AlertCircle, Clock, Utensils, Dumbbell, Smile, Gauge } from 'lucide-react';

interface ReportPage3Props {
  data: ReportData;
}

export default function ReportPage3({ data }: ReportPage3Props) {
  const issueIcons: Record<string, React.JSX.Element> = {
    挑食: <Utensils className="h-6 w-6" />,
    晚睡: <Clock className="h-6 w-6" />,
    运动不足: <Dumbbell className="h-6 w-6" />,
    厌食: <Utensils className="h-6 w-6" />,
    情绪问题: <Smile className="h-6 w-6" />,
  };

  const issueColors: Record<string, string> = {
    挑食: 'bg-orange-50 border-orange-200',
    晚睡: 'bg-purple-50 border-purple-200',
    运动不足: 'bg-blue-50 border-blue-200',
    厌食: 'bg-red-50 border-red-200',
    情绪问题: 'bg-green-50 border-green-200',
  };

  const issueTextColors: Record<string, string> = {
    挑食: 'text-orange-600',
    晚睡: 'text-purple-600',
    运动不足: 'text-blue-600',
    厌食: 'text-red-600',
    情绪问题: 'text-green-600',
  };

  // 计算实足年龄
  const birthDate = new Date(data.birthDate);
  const assessmentDate = new Date(data.assessmentDate);
  let ageYears = assessmentDate.getFullYear() - birthDate.getFullYear();
  let months = assessmentDate.getMonth() - birthDate.getMonth();
  if (months < 0) {
    ageYears--;
    months += 12;
  }

  // 计算生长速度状态
  const getGrowthRateStatus = (ageYears: number, growthRate: number) => {
    if (ageYears >= 3 && ageYears < 10) {
      // 3-10岁：正常范围 5-7 cm/年
      if (growthRate < 4.5) return { status: '偏慢', isNormal: false, range: '4.5-7.5' };
      if (growthRate > 7.5) return { status: '偏快', isNormal: false, range: '4.5-7.5' };
      return { status: '正常', isNormal: true, range: '4.5-7.5' };
    } else if (ageYears >= 10 && ageYears <= 18) {
      // 10-18岁（青春期）：正常范围 5-10 cm/年
      if (growthRate < 4.5) return { status: '偏慢', isNormal: false, range: '4.5-10' };
      if (growthRate > 10) return { status: '偏快', isNormal: false, range: '4.5-10' };
      return { status: '正常', isNormal: true, range: '4.5-10' };
    }
    return { status: '数据不足', isNormal: false, range: '-' };
  };

  // 获取生长速度状态
  const growthRateStatus = getGrowthRateStatus(ageYears, data.annualHeightGrowth || 0);

  // 生成个性化建议
  const personalizedAdvice = generatePersonalizedAdvice(
    data.conclusion.currentPercentile || 'P50',
    growthRateStatus,
    ageYears,
    data.annualHeightGrowth
  );

  return (
    <div className="relative h-[1122px] w-[793px] bg-white p-12">
      {/* 页面标题 */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-3xl font-bold flex items-center" style={{ color: '#2A5C8E' }}>
          <AlertCircle className="mr-3 h-8 w-8" />
          健康影响因素分析
        </h2>
        <p className="mt-2 text-sm text-gray-500">健康因素管理建议</p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* 左列 */}
        <div className="space-y-6">
          {/* 最困扰问题 */}
          <div className="rounded-xl border-2 p-6" style={{ borderColor: '#FFA726' }}>
            <h3 className="mb-4 text-lg font-semibold flex items-center" style={{ color: '#2A5C8E' }}>
              <AlertCircle className="mr-2 h-5 w-5" />
              当前主要干预阻碍
            </h3>
            <div className="space-y-3">
              {data.healthFactors.mainIssues.map((issue, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 rounded-lg border-2 p-4 ${issueColors[issue] || 'bg-gray-50 border-gray-200'}`}
                >
                  <div className={issueTextColors[issue] || 'text-gray-600'}>
                    {issueIcons[issue] || <AlertCircle className="h-6 w-6" />}
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold ${issueTextColors[issue] || 'text-gray-800'}`}>
                      {issue}
                    </div>
                    {issue === '挑食' && (
                      <div className="mt-1 text-xs text-gray-600">影响营养摄入，需均衡膳食</div>
                    )}
                    {issue === '晚睡' && (
                      <div className="mt-1 text-xs text-gray-600">影响生长激素分泌</div>
                    )}
                    {issue === '运动不足' && (
                      <div className="mt-1 text-xs text-gray-600">骨骼刺激不足，影响生长</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 生活方式建议表 */}
          <div className="rounded-xl border-2 p-6" style={{ borderColor: '#E8F4F8' }}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: '#2A5C8E' }}>
              生活方式建议
            </h3>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b" style={{ backgroundColor: '#F5F5F5' }}>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">维度</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">目标标准</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">改善建议</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span className="font-medium text-gray-700">睡眠</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {data.healthFactors.sleep.idealSleepTime}
                    </td>
                    <td className="px-3 py-3 text-blue-600 text-xs">
                      {data.healthFactors.sleep.gapAnalysis}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-gray-700">营养</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {data.healthFactors.nutrition.idealStandard}
                    </td>
                    <td className="px-3 py-3 text-blue-600 text-xs">
                      {data.healthFactors.nutrition.gapAnalysis}
                    </td>
                  </tr>
                  <tr className="border-b">
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Dumbbell className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-gray-700">运动</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {data.healthFactors.exercise.idealStandard}
                    </td>
                    <td className="px-3 py-3 text-blue-600 text-xs">
                      {data.healthFactors.exercise.gapAnalysis}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Smile className="h-4 w-4 text-pink-500" />
                        <span className="font-medium text-gray-700">情绪</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-gray-600">
                      {data.healthFactors.emotion.idealStandard}
                    </td>
                    <td className="px-3 py-3 text-blue-600 text-xs">
                      {data.healthFactors.emotion.gapAnalysis}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 右列 */}
        <div className="space-y-6">
          {/* 家长改善意愿强度 */}
          <div className="rounded-xl border-2 p-6" style={{ borderColor: '#FFA726' }}>
            <h3 className="mb-4 text-lg font-semibold flex items-center" style={{ color: '#2A5C8E' }}>
              <Gauge className="mr-2 h-5 w-5" />
              家长改善意愿强度
            </h3>

            {/* 仪表盘图形 */}
            <div className="relative mb-6 flex justify-center">
              <svg className="h-40 w-full" viewBox="0 0 300 150">
                {/* 半圆背景 */}
                <path
                  d="M 30 120 A 120 120 0 0 1 270 120"
                  fill="none"
                  stroke="#E0E0E0"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                {/* 颜色分段 */}
                <path
                  d="M 30 120 A 120 120 0 0 1 110 35"
                  fill="none"
                  stroke="#F44336"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                <path
                  d="M 110 35 A 120 120 0 0 1 190 35"
                  fill="none"
                  stroke="#FFA726"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                <path
                  d="M 190 35 A 120 120 0 0 1 270 120"
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
                {/* 指针 */}
                <g
                  transform={`rotate(${
                    data.healthFactors.parentWillingness === 'low'
                      ? -60
                      : data.healthFactors.parentWillingness === 'medium'
                      ? 0
                      : 60
                  }, 150, 120)`}
                >
                  <polygon points="150,15 145,120 155,120" fill="#2A5C8E" />
                  <circle cx="150" cy="120" r="10" fill="#2A5C8E" />
                </g>
                {/* 标签 */}
                <text x="50" y="140" fontSize="12" fill="#666" textAnchor="middle">
                  低
                </text>
                <text x="150" y="140" fontSize="12" fill="#666" textAnchor="middle">
                  中
                </text>
                <text x="250" y="140" fontSize="12" fill="#666" textAnchor="middle">
                  高
                </text>
              </svg>
            </div>

            {/* 意愿强度文字 */}
            <div className="text-center">
              <div
                className={`mb-3 inline-block rounded-full px-6 py-2 text-lg font-bold ${
                  data.healthFactors.parentWillingness === 'high'
                    ? 'bg-green-100 text-green-600'
                    : data.healthFactors.parentWillingness === 'medium'
                    ? 'bg-orange-100 text-orange-600'
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {data.healthFactors.parentWillingness === 'high'
                  ? '高意愿'
                  : data.healthFactors.parentWillingness === 'medium'
                  ? '中意愿'
                  : '低意愿'}
              </div>
              <p className="text-sm leading-relaxed text-gray-600">
                {data.healthFactors.parentWillingness === 'high'
                  ? '家长配合度极高，干预成功率预计提升80%！继续保持良好的沟通与配合。'
                  : data.healthFactors.parentWillingness === 'medium'
                  ? '家长有一定改善意愿，建议从关键问题入手，逐步建立良好习惯。'
                  : '建议逐步建立干预习惯，先从1个小目标开始，降低门槛，循序渐进。'}
              </p>
            </div>
          </div>

          {/* 改善建议总结 */}
          <div className="rounded-xl border-2 p-6" style={{ borderColor: '#E8F4F8' }}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: '#2A5C8E' }}>
              改善建议总结
            </h3>
            <ul className="space-y-3 text-sm text-gray-700">
              {personalizedAdvice.summary.map((advice, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full" style={{ backgroundColor: '#FFA726' }} />
                  <span>{advice}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <div className="absolute bottom-6 left-12 right-12 flex justify-between text-xs text-gray-400">
        <span>第 4 页</span>
        <span>共 6 页</span>
      </div>
    </div>
  );
}
