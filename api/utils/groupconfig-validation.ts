const classesIsentas = [
  "pré-iniciação",
  "pre-iniciacao",
  "1ª classe",
  "2ª classe",
  "3ª classe",
  "4ª classe",
  "5ª classe",
  "6ª classe",
  "7ª classe",
  "8ª classe",
  "9ª classe",
];

const normalizeText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const normalizedExemptClasses = classesIsentas.map(normalizeText);

export async function validateGroupconfigBusinessRules(
  repository: any,
  data: {
    group_id?: number | null;
    room_id?: number | null;
    period_id?: number | null;
    year_id?: number | null;
    class_id?: number | null;
    course_id?: number | null;
  },
  excludeId?: number,
  tx?: any
) {
  const fieldErrors: Record<string, string[]> = {};
  const messages: string[] = [];

  if (data.class_id) {
    const classRecord = tx
      ? await tx.class.findUnique({ where: { id: Number(data.class_id) } })
      : await repository.findFirst({ where: { id: Number(data.class_id) } }, "class");

    if (classRecord?.name) {
      const normalizedClassName = normalizeText(classRecord.name);
      const isExempt = normalizedExemptClasses.some((exempt) =>
        normalizedClassName.startsWith(exempt)
      );

      if (!isExempt && (!data.course_id || Number(data.course_id) <= 0)) {
        fieldErrors.course_id = ["O curso é obrigatório para esta classe."];
        messages.push("Verifique os campos do formulário");
      }
    }
  }

  if (data.period_id && data.year_id && (data.group_id || data.room_id)) {
    const periodId = Number(data.period_id);
    const yearId = Number(data.year_id);

    const include = {
      group: true,
      room: true,
      course: true,
      class: true,
    };

    const baseWhere = {
      year_id: yearId,
      period_id: periodId,
      ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
    };

    const findConflict = async (extraWhere: Record<string, number>) => {
      const queryArgs = { where: { ...baseWhere, ...extraWhere }, include };
      return tx
        ? await tx.groupconfig.findFirst(queryArgs)
        : await repository.findFirst(queryArgs, "groupconfig");
    };

    const describe = (config: any) =>
      `(Configuração existente: ${config.name}, Classe: ${
        config.class?.name || "N/A"
      }, Curso: ${config.course?.name || "N/A"})`;

    if (data.group_id) {
      const groupConflict = await findConflict({ group_id: Number(data.group_id) });
      if (groupConflict) {
        fieldErrors.group_id = ["A turma já se encontra ocupada neste horário."];
        messages.push(
          `A turma (${groupConflict.group?.name || "já seleccionada"}) já está associada a outro espaço/turma neste período e ano letivo ${describe(groupConflict)}.`
        );
      }
    }

    if (data.room_id) {
      const roomConflict = await findConflict({ room_id: Number(data.room_id) });
      if (roomConflict) {
        fieldErrors.room_id = ["A sala já se encontra ocupada neste horário."];
        messages.push(
          `A sala (${roomConflict.room?.name || "já seleccionada"}) já está associada a outro espaço/turma neste período e ano letivo ${describe(roomConflict)}.`
        );
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw {
      statusCode: 422,
      message: messages[0] || "Verifique os campos do formulário",
      fieldErrors,
    };
  }
}