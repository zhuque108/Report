'use client';

import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';
import { useState } from 'react';

export default function PrintButton() {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  return (
    <Button
      onClick={handlePrint}
      disabled={isPrinting}
      size="lg"
      className="shadow-lg"
    >
      <Printer className="mr-2 h-5 w-5" />
      {isPrinting ? '正在打印...' : '打印报告'}
    </Button>
  );
}
