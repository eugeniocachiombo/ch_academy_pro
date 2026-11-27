import fs from "node:fs";
import path from "node:path";
import * as XLSX from "xlsx";

const basePath = path.resolve(process.cwd(), "src/reports/templates/base.html");
const itemPath = path.resolve(process.cwd(), "src/reports/templates/student-presence.html");

const STATUS: Record<string, string> = {
  PRESENT: "Presente",
  ABSENT: "Falta",
  JUSTIFICATED: "Justificado",
};

export function buildPresenceHtml(presence: any): string {
  const baseHtml = fs.readFileSync(basePath, "utf-8");
  const itemHtml = fs.readFileSync(itemPath, "utf-8");

  const lista = presence?.student_presence_lists ?? [];
  const linhas = lista
    .map((e: any, i: number) => {
      const nome = e.student?.user?.name || e.student?.name || `Aluno #${e.student_id}`;
      const estado = STATUS[e.status] || e.status || "—";
      return `<tr><td>${i + 1}</td><td>${nome}</td><td>${estado}</td></tr>`;
    })
    .join("");

  const tabela = itemHtml.replace("{{LINHAS}}", linhas || `<tr><td colspan="3">Sem alunos</td></tr>`);

  const escola = presence?.school?.name || "Escola";
  const turma = presence?.groupconfig?.group?.name || presence?.groupconfig?.name || "—";
  const disciplina = presence?.subject?.name || "—";
  const data = presence?.date ? new Date(presence.date).toLocaleDateString("pt-PT") : "—";

  const camposExtras = `
    <span><strong>Turma:</strong> ${turma}</span>
    <span><strong>Disciplina:</strong> ${disciplina}</span>
    <span><strong>Data:</strong> ${data}</span>
  `;

  return baseHtml
    .replaceAll("{{TITULO}}", "Lista de Presença")
    .replaceAll("{{ESCOLA}}", escola)
    .replace("{{CAMPOS_EXTRAS}}", camposExtras)
    .replace("{{CONTEUDO}}", tabela);
}

export function buildPresenceExcel(presence: any): Buffer {
  const turma = presence?.groupconfig?.group?.name || presence?.groupconfig?.name || "—";
  const disciplina = presence?.subject?.name || "—";
  const data = presence?.date ? new Date(presence.date).toLocaleDateString("pt-PT") : "—";
  const lista = presence?.student_presence_lists ?? [];

  const rows = lista.map((e: any, i: number) => ({
    "#": i + 1,
    Data: data,
    Turma: turma,
    Disciplina: disciplina,
    Aluno: e.student?.user?.name || e.student?.name || `Aluno #${e.student_id}`,
    Estado: STATUS[e.status] || e.status || "—",
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
  XLSX.utils.book_append_sheet(wb, ws, "Chamada");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}