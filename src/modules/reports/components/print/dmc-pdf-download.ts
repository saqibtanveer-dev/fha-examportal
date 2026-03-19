'use client';

type DownloadDmcPdfInput = {
  element: HTMLElement;
  fileName: string;
};

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export function buildDmcPdfFileName(studentName: string, termName: string): string {
  const base = `dmc-${studentName}-${termName}`;
  const safe = sanitizeFileName(base);
  return safe || 'dmc-report';
}

export async function downloadDmcPdf({ element, fileName }: DownloadDmcPdfInput): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const imageData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageWidth = pageWidth;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  let remainingHeight = imageHeight;
  let positionY = 0;

  pdf.addImage(imageData, 'PNG', 0, positionY, imageWidth, imageHeight);
  remainingHeight -= pageHeight;

  while (remainingHeight > 0) {
    positionY = remainingHeight - imageHeight;
    pdf.addPage();
    pdf.addImage(imageData, 'PNG', 0, positionY, imageWidth, imageHeight);
    remainingHeight -= pageHeight;
  }

  pdf.save(`${sanitizeFileName(fileName) || 'dmc-report'}.pdf`);
}
