import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ExportTablePayload {
  title: string;
  subtitle: string;
  headers: string[];
  rows: (string | number)[][];
  summaryPairs?: { label: string; value: string }[];
}

export function exportToCSV(filename: string, payload: ExportTablePayload): void {
  const lines: string[] = [];
  lines.push(`"${payload.title.replace(/"/g, '""')}"`);
  lines.push(`"${payload.subtitle.replace(/"/g, '""')}"`);
  if (payload.summaryPairs?.length) {
    lines.push('');
    for (const pair of payload.summaryPairs) {
      lines.push(`"${pair.label.replace(/"/g, '""')}","${pair.value.replace(/"/g, '""')}"`);
    }
  }
  lines.push('');
  lines.push(payload.headers.map((h) => `"${String(h).replace(/"/g, '""')}"`).join(','));
  for (const row of payload.rows) {
    lines.push(row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','));
  }

  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToExcel(filename: string, payload: ExportTablePayload): void {
  const wb = XLSX.utils.book_new();
  const sheetData: (string | number)[][] = [
    [payload.title],
    [payload.subtitle],
    [],
  ];
  if (payload.summaryPairs?.length) {
    for (const pair of payload.summaryPairs) {
      sheetData.push([pair.label, pair.value]);
    }
    sheetData.push([]);
  }
  sheetData.push(payload.headers);
  for (const row of payload.rows) {
    sheetData.push(row);
  }
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  XLSX.utils.book_append_sheet(wb, ws, 'Financial Report');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPDF(filename: string, payload: ExportTablePayload): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  doc.setFontSize(16);
  doc.setTextColor(11, 25, 44);
  doc.text(payload.title, 40, 44);

  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(payload.subtitle, 40, 62);

  let startY = 82;
  if (payload.summaryPairs?.length) {
    autoTable(doc, {
      startY,
      head: [['Metric', 'Value']],
      body: payload.summaryPairs.map((p) => [p.label, p.value]),
      theme: 'grid',
      headStyles: { fillColor: [11, 25, 44] },
      styles: { fontSize: 9 },
      margin: { left: 40, right: 40 },
    });
    const lastTable = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
    startY = (lastTable?.finalY || startY) + 20;
  }

  autoTable(doc, {
    startY,
    head: [payload.headers],
    body: payload.rows.map((r) => r.map((c) => String(c))),
    theme: 'striped',
    headStyles: { fillColor: [13, 148, 136] },
    styles: { fontSize: 8.5 },
    margin: { left: 40, right: 40 },
  });

  doc.save(`${filename}.pdf`);
}
