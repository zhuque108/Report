'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Baby, FileText, Send } from 'lucide-react';
import { ReportData, predictAdultHeight } from '@/types/report';

const ISSUE_OPTIONS = ['挑食', '晚睡', '不爱运动', '情绪问题', '厌食', '过度喂养'];

export default function SubmitFormPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 表单状态
  const [formData, setFormData] = useState({
    childName: '',
    currentHeight: '',
    currentWeight: '',
    birthDate: '',
    gender: 'male',
    fatherHeight: '',
    motherHeight: '',
   半年HeightGrowth: '',
    mainIssues: [] as string[],
    willingness: 'high',
    gestationalWeeks: '',
    assessmentDate: new Date().toISOString().split('T')[0],
    doctorAdvice: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleIssueChange = (issue: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      mainIssues: checked
        ? [...prev.mainIssues, issue]
        : prev.mainIssues.filter((i) => i !== issue),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 基本数据验证
    const height = Number(formData.currentHeight);
    const weight = Number(formData.currentWeight);
    const fatherHeight = Number(formData.fatherHeight);
    const motherHeight = Number(formData.motherHeight);
    const annualGrowth = Number(formData.半年HeightGrowth);
    
    // 身高范围验证（30cm - 200cm）
    if (height < 30 || height > 200) {
      alert('身高输入不正确，请在30-200cm之间');
      setIsSubmitting(false);
      return;
    }
    
    // 体重范围验证（2kg - 150kg）
    if (weight < 2 || weight > 150) {
      alert('体重输入不正确，请在2-150kg之间');
      setIsSubmitting(false);
      return;
    }
    
    // 父亲身高范围验证（140cm - 220cm）
    if (fatherHeight < 140 || fatherHeight > 220) {
      alert('父亲身高输入不正确，请在140-220cm之间');
      setIsSubmitting(false);
      return;
    }
    
    // 母亲身高范围验证（130cm - 200cm）
    if (motherHeight < 130 || motherHeight > 200) {
      alert('母亲身高输入不正确，请在130-200cm之间');
      setIsSubmitting(false);
      return;
    }
    
    // 年身高增长值范围验证（0 - 30cm）
    if (annualGrowth < 0 || annualGrowth > 30) {
      alert('年身高增长值输入不正确，请在0-30cm之间');
      setIsSubmitting(false);
      return;
    }
    
    // 出生孕周范围验证（28 - 42周）
    const gestationalWeeks = Number(formData.gestationalWeeks);
    if (gestationalWeeks < 28 || gestationalWeeks > 42) {
      alert('出生孕周输入不正确，请在28-42周之间');
      setIsSubmitting(false);
      return;
    }

    // 生成报告数据
    const reportId = `GHT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // 计算实足年龄
    const birthDate = new Date(formData.birthDate);
    const assessmentDate = new Date(formData.assessmentDate);
    let years = assessmentDate.getFullYear() - birthDate.getFullYear();
    let months = assessmentDate.getMonth() - birthDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }

    // 计算BMI
    const bmi = Number((weight / ((height / 100) ** 2)).toFixed(1));

    // 计算遗传身高
    let geneticTarget: number;
    if (formData.gender === 'male') {
      geneticTarget = (fatherHeight + motherHeight + 13) / 2;
    } else {
      geneticTarget = (fatherHeight + motherHeight - 13) / 2;
    }

    // 生成模拟生长记录
    const growthRecords = [];
    for (let i = 0; i <= years; i++) {
      const baseHeight = 50 + i * 6; // 简化的增长曲线
      const baseWeight = 3.2 + i * 2.5;
      growthRecords.push({
        ageYears: i,
        ageMonths: 0,
        height: i === years ? height : baseHeight,
        weight: i === years ? weight : baseWeight,
        date: new Date(birthDate.getFullYear() + i, birthDate.getMonth(), birthDate.getDate()).toISOString().split('T')[0],
      });
    }
    // 添加半年记录（将年增长值除以2得到半年增长值）
    growthRecords.push({
      ageYears: years,
      ageMonths: 6,
      height: height - Number(formData.半年HeightGrowth) / 2,
      weight: weight - 0.5,
      date: new Date(assessmentDate.getFullYear(), assessmentDate.getMonth() - 6, assessmentDate.getDate()).toISOString().split('T')[0],
    });

    // 根据问题生成健康因素
    const hasLateSleep = formData.mainIssues.includes('晚睡');
    const hasPickyEating = formData.mainIssues.includes('挑食') || formData.mainIssues.includes('厌食');
    const hasNoExercise = formData.mainIssues.includes('不爱运动');

    // 使用百分位追踪预测成年身高
    const heightPrediction = predictAdultHeight(years, height, formData.gender as 'male' | 'female');

    // 生成报告数据
    const reportData: ReportData = {
      childName: formData.childName,
      gender: formData.gender as 'male' | 'female',
      birthDate: formData.birthDate,
      assessmentDate: formData.assessmentDate,
      reportId,
      currentHeight: height,
      currentWeight: weight,
      fatherHeight,
      motherHeight,
      gestationalWeeks: Number(formData.gestationalWeeks),
      growthRecords,
      annualHeightGrowth: Number(formData.半年HeightGrowth),
      healthFactors: {
        mainIssues: formData.mainIssues,
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
        parentWillingness: formData.willingness as 'high' | 'medium' | 'low',
      },
      conclusion: {
        overallRating: formData.mainIssues.length >= 2 ? 'C' : 'B',
        geneticPotentialGap: Math.round(geneticTarget - height),
        geneticTarget: Math.round(geneticTarget),
        predictedAdultHeight: heightPrediction.predicted,
        predictedHeightRange: {
          min: heightPrediction.rangeMin,
          max: heightPrediction.rangeMax,
        },
        currentPercentile: heightPrediction.currentPercentile,
        riskFactors: formData.mainIssues,
      },
      organization: {
        name: '儿童健康成长管理中心',
        logo: '',
        address: '北京市朝阳区健康路88号',
        phone: '010-88888888',
      },
    };

    // 存储到 sessionStorage
    sessionStorage.setItem(`report-${reportId}`, JSON.stringify(reportData));

    // 跳转到报告页面
    router.push(`/report/${reportId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 p-4 sm:p-8">
      <div className="mx-auto max-w-3xl">
        {/* 头部 */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg">
              <Baby className="h-7 w-7" style={{ color: '#2A5C8E' }} />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: '#2A5C8E' }}>
              儿童身高发育测评
            </h1>
          </div>
          <p className="text-gray-600">
            填写儿童基本信息，生成专业的身高发育管理报告
          </p>
        </div>

        {/* 表单 */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              基础信息录入
            </CardTitle>
            <CardDescription>
              请完整填写以下信息，我们将为您生成详细的身高发育评估报告
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 基本信息 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">基本信息</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="childName">儿童姓名 *</Label>
                    <Input
                      id="childName"
                      value={formData.childName}
                      onChange={(e) => handleInputChange('childName', e.target.value)}
                      placeholder="请输入儿童姓名"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">性别 *</Label>
                    <RadioGroup
                      value={formData.gender}
                      onValueChange={(value) => handleInputChange('gender', value)}
                    >
                      <div className="flex gap-6">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">男孩</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">女孩</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate">出生日期 *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleInputChange('birthDate', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assessmentDate">测评日期</Label>
                    <Input
                      id="assessmentDate"
                      type="date"
                      value={formData.assessmentDate}
                      onChange={(e) => handleInputChange('assessmentDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* 身体数据 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">身体数据</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="currentHeight">当前身高 (cm) *</Label>
                    <Input
                      id="currentHeight"
                      type="number"
                      step="0.1"
                      value={formData.currentHeight}
                      onChange={(e) => handleInputChange('currentHeight', e.target.value)}
                      placeholder="例如：118.5"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentWeight">当前体重 (kg) *</Label>
                    <Input
                      id="currentWeight"
                      type="number"
                      step="0.1"
                      value={formData.currentWeight}
                      onChange={(e) => handleInputChange('currentWeight', e.target.value)}
                      placeholder="例如：22.5"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="半年HeightGrowth">年身高增长值 (cm) *</Label>
                    <Input
                      id="半年HeightGrowth"
                      type="number"
                      step="0.1"
                      value={formData.半年HeightGrowth}
                      onChange={(e) => handleInputChange('半年HeightGrowth', e.target.value)}
                      placeholder="例如：6.0"
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* 遗传背景 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">遗传背景</h3>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="fatherHeight">父亲身高 (cm) *</Label>
                    <Input
                      id="fatherHeight"
                      type="number"
                      value={formData.fatherHeight}
                      onChange={(e) => handleInputChange('fatherHeight', e.target.value)}
                      placeholder="例如：175"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motherHeight">母亲身高 (cm) *</Label>
                    <Input
                      id="motherHeight"
                      type="number"
                      value={formData.motherHeight}
                      onChange={(e) => handleInputChange('motherHeight', e.target.value)}
                      placeholder="例如：162"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gestationalWeeks">出生孕周 (周) *</Label>
                    <Input
                      id="gestationalWeeks"
                      type="number"
                      value={formData.gestationalWeeks}
                      onChange={(e) => handleInputChange('gestationalWeeks', e.target.value)}
                      placeholder="例如：40"
                      required
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* 健康问题 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  最困扰的问题 <span className="text-sm font-normal text-gray-500">（请选择 1-3 项）</span>
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {ISSUE_OPTIONS.map((issue) => (
                    <div key={issue} className="flex items-center space-x-2 rounded-lg border p-3">
                      <Checkbox
                        id={issue}
                        checked={formData.mainIssues.includes(issue)}
                        onCheckedChange={(checked) =>
                          handleIssueChange(issue, checked as boolean)
                        }
                        disabled={
                          !formData.mainIssues.includes(issue) &&
                          formData.mainIssues.length >= 3
                        }
                      />
                      <Label htmlFor={issue} className="cursor-pointer">
                        {issue}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* 改善意愿 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">家长改善意愿强度</h3>
                <RadioGroup
                  value={formData.willingness}
                  onValueChange={(value) => handleInputChange('willingness', value)}
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                      <RadioGroupItem value="high" id="high" />
                      <Label htmlFor="high" className="cursor-pointer">
                        <div className="font-semibold">高</div>
                        <div className="text-xs text-gray-500">积极配合，严格执行</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium" className="cursor-pointer">
                        <div className="font-semibold">中</div>
                        <div className="text-xs text-gray-500">有一定意愿，逐步改善</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 rounded-lg border p-4">
                      <RadioGroupItem value="low" id="low" />
                      <Label htmlFor="low" className="cursor-pointer">
                        <div className="font-semibold">低</div>
                        <div className="text-xs text-gray-500">意愿不强，需要引导</div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <Separator />

              {/* 医生建议 */}
              <div className="space-y-2">
                <Label htmlFor="doctorAdvice">医生建议（可选）</Label>
                <Textarea
                  id="doctorAdvice"
                  value={formData.doctorAdvice}
                  onChange={(e) => handleInputChange('doctorAdvice', e.target.value)}
                  placeholder="如有医生建议请在此填写..."
                  rows={3}
                />
              </div>

              {/* 提交按钮 */}
              <Button
                type="submit"
                size="lg"
                className="w-full h-12 text-lg shadow-lg"
                disabled={isSubmitting}
                style={{ backgroundColor: '#2A5C8E' }}
              >
                {isSubmitting ? (
                  '正在生成报告...'
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    生成测评报告
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
