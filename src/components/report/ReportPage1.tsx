import { ReportData, calculateAge, calculateBMI, getBMIStatus, calculateGeneticHeight, isPremature } from '@/types/report';
import { User, Ruler, Weight, Activity } from 'lucide-react';

interface ReportPage1Props {
  data: ReportData;
}

export default function ReportPage1({ data }: ReportPage1Props) {
  const age = calculateAge(data.birthDate, data.assessmentDate);
  const bmi = calculateBMI(data.currentHeight, data.currentWeight);
  const bmiStatus = getBMIStatus(bmi, age.years);
  const geneticHeight = calculateGeneticHeight(data.fatherHeight, data.motherHeight, data.gender);
  const isPreterm = isPremature(data.gestationalWeeks);

  return (
    <div className="relative h-[1122px] w-[793px] bg-white p-12">
      {/* 页面标题 */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-3xl font-bold" style={{ color: '#2A5C8E' }}>
          基础信息与遗传背景
        </h2>
        <p className="mt-2 text-sm text-gray-500">基本信息与遗传潜力分析</p>
      </div>

      {/* 中间信息区块 */}
      <div className="mb-8">
        <div className="rounded-xl bg-white p-8 shadow-lg border-2 text-center" style={{ borderColor: '#E8F4F8' }}>
          <div className="mb-4">
            <h3 className="text-2xl font-semibold text-gray-700">专业测评 · 科学管理</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-500 mb-2">测评日期</div>
              <div className="text-2xl font-bold" style={{ color: '#2A5C8E' }}>
                {data.assessmentDate}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-2">报告编号</div>
              <div className="text-2xl font-bold" style={{ color: '#FFA726' }}>
                {data.reportId}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="grid grid-cols-5 gap-8">
        {/* 左侧：核心信息（占3列） */}
        <div className="col-span-3 space-y-6">
          {/* 核心身份区 */}
          <div className="rounded-xl border-2 p-6" style={{ borderColor: '#E8F4F8' }}>
            <h3 className="mb-4 flex items-center text-lg font-semibold" style={{ color: '#2A5C8E' }}>
              <User className="mr-2 h-5 w-5" />
              核心身份信息
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">姓名</div>
                <div className="mt-1 text-2xl font-bold text-gray-800">{data.childName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">性别</div>
                <div className="mt-1 flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: data.gender === 'male' ? '#E3F2FD' : '#FCE4EC' }}
                  >
                    <span className="text-xs font-bold" style={{ color: data.gender === 'male' ? '#1976D2' : '#E91E63' }}>
                      {data.gender === 'male' ? '男' : '女'}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">出生日期</div>
                <div className="mt-1 text-lg font-semibold text-gray-700">{data.birthDate}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">实足年龄</div>
                <div className="mt-1 text-lg font-semibold" style={{ color: '#2A5C8E' }}>
                  {age.years} 岁 {age.months} 个月
                </div>
              </div>
            </div>
          </div>

          {/* 当前体征区 */}
          <div className="rounded-xl border-2 p-6" style={{ borderColor: '#E8F4F8' }}>
            <h3 className="mb-4 flex items-center text-lg font-semibold" style={{ color: '#2A5C8E' }}>
              <Activity className="mr-2 h-5 w-5" />
              当前体征数据
            </h3>
            <div className="space-y-6">
              <div>
                <div className="text-sm text-gray-500">当前身高</div>
                <div className="mt-2 text-4xl font-bold" style={{ color: '#2A5C8E' }}>
                  {data.currentHeight} <span className="text-2xl text-gray-600">cm</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500">当前体重</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-800">
                    {data.currentWeight} <span className="text-lg text-gray-600">kg</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">BMI 指数</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-2xl font-semibold text-gray-800">{bmi}</span>
                    <span className={`text-base font-medium ${bmiStatus.color}`}>
                      {bmiStatus.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：遗传与背景（占2列） */}
        <div className="col-span-2 space-y-6">
          {/* 遗传靶身高计算 */}
          <div className="rounded-xl border-2 p-6" style={{ borderColor: '#FFA726' }}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: '#2A5C8E' }}>
              遗传靶身高计算
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">父亲身高</span>
                <span className="font-semibold text-gray-800">{data.fatherHeight} cm</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">母亲身高</span>
                <span className="font-semibold text-gray-800">{data.motherHeight} cm</span>
              </div>
              <div className="my-4 border-t border-gray-200" />
              <div className="rounded-lg p-3" style={{ backgroundColor: '#FFF3E0' }}>
                <div className="text-sm text-gray-600">遗传身高范围</div>
                <div className="mt-1 text-xl font-bold" style={{ color: '#FFA726' }}>
                  {geneticHeight.min} - {geneticHeight.max} cm
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  靶身高: {geneticHeight.target} cm
                </div>
              </div>
            </div>

            {/* 身高尺图形 */}
            <div className="mt-4">
              <div className="relative h-40 rounded-lg border-2 p-2" style={{ borderColor: '#E0E0E0' }}>
                <div className="absolute left-2 top-2 bottom-2 w-8 flex flex-col justify-between text-xs text-gray-400">
                  <span>{geneticHeight.max}</span>
                  <span>{geneticHeight.target}</span>
                  <span>{geneticHeight.min}</span>
                </div>
                <div className="absolute left-12 right-2 top-2 bottom-2">
                  {/* 遗传范围 */}
                  <div className="absolute w-full bg-blue-100 rounded" style={{ top: '20%', height: '60%' }} />
                  {/* 当前身高标记 */}
                  <div className="absolute left-0 right-0 flex items-center">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: '#FFA726' }}
                    />
                    <div className="ml-2 px-2 py-1 rounded text-xs font-bold" style={{ backgroundColor: '#FFA726', color: 'white' }}>
                      当前: {data.currentHeight} cm
                    </div>
                  </div>
                  {/* 靶身高线 */}
                  <div className="absolute left-0 right-0 flex items-center" style={{ top: '50%' }}>
                    <div className="h-0.5 w-full bg-blue-300" />
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-blue-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 出生信息 */}
          <div className="rounded-xl border-2 p-6" style={{ borderColor: '#E8F4F8' }}>
            <h3 className="mb-4 text-lg font-semibold" style={{ color: '#2A5C8E' }}>
              出生信息
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">出生孕周</span>
                <span className="font-semibold text-gray-800">{data.gestationalWeeks} 周</span>
              </div>
              <div
                className={`mt-3 rounded-lg p-3 text-center text-sm font-medium ${
                  isPreterm ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'
                }`}
              >
                {isPreterm ? '⚠️ 早产儿 - 需特别关注' : '✅ 足月儿 - 发育正常'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <div className="absolute bottom-6 left-12 right-12 flex justify-between text-xs text-gray-400">
        <span>第 2 页</span>
        <span>共 6 页</span>
      </div>
    </div>
  );
}
