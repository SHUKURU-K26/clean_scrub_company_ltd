import * as XLSX from 'xlsx';

export function exportToExcel({ title, columns, rows, filename }) {
  const worksheet = XLSX.utils.aoa_to_sheet([columns, ...rows]);
  worksheet['!cols'] = columns.map(() => ({ wch: 20 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, title.slice(0, 31));
  XLSX.writeFile(workbook, `${filename || 'export'}.xlsx`);
}