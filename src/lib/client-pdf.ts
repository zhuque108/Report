import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Capture all <section> elements inside a container and produce a single A4 PDF.
 * Returns the PDF as an ArrayBuffer.
 */
export async function generatePDFFromContainer(
  container: HTMLElement,
): Promise<ArrayBuffer> {
  const sections = container.querySelectorAll('section');
  if (sections.length === 0) {
    throw new Error('未找到报告内容');
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'A4',
  });

  const pageWidth = 210;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i] as HTMLElement;

    const canvas = await html2canvas(section, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      allowTaint: false,
      foreignObjectRendering: false,
      imageTimeout: 0,
      removeContainer: true,
    });

    if (i > 0) {
      pdf.addPage();
    }

    const imgData = canvas.toDataURL('image/png', 1.0);
    const imgHeight = (canvas.height * pageWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
  }

  return pdf.output('arraybuffer');
}
