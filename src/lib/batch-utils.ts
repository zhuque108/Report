import {
  ReportData,
  predictAdultHeight,
  generatePersonalizedAdvice,
} from '@/types/report';

// Excel 行数据的原始类型
export interface ExcelRow {
  姓名: string;
  性别: string;
  '出生日期(年/月)': string;
  '当前身高(cm)': number;
  '当前体重(kg)': number;
  '父亲身高(cm)': number;
  '母亲身高(cm)': number;
  '近1年身高长了多少(cm)': number | string;
  '最困扰的1-3个问题': string;
  家长改善意愿强度: string;
  '出生孕周(周)': number;
  填表时间: string;
}

// 校验结果
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: ReportData;
}

// 将 Excel 日期转为 YYYY-MM-DD 字符串
function normalizeDate(raw: string | number | Date): string {
  if (!raw) return new Date().toISOString().split('T')[0];

  // Excel 序列号日期
  if (typeof raw === 'number') {
    const excelEpoch = new Date(1899, 11, 30);
    const date = new Date(excelEpoch.getTime() + raw * 86400000);
    return date.toISOString().split('T')[0];
  }

  if (raw instanceof Date) {
    return raw.toISOString().split('T')[0];
  }

  const str = String(raw).trim();

  // 尝试多种格式
  // YYYY-MM-DD
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) return str;
  // YYYY/MM/DD
  if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(str)) return str.replace(/\//g, '-');
  // YYYY年MM月DD日
  const cnMatch = str.match(/(\d{4})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})?\s*日?/);
  if (cnMatch) {
    const y = cnMatch[1];
    const m = cnMatch[2].padStart(2, '0');
    const d = (cnMatch[3] || '01').padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 兜底：尝试 Date.parse
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString().split('T')[0];
  }

  return new Date().toISOString().split('T')[0];
}

// 性别映射
function normalizeGender(raw: string): 'male' | 'female' {
  const s = String(raw).trim();
  if (s === '男' || s === '男孩' || s.toLowerCase() === 'male' || s.toLowerCase() === 'm') return 'male';
  return 'female';
}

// 意愿映射
function normalizeWillingness(raw: string): 'high' | 'medium' | 'low' {
  const s = String(raw).trim();
  if (s === '高' || s === 'high') return 'high';
  if (s === '低' || s === 'low') return 'low';
  return 'medium';
}

// 解析困扰问题
function parseIssues(raw: string): string[] {
  if (!raw) return [];
  const s = String(raw).trim();
  // 支持顿号、逗号、分号分割
  return s.split(/[、，,；;]/).map(i => i.trim()).filter(Boolean);
}

// 校验单行数据
export function validateRow(row: ExcelRow, index: number): ValidationResult {
  const errors: string[] = [];
  const prefix = `第${index + 1}行`;

  if (!row.姓名 || String(row.姓名).trim() === '') {
    errors.push(`${prefix}: 姓名不能为空`);
  }

  const height = Number(row['当前身高(cm)']);
  if (isNaN(height) || height < 30 || height > 200) {
    errors.push(`${prefix}: 身高应在30-200cm之间`);
  }

  const weight = Number(row['当前体重(kg)']);
  if (isNaN(weight) || weight < 2 || weight > 150) {
    errors.push(`${prefix}: 体重应在2-150kg之间`);
  }

  const fatherH = Number(row['父亲身高(cm)']);
  if (isNaN(fatherH) || fatherH < 140 || fatherH > 220) {
    errors.push(`${prefix}: 父亲身高应在140-220cm之间`);
  }

  const motherH = Number(row['母亲身高(cm)']);
  if (isNaN(motherH) || motherH < 130 || motherH > 200) {
    errors.push(`${prefix}: 母亲身高应在130-200cm之间`);
  }

  const weeks = Number(row['出生孕周(周)']);
  if (isNaN(weeks) || weeks < 28 || weeks > 42) {
    errors.push(`${prefix}: 出生孕周应在28-42周之间`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // 转换为 ReportData
  const data = excelRowToReportData(row, index);
  return { valid: true, errors: [], data };
}

// 核心转换函数：Excel 行 → ReportData
export function excelRowToReportData(row: ExcelRow, index: number): ReportData {
  const childName = String(row.姓名).trim();
  const gender = normalizeGender(row.性别);
  const birthDate = normalizeDate(row['出生日期(年/月)']);
  const assessmentDate = normalizeDate(row.填表时间);
  const currentHeight = Number(row['当前身高(cm)']);
  const currentWeight = Number(row['当前体重(kg)']);
  const fatherHeight = Number(row['父亲身高(cm)']);
  const motherHeight = Number(row['母亲身高(cm)']);
  const annualHeightGrowth = Number(row['近1年身高长了多少(cm)']) || 0;
  const mainIssues = parseIssues(row['最困扰的1-3个问题']);
  const parentWillingness = normalizeWillingness(row.家长改善意愿强度);
  const gestationalWeeks = Number(row['出生孕周(周)']);

  // 生成报告 ID
  const dateStr = assessmentDate.replace(/-/g, '');
  const seq = String(index + 1).padStart(3, '0');
  const reportId = `GHT-${dateStr}-${seq}`;

  // 计算年龄
  const birth = new Date(birthDate);
  const assess = new Date(assessmentDate);
  let years = assess.getFullYear() - birth.getFullYear();
  let months = assess.getMonth() - birth.getMonth();
  if (months < 0) { years--; months += 12; }

  // 计算遗传靶身高
  let geneticTarget: number;
  if (gender === 'male') {
    geneticTarget = (fatherHeight + motherHeight + 13) / 2;
  } else {
    geneticTarget = (fatherHeight + motherHeight - 13) / 2;
  }

  // 生成模拟生长记录
  const growthRecords = [];
  for (let i = 0; i <= years; i++) {
    const baseHeight = 50 + i * 6;
    const baseWeight = 3.2 + i * 2.5;
    growthRecords.push({
      ageYears: i,
      ageMonths: 0,
      height: i === years ? currentHeight : baseHeight,
      weight: i === years ? currentWeight : baseWeight,
      date: new Date(birth.getFullYear() + i, birth.getMonth(), birth.getDate()).toISOString().split('T')[0],
    });
  }

  // 健康因素
  const hasLateSleep = mainIssues.includes('晚睡');
  const hasPickyEating = mainIssues.includes('挑食') || mainIssues.includes('厌食');
  const hasNoExercise = mainIssues.includes('不爱运动') || mainIssues.includes('运动不足');

  // 预测成年身高
  const heightPrediction = predictAdultHeight(years, currentHeight, gender);

  const reportData: ReportData = {
    childName,
    gender,
    birthDate,
    assessmentDate,
    reportId,
    currentHeight,
    currentWeight,
    fatherHeight,
    motherHeight,
    gestationalWeeks,
    growthRecords,
    annualHeightGrowth,
    healthFactors: {
      mainIssues,
      sleep: {
        sleepTime: hasLateSleep ? '22:30' : '21:00',
        idealSleepTime: '21:00-21:30',
        gapAnalysis: hasLateSleep ? '晚睡1小时，影响生长激素分泌' : '睡眠时间正常',
      },
      nutrition: {
        dietStructure: hasPickyEating ? '肉多菜少' : '均衡膳食',
        idealStandard: '均衡膳食',
        gapAnalysis: hasPickyEating ? '蛋白质过剩，微量元素可能不足' : '营养摄入均衡',
      },
      exercise: {
        frequency: hasNoExercise ? '偶尔' : '每日30分钟',
        idealStandard: '每日30分钟',
        gapAnalysis: hasNoExercise ? '中高强度运动不足' : '运动量充足',
      },
      emotion: {
        status: '愉快',
        idealStandard: '愉悦',
        gapAnalysis: '心理状态良好',
      },
      parentWillingness,
    },
    conclusion: {
      overallRating: mainIssues.length >= 2 ? 'C' : 'B',
      geneticPotentialGap: Math.round(geneticTarget - currentHeight),
      geneticTarget: Math.round(geneticTarget),
      predictedAdultHeight: heightPrediction.predicted,
      predictedHeightRange: {
        min: heightPrediction.rangeMin,
        max: heightPrediction.rangeMax,
      },
      currentPercentile: heightPrediction.currentPercentile,
      riskFactors: mainIssues,
    },
    organization: {
      name: '儿童健康成长管理中心',
      logo: '',
      address: '北京市朝阳区健康路88号',
      phone: '010-88888888',
    },
  };

  return reportData;
}
