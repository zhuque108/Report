import { ReportData, generatePersonalizedAdvice } from '@/types/report';
import { ClipboardCheck, FileText, Apple, Moon, Activity, Stethoscope, Building2, Award, UserCheck } from 'lucide-react';

interface ReportPage4Props {
  data: ReportData;
}

export default function ReportPage4({ data }: ReportPage4Props) {
  const ratingColors: Record<string, string> = {
    A: 'bg-green-500',
    B: 'bg-blue-500',
    C: 'bg-orange-500',
    D: 'bg-red-500',
  };

  const ratingTexts: Record<string, { text: string; desc: string }> = {
    A: { text: '优秀', desc: '生长发育状况非常好' },
    B: { text: '良好', desc: '生长发育状况良好' },
    C: { text: '预警', desc: '需要关注和干预' },
    D: { text: '矮小风险', desc: '建议专业医疗介入' },
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
          <ClipboardCheck className="mr-3 h-8 w-8" />
          综合评测结论与处方
        </h2>
        <p className="mt-2 text-sm text-gray-500">基于全面分析的行动指导</p>
      </div>

      <div className="grid grid-cols-2 gap-8 h-[calc(100%-120px)]">
        {/* 左侧：综合评测结论 */}
        <div className="space-y-6">
          {/* 总体评级 */}
          <div className="rounded-xl border-2 p-6" style={{ borderColor: '#E8F4F8' }}>
            <h3 className="mb-4 text-lg font-semibold flex items-center" style={{ color: '#2A5C8E' }}>
              <ClipboardCheck className="mr-2 h-5 w-5" />
              综合测评结论
            </h3>

            <div className="flex items-center justify-center mb-4">
              <div
                className={`flex h-28 w-28 items-center justify-center rounded-full text-5xl font-bold text-white shadow-lg ${ratingColors[data.conclusion.overallRating]}`}
              >
                {data.conclusion.overallRating}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-semibold text-gray-800">
                {ratingTexts[data.conclusion.overallRating].text}
              </div>
              <div className="mt-1 text-sm text-gray-500">
                {ratingTexts[data.conclusion.overallRating].desc}
              </div>
            </div>
          </div>

          {/* 核心判读 */}
          <div className="rounded-xl border-2 p-6" style={{ borderColor: '#FFA726' }}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: '#2A5C8E' }}>
              核心判读
            </h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-1 text-sm text-gray-500">遗传潜力分析</div>
                <div className="text-lg font-semibold text-gray-800">
                  {data.conclusion.geneticPotentialGap > 0 ? (
                    <>按遗传潜力计算，距离靶身高还需增长约 {data.conclusion.geneticPotentialGap} cm</>
                  ) : (
                    <>按遗传潜力计算，你已经超过遗传靶身高 {Math.abs(data.conclusion.geneticPotentialGap)} cm</>
                  )}
                </div>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="mb-1 text-sm text-gray-500">成年身高预测（基于百分位追踪）</div>
                <div className="text-lg font-semibold text-gray-800">
                  预测身高 <span style={{ color: '#2A5C8E' }}>{data.conclusion.predictedAdultHeight}</span> cm
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    （当前处于 {data.conclusion.currentPercentile || '未知'}）
                  </span>
                </div>
                {data.conclusion.predictedHeightRange && (
                  <div className="mt-1 text-sm text-blue-600">
                    正常波动范围：{data.conclusion.predictedHeightRange.min} cm - {data.conclusion.predictedHeightRange.max} cm
                  </div>
                )}
                <div className="mt-1 text-sm text-orange-600">
                  {data.conclusion.geneticTarget && data.conclusion.predictedAdultHeight < data.conclusion.geneticTarget
                    ? '预计可能达不到遗传靶身高'
                    : data.conclusion.geneticTarget && data.conclusion.predictedAdultHeight > data.conclusion.geneticTarget + 5
                    ? `预计有望超越遗传靶身高约 ${data.conclusion.predictedAdultHeight - data.conclusion.geneticTarget} cm`
                    : data.conclusion.geneticTarget
                    ? '预计有望达到遗传靶身高'
                    : ''}
                </div>
              </div>

              <div className="rounded-lg p-4" style={{ backgroundColor: '#FFF3E0' }}>
                <div className="mb-2 text-sm font-medium" style={{ color: '#FFA726' }}>
                  关键风险点
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.conclusion.riskFactors.map((factor, index) => (
                    <span
                      key={index}
                      className="inline-block rounded-full px-3 py-1 text-xs font-medium text-white"
                      style={{ backgroundColor: '#FFA726' }}
                    >
                      {factor}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：身高管理处方 */}
        <div className="rounded-xl border-2 p-6" style={{ borderColor: '#2A5C8E', backgroundColor: '#FAFAFA' }}>
          {/* 处方单抬头资质 */}
          <div className="mb-4 rounded-lg border-b-2 pb-3" style={{ borderColor: '#E8F4F8' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" style={{ color: '#2A5C8E' }} />
                <span className="text-sm font-bold" style={{ color: '#2A5C8E' }}>益康顺儿童健康成长管理中心</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded text-xs" style={{ backgroundColor: '#FFF3E0', color: '#FFA726' }}>
                <Award className="h-3 w-3" />
                <span>西南儿童医院"医育结合"战略合作机构</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
               <UserCheck className="h-3 w-3" style={{ color: '#2A5C8E' }} />
               <span>管理师：<strong style={{ color: '#2A5C8E' }}>{data.healthManager || '未指定'}</strong>（国家注册健康管理师）</span>
             </div>
          </div>
          
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center" style={{ color: '#2A5C8E' }}>
              <FileText className="mr-2 h-6 w-6" />
              身高管理处方单
            </h3>
            <div className="text-xs text-gray-500">处方日期: {data.assessmentDate}</div>
          </div>

          <div className="space-y-5">
            {/* 饮食建议 */}
            <div>
              <div className="mb-2 flex items-center gap-2 pb-2 border-b-2" style={{ borderColor: '#E8F4F8' }}>
                <Apple className="h-5 w-5 text-green-500" />
                <h4 className="font-semibold text-gray-800">饮食建议</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {personalizedAdvice.nutrition.map((advice, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 睡眠建议 */}
            <div>
              <div className="mb-2 flex items-center gap-2 pb-2 border-b-2" style={{ borderColor: '#E8F4F8' }}>
                <Moon className="h-5 w-5 text-purple-500" />
                <h4 className="font-semibold text-gray-800">睡眠建议</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {personalizedAdvice.sleep.map((advice, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0" />
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 运动建议 */}
            <div>
              <div className="mb-2 flex items-center gap-2 pb-2 border-b-2" style={{ borderColor: '#E8F4F8' }}>
                <Activity className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold text-gray-800">运动建议</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {personalizedAdvice.exercise.map((advice, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 医疗建议 */}
            <div>
              <div className="mb-2 flex items-center gap-2 pb-2 border-b-2" style={{ borderColor: '#E8F4F8' }}>
                <Stethoscope className="h-5 w-5 text-red-500" />
                <h4 className="font-semibold text-gray-800">医疗建议</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                {personalizedAdvice.medical.map((advice, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <div className="absolute bottom-6 left-12 right-12 flex justify-between text-xs text-gray-400">
        <span>第 5 页</span>
        <span>共 6 页</span>
      </div>
    </div>
  );
}
