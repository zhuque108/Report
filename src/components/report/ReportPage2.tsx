'use client';

import { ReportData, calculateAge, getGrowthRateStatus } from '@/types/report';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts';
import { TrendingUp, ArrowUp, Database, FileCheck, Stethoscope } from 'lucide-react';

interface ReportPage2Props {
  data: ReportData;
}

// 中国男孩身高标准数据（0-18岁）
const whoHeightStandard = [
  { age: 0, P3: 47, P10: 48, P25: 49, P50: 50, P75: 52, P90: 53, P97: 54 },
  { age: 1, P3: 72, P10: 73, P25: 75, P50: 77, P75: 78, P90: 80, P97: 82 },
  { age: 2, P3: 82, P10: 84, P25: 86, P50: 88, P75: 91, P90: 93, P97: 95 },
  { age: 3, P3: 90, P10: 92, P25: 94, P50: 97, P75: 99, P90: 102, P97: 104 },
  { age: 4, P3: 97, P10: 99, P25: 101, P50: 104, P75: 107, P90: 109, P97: 112 },
  { age: 5, P3: 103, P10: 106, P25: 108, P50: 111, P75: 114, P90: 117, P97: 120 },
  { age: 6, P3: 109, P10: 112, P25: 115, P50: 118, P75: 121, P90: 124, P97: 127 },
  { age: 7, P3: 115, P10: 118, P25: 121, P50: 124, P75: 127, P90: 130, P97: 134 },
  { age: 8, P3: 120, P10: 123, P25: 126, P50: 130, P75: 134, P90: 137, P97: 140 },
  { age: 9, P3: 125, P10: 128, P25: 131, P50: 135, P75: 139, P90: 143, P97: 146 },
  { age: 10, P3: 129, P10: 132, P25: 136, P50: 140, P75: 144, P90: 148, P97: 152 },
  { age: 11, P3: 133, P10: 137, P25: 141, P50: 145, P75: 150, P90: 154, P97: 158 },
  { age: 12, P3: 138, P10: 143, P25: 147, P50: 152, P75: 157, P90: 162, P97: 166 },
  { age: 13, P3: 145, P10: 150, P25: 154, P50: 159, P75: 165, P90: 170, P97: 174 },
  { age: 14, P3: 152, P10: 157, P25: 161, P50: 166, P75: 171, P90: 175, P97: 179 },
  { age: 15, P3: 158, P10: 161, P25: 165, P50: 170, P75: 174, P90: 178, P97: 182 },
  { age: 16, P3: 160, P10: 164, P25: 167, P50: 172, P75: 176, P90: 180, P97: 183 },
  { age: 17, P3: 161, P10: 165, P25: 168, P50: 172, P75: 176, P90: 180, P97: 184 },
  { age: 18, P3: 161, P10: 165, P25: 169, P50: 173, P75: 177, P90: 180, P97: 184 },
];

// WHO 体重标准数据（简化版）
const whoWeightStandard = [
  { age: 0, P3: 2.5, P10: 2.9, P25: 3.3, P50: 3.5, P75: 3.9, P90: 4.4, P97: 5.0 },
  { age: 1, P3: 7.0, P10: 7.7, P25: 8.5, P50: 9.2, P75: 10.1, P90: 11.0, P97: 12.0 },
  { age: 2, P3: 9.5, P10: 10.4, P25: 11.3, P50: 12.3, P75: 13.4, P90: 14.5, P97: 15.8 },
  { age: 3, P3: 11.5, P10: 12.5, P25: 13.6, P50: 14.7, P75: 16.0, P90: 17.3, P97: 18.8 },
  { age: 4, P3: 13.0, P10: 14.1, P25: 15.3, P50: 16.6, P75: 18.0, P90: 19.5, P97: 21.2 },
  { age: 5, P3: 14.5, P10: 15.7, P25: 17.1, P50: 18.6, P75: 20.2, P90: 21.9, P97: 23.8 },
  { age: 6, P3: 16.0, P10: 17.4, P25: 18.9, P50: 20.6, P75: 22.4, P90: 24.3, P97: 26.5 },
  { age: 7, P3: 17.5, P10: 19.0, P25: 20.7, P50: 22.5, P75: 24.6, P90: 26.7, P97: 29.2 },
  { age: 8, P3: 19.0, P10: 20.7, P25: 22.5, P50: 24.6, P75: 26.9, P90: 29.2, P97: 32.0 },
  { age: 9, P3: 20.5, P10: 22.3, P25: 24.3, P50: 26.6, P75: 29.2, P90: 31.8, P97: 35.0 },
];

export default function ReportPage2({ data }: ReportPage2Props) {
  const age = calculateAge(data.birthDate, data.assessmentDate);

  // 准备身高数据
  const heightChartData = whoHeightStandard.map((std) => {
    const matchingRecord = data.growthRecords.find(
      (r) => r.ageYears === std.age && r.ageMonths === 0
    );
    return {
      age: `${std.age}岁`,
      ageValue: std.age,
      P3: std.P3,
      P10: std.P10,
      P25: std.P25,
      P50: std.P50,
      P75: std.P75,
      P90: std.P90,
      P97: std.P97,
      实测: matchingRecord?.height || null,
    };
  });

  // 准备体重数据
  const weightChartData = whoWeightStandard.map((std) => {
    const matchingRecord = data.growthRecords.find(
      (r) => r.ageYears === std.age && r.ageMonths === 0
    );
    return {
      age: `${std.age}岁`,
      ageValue: std.age,
      P3: std.P3,
      P25: std.P25,
      P50: std.P50,
      P75: std.P75,
      P97: std.P97,
      实测: matchingRecord?.weight || null,
    };
  });

  // 计算当前百分位
  const currentAgeRecord = data.growthRecords.find(
    (r) => r.ageYears === age.years && r.ageMonths === age.months
  );
  const currentHeightRecord = data.growthRecords[data.growthRecords.length - 1];
  
  // 使用直接输入的年身高增长值
  const annualGrowthRate = data.annualHeightGrowth 
    ? data.annualHeightGrowth.toFixed(1) 
    : '-';
  
  // 根据年龄判断生长速度状态
  const growthRateStatus = annualGrowthRate !== '-'
    ? getGrowthRateStatus(Number(annualGrowthRate), age.years)
    : { status: '未知', isNormal: false, color: 'text-gray-400' };

  // 判断当前百分位范围
  const getCurrentPercentile = (height: number, age: number): { level: string; status: string; color: string } => {
    const std = whoHeightStandard.find((s) => s.age === age);
    if (!std) return { level: '未知', status: '未知', color: 'gray' };
    if (height < std.P3) return { level: 'P3以下', status: '矮小', color: 'red' };
    if (height < std.P25) return { level: 'P3-P25', status: '偏矮', color: 'orange' };
    if (height < std.P75) return { level: 'P25-P75', status: '正常', color: 'green' };
    return { level: 'P75以上', status: '优秀', color: 'blue' };
  };

  const currentPercentile = getCurrentPercentile(data.currentHeight, age.years);

  return (
    <div className="relative h-[1122px] w-[793px] bg-white p-12">
      {/* 页面标题 */}
      <div className="mb-6 border-b pb-4">
        <h2 className="text-3xl font-bold flex items-center" style={{ color: '#2A5C8E' }}>
          <TrendingUp className="mr-3 h-8 w-8" />
          生长曲线可视化分析
        </h2>
        <p className="mt-2 text-sm text-gray-500">基于 WHO 标准的生长发育轨迹追踪</p>
      </div>

      {/* 身高生长曲线图 */}
      <div className="mb-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-800">身高生长曲线</h3>
        <div className="rounded-xl border-2 p-4" style={{ borderColor: '#E8F4F8' }}>
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={heightChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis
                dataKey="age"
                tick={{ fontSize: 12 }}
                label={{ value: '年龄', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                label={{ value: '身高 (cm)', angle: -90, position: 'insideLeft' }}
                domain={[40, 200]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '2px solid #2A5C8E',
                  borderRadius: '8px',
                }}
              />
              <Legend />

              {/* 颜色分区 */}
              <ReferenceArea y1={40} y2={60} fill="#FFEBEE" fillOpacity={0.3} />
              <ReferenceArea y1={60} y2={140} fill="#E8F5E9" fillOpacity={0.3} />
              <ReferenceArea y1={140} y2={200} fill="#E3F2FD" fillOpacity={0.3} />

              {/* WHO 标准线 */}
              <Line type="monotone" dataKey="P97" stroke="#E0E0E0" strokeWidth={1} strokeDasharray="5 5" name="P97" />
              <Line type="monotone" dataKey="P90" stroke="#BDBDBD" strokeWidth={1} strokeDasharray="5 5" name="P90" />
              <Line type="monotone" dataKey="P75" stroke="#9E9E9E" strokeWidth={1} name="P75" />
              <Line type="monotone" dataKey="P50" stroke="#757575" strokeWidth={1} name="P50" />
              <Line type="monotone" dataKey="P25" stroke="#9E9E9E" strokeWidth={1} name="P25" />
              <Line type="monotone" dataKey="P10" stroke="#BDBDBD" strokeWidth={1} strokeDasharray="5 5" name="P10" />
              <Line type="monotone" dataKey="P3" stroke="#E0E0E0" strokeWidth={1} strokeDasharray="5 5" name="P3" />

              {/* 实测线 */}
              <Line
                type="monotone"
                dataKey="实测"
                stroke="#FFA726"
                strokeWidth={3}
                dot={{ fill: '#FFA726', r: 5 }}
                activeDot={{ r: 8 }}
                name="实测身高"
              />
            </LineChart>
          </ResponsiveContainer>

          {/* 图例说明 */}
          <div className="mt-3 flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-red-200" />
              <span className="text-gray-600">P3以下：矮小</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-orange-200" />
              <span className="text-gray-600">P3-P25：偏矮</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-green-200" />
              <span className="text-gray-600">P25-P75：正常</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-blue-200" />
              <span className="text-gray-600">P75以上：优秀</span>
            </div>
          </div>
        </div>
      </div>

      {/* 体重生长曲线（小图） */}
      <div className="mb-3">
        <h3 className="mb-3 text-lg font-semibold text-gray-800">体重生长曲线</h3>
        <div className="rounded-xl border-2 p-4" style={{ borderColor: '#E8F4F8' }}>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weightChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="age" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: '体重 (kg)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="P97" stroke="#E0E0E0" strokeWidth={1} strokeDasharray="5 5" name="P97" />
              <Line type="monotone" dataKey="P75" stroke="#9E9E9E" strokeWidth={1} name="P75" />
              <Line type="monotone" dataKey="P50" stroke="#757575" strokeWidth={1} name="P50" />
              <Line type="monotone" dataKey="P25" stroke="#9E9E9E" strokeWidth={1} name="P25" />
              <Line type="monotone" dataKey="P3" stroke="#E0E0E0" strokeWidth={1} strokeDasharray="5 5" name="P3" />
              <Line
                type="monotone"
                dataKey="实测"
                stroke="#FFA726"
                strokeWidth={3}
                dot={{ fill: '#FFA726', r: 4 }}
                name="实测体重"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 关键解读 */}
      <div className="grid grid-cols-3 gap-4 rounded-xl border-2 p-5" style={{ borderColor: '#FFA726' }}>
        <div className="text-center">
          <div className="mb-2 text-sm text-gray-500">当前水平</div>
          <div className="text-2xl font-bold" style={{ color: '#2A5C8E' }}>
            {currentPercentile.level}
          </div>
          <div
            className={`mt-1 inline-block rounded px-3 py-1 text-sm font-medium ${
              currentPercentile.color === 'red'
                ? 'bg-red-100 text-red-600'
                : currentPercentile.color === 'orange'
                ? 'bg-orange-100 text-orange-600'
                : currentPercentile.color === 'green'
                ? 'bg-green-100 text-green-600'
                : 'bg-blue-100 text-blue-600'
            }`}
          >
            {currentPercentile.status}
          </div>
        </div>

        <div className="text-center">
          <div className="mb-2 text-sm text-gray-500">生长速度</div>
          <div className="flex items-center justify-center gap-2">
            <ArrowUp className="h-6 w-6 text-green-500" />
            <span className="text-2xl font-bold" style={{ color: '#2A5C8E' }}>
              {annualGrowthRate} cm/年
            </span>
          </div>
          <div className={`mt-1 text-sm ${growthRateStatus.color}`}>
            {growthRateStatus.status}
          </div>
        </div>

        <div className="text-center">
          <div className="mb-2 text-sm text-gray-500">骨龄</div>
          <div className="text-xl font-bold text-gray-400">
            未提供
          </div>
        </div>
      </div>

      {/* 数据来源说明 - 放在页脚上方 */}
      <div className="mt-3 rounded-lg border-l-4 p-2" style={{ borderColor: '#2A5C8E', backgroundColor: '#F8FBFD' }}>
        <div className="flex items-center gap-2 mb-1">
          <Database className="h-3 w-3" style={{ color: '#2A5C8E' }} />
          <span className="text-xs font-semibold" style={{ color: '#2A5C8E' }}>数据来源与评估依据</span>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <FileCheck className="h-3 w-3" style={{ color: '#FFA726' }} />
            <span>WHO儿童生长标准</span>
          </div>
          <div className="flex items-center gap-1">
            <Stethoscope className="h-3 w-3" style={{ color: '#FFA726' }} />
            <span>儿科临床营养学共识</span>
          </div>
          <div className="flex items-center gap-1">
            <Database className="h-3 w-3" style={{ color: '#FFA726' }} />
            <span>Y-CAS临床评估系统</span>
          </div>
        </div>
      </div>

      {/* 页脚 */}
      <div className="absolute bottom-4 left-12 right-12 flex justify-between text-xs text-gray-400">
        <span>第 3 页</span>
        <span>共 6 页</span>
      </div>
    </div>
  );
}
