import { prisma } from "../lib/prisma.js";
import { BaseRepository } from "./base/base.repository.js";
import { validateGroupconfigBusinessRules } from "../utils/groupconfig-validation.js";

class GroupconfigRepository extends BaseRepository {
  constructor() {
    super("groupconfig");
  }

  private async createRows(items: any[]) {
    return await prisma.$transaction(async (tx) => {
      const created = [];
      const fieldErrors: Record<string, string[]> = {};
      let firstMessage = "";

      const addError = (rowIndex: number, field: string, message: string) => {
        const key = `rows.${rowIndex}.${field}`;
        if (!fieldErrors[key]) {
          fieldErrors[key] = [message];
        }
      };

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        let rowHasError = false;

        for (let j = 0; j < i; j++) {
          const previous = items[j];
          const sameSlot =
            Number(previous.year_id) === Number(item.year_id) &&
            Number(previous.period_id) === Number(item.period_id);

          if (!sameSlot) continue;

          if (item.group_id && Number(previous.group_id) === Number(item.group_id)) {
            addError(i, "group_id", `A turma já se encontra ocupada neste horário (conflito com a linha #${j + 1}).`);
            rowHasError = true;
            if (!firstMessage) {
              firstMessage = `Linha #${i + 1}: a turma já está associada à linha #${j + 1} neste período e ano letivo.`;
            }
          }

          if (item.room_id && Number(previous.room_id) === Number(item.room_id)) {
            addError(i, "room_id", `A sala já se encontra ocupada neste horário (conflito com a linha #${j + 1}).`);
            rowHasError = true;
            if (!firstMessage) {
              firstMessage = `Linha #${i + 1}: a sala já está associada à linha #${j + 1} neste período e ano letivo.`;
            }
          }
        }

        try {
          await validateGroupconfigBusinessRules(this, item, undefined, tx);
        } catch (err: any) {
          if (!err?.statusCode && !err?.fieldErrors) {
            throw err;
          }

          rowHasError = true;

          if (!firstMessage) {
            firstMessage = `Linha #${i + 1}: ${err?.message || "erro de validação."}`;
          }

          if (err?.fieldErrors) {
            for (const [key, value] of Object.entries(err.fieldErrors)) {
              const cleanKey = key.replace(/^rows\.\d+\./, "").replace(/^\d+\./, "");
              if (Array.isArray(value) && value.length > 0) {
                addError(i, cleanKey, String(value[0]));
              }
            }
          } else {
            addError(i, "name", err?.message || `Erro na linha #${i + 1}.`);
          }
        }

        if (!rowHasError) {
          const record = await tx.groupconfig.create({ data: item });
          created.push(record);
        }
      }

      if (Object.keys(fieldErrors).length > 0) {
        throw {
          statusCode: 422,
          message: firstMessage || "Verifique os campos do formulário",
          fieldErrors,
        };
      }

      return created;
    });
  }

  async create(args: any, model?: string, tx?: any) {
    const data = args?.data;

    if (Array.isArray(data)) {
      return await this.createRows(data);
    }

    if (data) {
      await validateGroupconfigBusinessRules(this, data, undefined, tx);
    }
    return await super.create(args, model, tx);
  }

  async update(args: any, model?: string, tx?: any) {
    const data = args?.data;
    const recordId = args?.where?.id;

    if (data && recordId) {
      const current = await this.findFirst({ where: { id: recordId } }, model, tx);
      if (current) {
        if (
          data.total_slots !== undefined &&
          data.total_slots !== null &&
          Number(data.total_slots) < Number(current.total_enrolled ?? 0)
        ) {
          throw {
            statusCode: 422,
            message: `O total de vagas (${data.total_slots}) não pode ser inferior aos matriculados (${current.total_enrolled}).`,
            fieldErrors: { total_slots: ["Menor que o total de alunos matriculados."] },
          };
        }

        await validateGroupconfigBusinessRules(
          this,
          {
            group_id: data.group_id ?? current.group_id,
            room_id: data.room_id ?? current.room_id,
            period_id: data.period_id ?? current.period_id,
            year_id: data.year_id ?? current.year_id,
            class_id: data.class_id ?? current.class_id,
            course_id: data.course_id ?? current.course_id,
          },
          recordId,
          tx
        );
      }
    }

    return await super.update(args, model, tx);
  }
}

export const groupconfigRepository = new GroupconfigRepository();