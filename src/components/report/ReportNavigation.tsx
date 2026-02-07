import { Button } from '@/components/ui/button';
import { ChevronLeft, Home } from 'lucide-react';
import Link from 'next/link';

interface ReportNavigationProps {
  reportId: string;
  childName: string;
}

export default function ReportNavigation({ reportId, childName }: ReportNavigationProps) {
  return (
    <nav className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-[210mm] items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ChevronLeft className="mr-2 h-4 w-4" />
              返回首页
            </Button>
          </Link>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="text-sm font-medium text-gray-700">
            {childName} 的身高发育测评报告
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">报告编号: {reportId}</span>
        </div>
      </div>
    </nav>
  );
}
