import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatCurrency, formatDate } from './formatters';

export const exportToPDF = (title: string, data: any[], columns: { header: string; dataKey: string }[]) => {
  const doc = new jsPDF() as any;

  doc.setFontSize(18);
  doc.text('Mestre Ateliê - Relatório', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`${title}`, 14, 30);
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 14, 36);

  doc.autoTable({
    startY: 45,
    head: [columns.map(col => col.header)],
    body: data.map(item => columns.map(col => {
      const val = item[col.dataKey];
      if (col.dataKey === 'valor' || col.dataKey === 'minha_parte' || col.dataKey === 'total') {
        return formatCurrency(Number(val));
      }
      if (col.dataKey === 'created_at' || col.dataKey === 'data') {
        return formatDate(val);
      }
      return val;
    })),
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    styles: { fontSize: 9 },
    margin: { top: 40 },
  });

  doc.save(`mestre-atelie-${title.toLowerCase().replace(/\s+/g, '-')}.pdf`);
};
