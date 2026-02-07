'use client';

import { useRef, useCallback, useState } from 'react';
import type { ReportData } from '@/types/report';
import ReportCover from '@/components/report/ReportCover';
import ReportPage1 from '@/components/report/ReportPage1';
import ReportPage2 from '@/components/report/ReportPage2';
import ReportPage3 from '@/components/report/ReportPage3';
import ReportPage4 from '@/components/report/ReportPage4';
import ReportBackCover from '@/components/report/ReportBackCover';
import { generatePDFFromContainer } from '@/lib/client-pdf';
import JSZip from 'jszip';

interface BatchPDFGeneratorProps {
  reports: ReportData[];
  onProgress: (current: number, total: number) => void;
  onComplete: (zipBlob: Blob) => void;
  onError: (error: string) => void;
}

export default function BatchPDFGenerator({
  reports,
  onProgress,
  onComplete,
  onError,
}: BatchPDFGeneratorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const isGenerating = useRef(false);

  const generate = useCallback(async () => {
    if (isGenerating.current) return;
    isGenerating.current = true;

    const zip = new JSZip();

    try {
      for (let i = 0; i < reports.length; i++) {
        const report = reports[i];
        onProgress(i, reports.length);

        // Render the report into the hidden container
        setCurrentReport(report);

        // Wait for React to render + charts to settle
        await new Promise((r) => setTimeout(r, 2000));

        const container = containerRef.current;
        if (!container) {
          console.error('Container not found');
          continue;
        }

        try {
          const pdfBuffer = await generatePDFFromContainer(container);
          const fileName = `${report.childName}_${report.reportId}.pdf`;
          zip.file(fileName, pdfBuffer);
        } catch (err) {
          console.error(`生成 ${report.childName} PDF 失败:`, err);
        }
      }

      onProgress(reports.length, reports.length);

      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      onComplete(zipBlob);
    } catch (err) {
      onError(err instanceof Error ? err.message : '批量生成失败');
    } finally {
      isGenerating.current = false;
      setCurrentReport(null);
    }
  }, [reports, onProgress, onComplete, onError]);

  // Auto-start generation when mounted
  const startedRef = useRef(false);
  if (!startedRef.current) {
    startedRef.current = true;
    // Use setTimeout to start after first render
    setTimeout(generate, 100);
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: '-9999px',
        top: 0,
        width: '210mm',
        zIndex: -1,
        background: 'white',
      }}
    >
      {currentReport && (
        <>
          <section><ReportCover data={currentReport} /></section>
          <section><ReportPage1 data={currentReport} /></section>
          <section><ReportPage2 data={currentReport} /></section>
          <section><ReportPage3 data={currentReport} /></section>
          <section><ReportPage4 data={currentReport} /></section>
          <section><ReportBackCover data={currentReport} /></section>
        </>
      )}
    </div>
  );
}
