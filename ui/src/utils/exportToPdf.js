import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Generic — pass any title/columns/rows, works for a full table or a single record
export function exportToPdf({ title, columns, rows, filename }) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 16);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 22);

  autoTable(doc, {
    startY: 28,
    head: [columns],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [11, 37, 69], textColor: 255 },
    alternateRowStyles: { fillColor: [244, 247, 246] },
  });

  doc.save(`${filename || 'export'}.pdf`);
}