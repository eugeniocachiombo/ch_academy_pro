import { prisma } from '../../lib/prisma';

const defaultPositions = [
  { name: 'Director Geral', editable: false },
  { name: 'Subdirector Pedagógico', editable: false },
  { name: 'Subdirector Administrativo', editable: false },
  { name: 'Coordenador de Curso', editable: false },
  { name: 'Coordenador de Disciplina', editable: false },
  { name: 'Professor', editable: false },
  { name: 'Secretário', editable: false },
  { name: 'Tesoureiro', editable: false },
  { name: 'Contabilista', editable: false },
  { name: 'Técnico de Recursos Humanos', editable: false },
  { name: 'Técnico de Informática', editable: false },
  { name: 'Recepcionista', editable: true },
  { name: 'Auxiliar de Limpeza', editable: true },
  { name: 'Segurança', editable: true },
];

export async function seedPositions(tx: any = prisma) {
  for (const item of defaultPositions) {
    const existing = await tx.position.findFirst({
      where: {
        name: item.name,
        school_id: null,
      },
    });

    if (!existing) {
      await tx.position.create({
        data: {
          name: item.name,
          department_id: null,
          school_id: null,
          editable: item.editable,
        },
      });
    }
  }

  console.log('Seed de cargos concluído com sucesso!');
}