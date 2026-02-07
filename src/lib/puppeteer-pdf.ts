import puppeteer, { Browser } from 'puppeteer-core';
import type { ReportData } from '@/types/report';

const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = process.env.PUPPETEER_BASE_URL || `http://localhost:${process.env.DEPLOY_RUN_PORT || 5000}`;

let browser: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browser && browser.connected) {
    return browser;
  }
  browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    userDataDir: process.env.TEMP
      ? `${process.env.TEMP}/puppeteer-chrome-profile`
      : 'C:/tmp/puppeteer-chrome-profile',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=none',
    ],
  });
  return browser;
}

export async function closeBrowser(): Promise<void> {
  if (browser) {
    await browser.close().catch(() => {});
    browser = null;
  }
}

export async function generateReportPDF(
  reportData: ReportData,
  reportId: string,
): Promise<Buffer> {
  const b = await getBrowser();
  const page = await b.newPage();

  try {
    // Set A4 viewport
    await page.setViewport({ width: 794, height: 1123 });

    // Navigate to a lightweight blank page on the same origin to establish sessionStorage
    const url = `${BASE_URL}/report/${reportId}`;
    await page.goto(`${BASE_URL}/blank`, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // Set sessionStorage on the now-established origin (before navigating to report)
    await page.evaluate(
      (id: string, data: string) => {
        sessionStorage.setItem(`report-${id}`, data);
      },
      reportId,
      JSON.stringify(reportData),
    );

    // Navigate to the report page — sessionStorage is already populated
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for Recharts SVG to appear (growth curve charts)
    await page.waitForSelector('.recharts-surface', { timeout: 10000 }).catch(() => {
      // Charts may not exist for all reports, continue anyway
    });

    // Extra delay for animations to settle
    await new Promise((r) => setTimeout(r, 1500));

    // Switch to print media to activate @media print rules
    await page.emulateMediaType('print');

    // Inject cleanup CSS for PDF output
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent = `
        body { background: white !important; }
        .min-h-screen { min-height: auto !important; background: white !important; }
        .mx-auto.max-w-\\[210mm\\] { padding: 0 !important; max-width: none !important; }
        section { margin-bottom: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
        .fixed { display: none !important; }
        nav { display: none !important; }
      `;
      document.head.appendChild(style);
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await page.close();
  }
}
