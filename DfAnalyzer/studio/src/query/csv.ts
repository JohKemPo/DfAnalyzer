import type { QueryResult } from '../api/catalog';

/** Converte o resultado em CSV. */
export function toCsv(result: Pick<QueryResult, 'columns' | 'rows'>): string {
  const header = result.columns.map((column) => escapeCell(column.name));
  const lines = [header.join(',')];
  for (const row of result.rows) {
    lines.push(row.map((cell) => escapeCell(cell)).join(','));
  }
  return lines.join('\n');
}

function escapeCell(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** Dispara o download no navegador, sem passar pelo servidor. */
export function downloadCsv(filename: string, content: string): void {
  // BOM para o Excel reconhecer UTF-8 — os dados deste projeto são em português.
  const blob = new Blob(['﻿', content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
