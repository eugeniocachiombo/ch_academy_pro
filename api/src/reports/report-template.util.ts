import fs from 'node:fs';
import path from 'node:path';
import * as XLSX from 'xlsx';

const TEMPLATES_DIR = path.resolve(process.cwd(), 'src/reports/templates');

export interface ReportMeta {
  republica?: string;
  ministerio?: string;
  escola?: string;
  escolaDetalhe?: string;
  reportTitle: string;
  subtitulo?: string;
  camposExtras?: Record<string, string | number | null | undefined>;
  emitidoEm?: string;
}

export function escapeHtml(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function fillTemplate(template: string, vars: Record<string, string>): string {
  let output = template;
  for (const [key, val] of Object.entries(vars)) {
    output = output.replaceAll(`{{${key}}}`, val);
  }
  return output;
}

export function loadTemplateHtml(fileName: string): string {
  return fs.readFileSync(path.join(TEMPLATES_DIR, fileName), 'utf-8');
}

export function renderClassReportHtml(
  classTemplateFileName: string,
  classVars: Record<string, string>,
  meta: ReportMeta
): string {
  const baseHtml = loadTemplateHtml('base-report.html');
  const classHtml = loadTemplateHtml(classTemplateFileName);
  const bodyHtml = fillTemplate(classHtml, classVars);

  const extrasHtml = Object.entries(meta.camposExtras ?? {})
    .filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '')
    .map(
      ([label, val]) =>
        `<div><strong>${escapeHtml(label)}:</strong> <span>${escapeHtml(val)}</span></div>`
    )
    .join('');

  return fillTemplate(baseHtml, {
    REPUBLICA: escapeHtml(meta.republica ?? 'REPÚBLICA DE ANGOLA'),
    MINISTERIO: escapeHtml(meta.ministerio ?? 'MINISTÉRIO DA EDUCAÇÃO'),
    ESCOLA: escapeHtml(meta.escola ?? '____________________________________'),
    ESCOLA_DETALHE: escapeHtml(meta.escolaDetalhe ?? ''),
    REPORT_TITLE: escapeHtml(meta.reportTitle),
    SUBTITULO: escapeHtml(meta.subtitulo ?? ''),
    CAMPOS_EXTRAS: extrasHtml,
    BODY: bodyHtml,
    EMITIDO_EM: escapeHtml(meta.emitidoEm ?? new Date().toLocaleString('pt-PT')),
  });
}

export function buildRecordExcelBuffer(
  sheetName: string,
  rows: Record<string, string | number>[]
): Buffer {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
  XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31) || 'Chamada');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}