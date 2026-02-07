// 儿童身高发育管理测评报告数据类型

export interface ReportData {
  // 基本信息
  childName: string;
  gender: 'male' | 'female';
  birthDate: string; // YYYY-MM-DD
  assessmentDate: string; // YYYY-MM-DD
  reportId: string;

  // 管理师信息
  healthManager?: string; // 健康管理师姓名

  // 当前体征
  currentHeight: number; // cm
  currentWeight: number; // kg

  // 遗传背景
  fatherHeight: number; // cm
  motherHeight: number; // cm
  gestationalWeeks: number; // 出生孕周

  // 生长数据（用于曲线图）
  growthRecords: GrowthRecord[];
  
  // 近一年身高增长值（cm/年）
  annualHeightGrowth?: number;

  // 骨龄（可选）
  boneAge?: number; // 岁

  // 健康影响因素
  healthFactors: {
    mainIssues: string[]; // 主要困扰问题
    sleep: SleepFactor;
    nutrition: NutritionFactor;
    exercise: ExerciseFactor;
    emotion: EmotionFactor;
    parentWillingness: 'high' | 'medium' | 'low';
  };

  // 评测结论
  conclusion: {
    overallRating: 'A' | 'B' | 'C' | 'D';
    geneticPotentialGap: number; // 距离遗传靶身高差距
    geneticTarget?: number; // 遗传靶身高
    predictedAdultHeight: number; // 预测成年身高
    predictedHeightRange?: { min: number; max: number }; // 预测身高范围
    currentPercentile?: string; // 当前百分位
    riskFactors: string[];
  };

  // 机构信息
  organization: {
    name: string;
    logo?: string;
    address: string;
    phone: string;
  };
}

export interface GrowthRecord {
  ageYears: number;
  ageMonths: number;
  height: number;
  weight: number;
  date: string;
}

export interface SleepFactor {
  sleepTime: string; // 入睡时间
  idealSleepTime: string;
  gapAnalysis: string;
}

export interface NutritionFactor {
  dietStructure: string;
  idealStandard: string;
  gapAnalysis: string;
}

export interface ExerciseFactor {
  frequency: string;
  idealStandard: string;
  gapAnalysis: string;
}

export interface EmotionFactor {
  status: string;
  idealStandard: string;
  gapAnalysis: string;
}

// WHO 生长标准百分位数数据（简化版，实际应使用完整数据表）
export interface WHOStandard {
  age: number; // 年龄（月）
  P3: number;
  P10: number;
  P25: number;
  P50: number;
  P75: number;
  P90: number;
  P97: number;
}

// 计算辅助函数
export const calculateAge = (birthDate: string, assessmentDate: string): { years: number; months: number } => {
  const birth = new Date(birthDate);
  const assess = new Date(assessmentDate);

  let years = assess.getFullYear() - birth.getFullYear();
  let months = assess.getMonth() - birth.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  // 考虑日期
  if (assess.getDate() < birth.getDate()) {
    months--;
    if (months < 0) {
      months += 12;
      years--;
    }
  }

  return { years, months };
};

export const calculateBMI = (heightCm: number, weightKg: number): number => {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
};

export const getBMIStatus = (bmi: number, ageYears: number): { status: string; color: string } => {
  // 根据年龄调整BMI判断标准
  // 参考 WHO 儿童BMI标准
  let minUnderweight: number;
  let minOverweight: number;
  let minObese: number;

  if (ageYears < 1) {
    minUnderweight = 13.5;
    minOverweight = 18.5;
    minObese = 20.5;
  } else if (ageYears < 3) {
    minUnderweight = 14.5;
    minOverweight = 18.0;
    minObese = 19.5;
  } else if (ageYears < 7) {
    minUnderweight = 13.5;
    minOverweight = 17.5;
    minObese = 19.5;
  } else if (ageYears < 10) {
    minUnderweight = 14.0;
    minOverweight = 19.0;
    minObese = 22.0;
  } else if (ageYears < 13) {
    minUnderweight = 14.5;
    minOverweight = 21.0;
    minObese = 25.0;
  } else if (ageYears < 15) {
    minUnderweight = 15.5;
    minOverweight = 22.5;
    minObese = 27.5;
  } else if (ageYears < 17) {
    minUnderweight = 16.5;
    minOverweight = 24.0;
    minObese = 29.0;
  } else {
    // 17岁以上，接近成人标准
    minUnderweight = 18.5;
    minOverweight = 25.0;
    minObese = 30.0;
  }

  if (bmi < minUnderweight) {
    return { status: '偏瘦', color: 'text-orange-500' };
  } else if (bmi >= minOverweight && bmi < minObese) {
    return { status: '超重', color: 'text-orange-500' };
  } else if (bmi >= minObese) {
    return { status: '肥胖', color: 'text-red-500' };
  } else {
    return { status: '正常', color: 'text-green-500' };
  }
};

export const calculateGeneticHeight = (
  fatherHeight: number,
  motherHeight: number,
  gender: 'male' | 'female'
): { min: number; max: number; target: number } => {
  // 输入验证
  if (fatherHeight < 140 || fatherHeight > 220) {
    fatherHeight = 170; // 使用默认值
  }
  if (motherHeight < 130 || motherHeight > 200) {
    motherHeight = 160; // 使用默认值
  }
  
  let target: number;
  if (gender === 'male') {
    target = (fatherHeight + motherHeight + 13) / 2;
  } else {
    target = (fatherHeight + motherHeight - 13) / 2;
  }

  return {
    min: Math.round(target - 5),
    max: Math.round(target + 5),
    target: Math.round(target),
  };
};

export const isPremature = (gestationalWeeks: number): boolean => {
  return gestationalWeeks < 37;
};

// 根据身高百分位和生长速度生成个性化建议
export const generatePersonalizedAdvice = (
  currentPercentile: string,
  growthRateStatus: { status: string; isNormal: boolean },
  ageYears: number,
  annualHeightGrowth?: number
): {
  nutrition: string[];
  sleep: string[];
  exercise: string[];
  medical: string[];
  summary: string[];
} => {
  const percentileAdvice = {
    'P3以下': {
      nutrition: [
        '重点补充：高蛋白食物（鸡蛋、瘦肉、鱼类）每日2次',
        '补充钙质：每日500ml牛奶+钙片200mg',
        '微量元素：检测锌、铁、维生素D水平，针对性补充',
        '增重建议：适当增加热量摄入，促进生长板发育',
      ],
      sleep: [
        '严格作息：21:00前必须入睡，保证10小时睡眠',
        '生长激素：重点利用23:00-02:00分泌高峰期',
        '午休：每日午睡30-60分钟',
      ],
      exercise: [
        '运动强度：中高强度，每日45-60分钟',
        '核心项目：跳绳（每日500-1000次）、摸高、篮球',
        '拉伸运动：每日拉伸15分钟，促进骨骼生长',
      ],
      medical: [
        '立即检查：骨龄X光片、生长激素水平、甲状腺功能',
        '专科就诊：建议儿童内分泌科专家评估',
        '监测频率：每月复查身高，评估干预效果',
        '药物干预：根据医生建议考虑生长激素治疗',
      ],
      summary: [
        '目前身高低于P3，属于矮小症范围，需要专业医疗干预',
        '营养摄入不足，需重点补充蛋白质和微量元素',
        '建立严格的生活习惯，最大化生长激素分泌',
        '建议3个月内复查骨龄，评估生长潜力',
      ],
    },
    'P25': {
      nutrition: [
        '蛋白质充足：每日2个鸡蛋+瘦肉100g',
        '钙质补充：每日300-400ml牛奶',
        '维生素D：每日400IU，促进钙吸收',
      ],
      sleep: [
        '规律作息：21:30前入睡，保证9-10小时睡眠',
        '睡眠质量：避免熬夜，确保深度睡眠',
      ],
      exercise: [
        '运动频率：每日30-40分钟中高强度运动',
        '推荐项目：跳绳、游泳、篮球',
        '拉伸：运动后拉伸10分钟',
      ],
      medical: [
        '定期监测：每3-6个月复查身高体重',
        '建议检查：微量元素、维生素D水平',
        '关注青春期发育，避免性早熟',
      ],
      summary: [
        '身高处于P25水平，通过科学管理有望提升至中等水平',
        '重点改善饮食结构和运动习惯',
        '保持规律作息，促进自然生长',
      ],
    },
    'P50': {
      nutrition: [
        '均衡饮食：每日蔬菜水果300-500g',
        '优质蛋白：每日鸡蛋1-2个+瘦肉适量',
        '钙质维持：每日300ml牛奶',
      ],
      sleep: [
        '健康作息：21:30-22:00入睡，保证9小时睡眠',
        '睡眠环境：安静、黑暗、舒适',
      ],
      exercise: [
        '日常运动：每日30分钟中等强度运动',
        '多样运动：跳绳、游泳、球类运动结合',
      ],
      medical: [
        '常规监测：每6个月复查身高体重',
        '定期体检：每年进行全面生长发育评估',
      ],
      summary: [
        '身高处于中等水平，保持当前良好习惯',
        '预防性干预：避免生长速度下降',
        '关注青春期发育节奏',
      ],
    },
    'P75': {
      nutrition: [
        '维持营养：均衡饮食，避免过度营养',
        '控制体重：避免肥胖影响骨骼发育',
        '蛋白质适量：每日1-2个鸡蛋即可',
      ],
      sleep: [
        '充足睡眠：保持9小时睡眠时间',
        '规律作息：避免熬夜',
      ],
      exercise: [
        '适量运动：每日30分钟运动，保持骨骼健康',
        '避免过度：避免超负荷训练',
      ],
      medical: [
        '定期监测：每6个月复查，预防生长速度异常',
        '关注骨龄：避免性早熟',
      ],
      summary: [
        '身高处于中上水平，继续保持良好习惯',
        '重点预防：避免生长速度下降或骨龄提前',
        '维持均衡营养和规律运动',
      ],
    },
  };

  const growthRateAdvice = {
    '偏慢': {
      summary: ['生长速度偏慢，需要加强营养和运动干预', '建议1个月复查评估干预效果'],
      sleep: ['延长睡眠时间至10-11小时', '重点保证23:00-02:00深度睡眠'],
    },
    '偏快': {
      summary: ['生长速度偏快，需警惕性早熟风险', '建议检查骨龄和性激素水平'],
      sleep: ['避免过度疲劳，保证睡眠质量'],
    },
    '正常': {
      summary: ['生长速度正常，保持当前习惯', '定期监测即可'],
      sleep: ['保持规律作息即可'],
    },
  };

  // 获取基础建议
  const baseAdvice = percentileAdvice[currentPercentile as keyof typeof percentileAdvice] || percentileAdvice['P50'];
  const growthAdvice = growthRateStatus.isNormal
    ? growthRateAdvice['正常']
    : growthRateStatus.status.includes('偏慢')
    ? growthRateAdvice['偏慢']
    : growthRateAdvice['偏快'];

  return {
    nutrition: baseAdvice.nutrition,
    sleep: [...baseAdvice.sleep, ...(growthAdvice.sleep || [])],
    exercise: baseAdvice.exercise,
    medical: baseAdvice.medical,
    summary: [...baseAdvice.summary, ...growthAdvice.summary],
  };
};

// 根据年龄判断生长速度是否正常
export const getGrowthRateStatus = (
  annualGrowthRate: number,
  ageYears: number
): { status: string; isNormal: boolean; color: string } => {
  // 不同年龄段的生长速度标准（cm/年）
  // 参考 WHO 儿童生长标准
  let minNormal: number;
  let maxNormal: number;

  if (ageYears < 1) {
    minNormal = 20;
    maxNormal = 30;
  } else if (ageYears < 3) {
    minNormal = 8;
    maxNormal = 12;
  } else if (ageYears < 7) {
    minNormal = 6;
    maxNormal = 9;
  } else if (ageYears < 10) {
    minNormal = 5;
    maxNormal = 8;
  } else if (ageYears < 12) {
    minNormal = 5;
    maxNormal = 9;
  } else if (ageYears < 14) {
    minNormal = 6;
    maxNormal = 10;
  } else if (ageYears < 16) {
    minNormal = 5;
    maxNormal = 8;
  } else {
    // 16岁以上
    minNormal = 2;
    maxNormal = 5;
  }

  if (annualGrowthRate < minNormal) {
    return { status: '偏慢（需关注）', isNormal: false, color: 'text-red-500' };
  } else if (annualGrowthRate > maxNormal) {
    return { status: '偏快（性早熟风险）', isNormal: false, color: 'text-orange-500' };
  } else {
    return { status: '正常', isNormal: true, color: 'text-green-500' };
  }
};

// 18岁男孩身高标准（厘米）- 中国标准
const BOY_18_HEIGHT = { P3: 161, P10: 165, P25: 169, P50: 173, P75: 177, P90: 180, P97: 184 };

// 18岁女孩身高标准（厘米）- 中国标准
const GIRL_18_HEIGHT = { P3: 150, P10: 154, P25: 157, P50: 161, P75: 164, P90: 168, P97: 171 };

// 中国男孩身高标准数据（0-18岁）
const WHO_BOY_HEIGHT = [
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

// 中国女孩身高标准数据（0-18岁）
const WHO_GIRL_HEIGHT = [
  { age: 0, P3: 46, P10: 47, P25: 49, P50: 50, P75: 51, P90: 52, P97: 53 },
  { age: 1, P3: 70, P10: 72, P25: 73, P50: 75, P75: 77, P90: 78, P97: 80 },
  { age: 2, P3: 81, P10: 83, P25: 85, P50: 87, P75: 90, P90: 92, P97: 94 },
  { age: 3, P3: 89, P10: 91, P25: 93, P50: 96, P75: 98, P90: 100, P97: 103 },
  { age: 4, P3: 96, P10: 98, P25: 100, P50: 103, P75: 106, P90: 108, P97: 111 },
  { age: 5, P3: 102, P10: 105, P25: 107, P50: 110, P75: 113, P90: 116, P97: 118 },
  { age: 6, P3: 108, P10: 111, P25: 113, P50: 117, P75: 120, P90: 122, P97: 125 },
  { age: 7, P3: 113, P10: 116, P25: 119, P50: 122, P75: 126, P90: 129, P97: 132 },
  { age: 8, P3: 118, P10: 122, P25: 125, P50: 128, P75: 132, P90: 135, P97: 139 },
  { age: 9, P3: 123, P10: 127, P25: 130, P50: 134, P75: 138, P90: 142, P97: 145 },
  { age: 10, P3: 128, P10: 132, P25: 136, P50: 140, P75: 144, P90: 148, P97: 152 },
  { age: 11, P3: 134, P10: 138, P25: 142, P50: 147, P75: 151, P90: 155, P97: 159 },
  { age: 12, P3: 140, P10: 144, P25: 148, P50: 152, P75: 158, P90: 161, P97: 164 },
  { age: 13, P3: 145, P10: 149, P25: 152, P50: 156, P75: 160, P90: 164, P97: 168 },
  { age: 14, P3: 148, P10: 151, P25: 155, P50: 159, P75: 162, P90: 166, P97: 169 },
  { age: 15, P3: 149, P10: 153, P25: 156, P50: 160, P75: 164, P90: 167, P97: 170 },
  { age: 16, P3: 150, P10: 153, P25: 156, P50: 160, P75: 164, P90: 167, P97: 170 },
  { age: 17, P3: 150, P10: 153, P25: 157, P50: 160, P75: 164, P90: 167, P97: 171 },
  { age: 18, P3: 150, P10: 154, P25: 157, P50: 161, P75: 164, P90: 168, P97: 171 },
];

// 基于百分位追踪预测成年身高
export const predictAdultHeight = (
  currentAgeYears: number,
  currentHeight: number,
  gender: 'male' | 'female'
): { predicted: number; rangeMin: number; rangeMax: number; currentPercentile: string } => {
  // 输入验证
  if (currentAgeYears < 0 || currentAgeYears > 18) {
    return { predicted: 170, rangeMin: 165, rangeMax: 175, currentPercentile: '未知' };
  }
  if (currentHeight < 30 || currentHeight > 200) {
    return { predicted: 170, rangeMin: 165, rangeMax: 175, currentPercentile: '未知' };
  }
  
  // 选择对应性别的标准数据
  const standards = gender === 'male' ? WHO_BOY_HEIGHT : WHO_GIRL_HEIGHT;
  const age18Standard = gender === 'male' ? BOY_18_HEIGHT : GIRL_18_HEIGHT;

  // 查找当前年龄的标准数据
  const ageStandard = standards.find((s) => s.age === currentAgeYears);
  if (!ageStandard) {
    return { predicted: 170, rangeMin: 165, rangeMax: 175, currentPercentile: '未知' };
  }

  // 确定当前百分位（使用P3, P25, P50, P75, P97进行分段判断）
  let currentPercentile = 'P50';
  if (currentHeight < ageStandard.P3) {
    currentPercentile = 'P3以下';
  } else if (currentHeight < ageStandard.P25) {
    currentPercentile = 'P25';
  } else if (currentHeight < ageStandard.P75) {
    currentPercentile = 'P50';
  } else {
    currentPercentile = 'P75';
  }

  // 根据18岁的标准，计算预测身高
  let predictedHeight: number;
  let minHeight: number;
  let maxHeight: number;

  if (currentPercentile === 'P3以下') {
    // 低于P3，使用P3的18岁值
    predictedHeight = age18Standard.P3;
    minHeight = age18Standard.P3 - 2;
    maxHeight = age18Standard.P25;
  } else if (currentPercentile === 'P25') {
    // P25附近
    predictedHeight = age18Standard.P25;
    minHeight = age18Standard.P10;
    maxHeight = age18Standard.P50;
  } else if (currentPercentile === 'P50') {
    // P50附近
    predictedHeight = age18Standard.P50;
    minHeight = age18Standard.P25;
    maxHeight = age18Standard.P75;
  } else {
    // P75附近
    predictedHeight = age18Standard.P75;
    minHeight = age18Standard.P50;
    maxHeight = age18Standard.P90;
  }

  // 如果年龄接近18岁（17岁以上），预测身高应该接近当前身高
  if (currentAgeYears >= 17) {
    predictedHeight = Math.max(predictedHeight, currentHeight + 1);
    minHeight = Math.max(minHeight, currentHeight);
    maxHeight = Math.max(maxHeight, currentHeight + 2);
  }
  
  // 确保预测身高不低于当前身高（除非已经超过18岁）
  if (currentAgeYears < 18) {
    const minPredicted = currentHeight + (18 - currentAgeYears) * 0.5; // 最小增长：每年0.5cm
    predictedHeight = Math.max(predictedHeight, Math.round(minPredicted));
    minHeight = Math.max(minHeight, Math.round(minPredicted));
    maxHeight = Math.max(maxHeight, Math.round(minPredicted) + 10);
  }

  // 合理性检查：预测身高应该在合理范围内
  const reasonableMax = currentAgeYears < 10 ? currentHeight + 100 : currentHeight + 30;
  predictedHeight = Math.min(predictedHeight, reasonableMax);
  maxHeight = Math.min(maxHeight, reasonableMax);

  return {
    predicted: Math.round(predictedHeight),
    rangeMin: Math.round(minHeight),
    rangeMax: Math.round(maxHeight),
    currentPercentile,
  };
};

// 示例数据
export const sampleReportData: ReportData = {
  childName: '小明',
  gender: 'male',
  birthDate: '2018-06-15',
  assessmentDate: '2024-12-15',
  reportId: 'GHT-20241215-001',

  currentHeight: 118,
  currentWeight: 22,

  fatherHeight: 175,
  motherHeight: 162,
  gestationalWeeks: 39,

  growthRecords: [
    { ageYears: 0, ageMonths: 0, height: 50, weight: 3.2, date: '2018-06-15' },
    { ageYears: 1, ageMonths: 0, height: 75, weight: 9.5, date: '2019-06-15' },
    { ageYears: 2, ageMonths: 0, height: 87, weight: 12.0, date: '2020-06-15' },
    { ageYears: 3, ageMonths: 0, height: 96, weight: 14.5, date: '2021-06-15' },
    { ageYears: 4, ageMonths: 0, height: 103, weight: 16.5, date: '2022-06-15' },
    { ageYears: 5, ageMonths: 0, height: 110, weight: 18.5, date: '2023-06-15' },
    { ageYears: 6, ageMonths: 0, height: 115, weight: 21.0, date: '2024-06-15' },
  ],

  annualHeightGrowth: 6, // 年身高增长值：6cm/年

  boneAge: 6.5,

  healthFactors: {
    mainIssues: ['挑食', '晚睡', '运动不足'],
    sleep: {
      sleepTime: '22:30',
      idealSleepTime: '21:00-21:30',
      gapAnalysis: '晚睡1小时，影响生长激素分泌',
    },
    nutrition: {
      dietStructure: '肉多菜少',
      idealStandard: '均衡膳食',
      gapAnalysis: '蛋白质过剩，微量元素可能不足',
    },
    exercise: {
      frequency: '偶尔',
      idealStandard: '每日30分钟',
      gapAnalysis: '中高强度运动不足',
    },
    emotion: {
      status: '愉快',
      idealStandard: '愉悦',
      gapAnalysis: '心理状态良好',
    },
    parentWillingness: 'high',
  },

  conclusion: {
    overallRating: 'B',
    geneticPotentialGap: 57,
    geneticTarget: 175,
    predictedAdultHeight: 173,
    predictedHeightRange: { min: 169, max: 177 },
    currentPercentile: 'P50',
    riskFactors: ['晚睡', '挑食', '运动不足'],
  },

  organization: {
    name: '儿童健康成长管理中心',
    logo: '',
    address: '北京市朝阳区健康路88号',
    phone: '010-88888888',
  },
};
