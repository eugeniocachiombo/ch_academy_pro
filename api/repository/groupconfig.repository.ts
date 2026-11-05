import { BaseRepository } from "./base/base.repository.js";

class GroupconfigRepository extends BaseRepository {
    constructor() {
        super("groupconfig");
    }

    private async checkConflict(data: {
        group_id: number;
        room_id: number;
        period_id: number;
        year_id: number;
    }, excludeId?: number) {
        const conflictingConfig = await this.findFirst({
            where: {
                year_id: data.year_id,
                period_id: data.period_id,
                OR: [
                    { group_id: data.group_id },
                    { room_id: data.room_id }
                ],
                ...(excludeId ? { id: { not: excludeId } } : {})
            },
            include: {
                group: true,
                room: true,
                course: true,
                class: true
            }
        });

        if (conflictingConfig) {
            const isGroupConflict = conflictingConfig.group_id === data.group_id;
            const conflictType = isGroupConflict ? "A turma" : "A sala";
            const conflictValue = isGroupConflict ? conflictingConfig.group?.name : conflictingConfig.room?.name;
            
            const details = `(Configuração existente: ${conflictingConfig.name}, Classe: ${conflictingConfig.class?.name || 'N/A'}, Curso: ${conflictingConfig.course?.name || 'N/A'})`;

            throw {
                statusCode: 400,
                message: `${conflictType} (${conflictValue || 'já seleccionada'}) já está associada a outro espaço/turma neste período e ano letivo ${details}.`,
                fieldErrors: {
                    [isGroupConflict ? "group_id" : "room_id"]: [
                        `${conflictType} já se encontra ocupada neste horário.`
                    ]
                }
            };
        }
    }

    async create(args: any, model?: string) {
        const data = args?.data;
        if (data && data.group_id && data.room_id && data.period_id && data.year_id) {
            await this.checkConflict({
                group_id: data.group_id,
                room_id: data.room_id,
                period_id: data.period_id,
                year_id: data.year_id
            });
        }
        return await super.create(args, model);
    }

    async update(args: any, model?: string) {
        const data = args?.data;
        const recordId = args?.where?.id;

        if (data && recordId) {
            const current = await this.findFirst({ where: { id: recordId } });
            if (current) {
                const checkData = {
                    group_id: data.group_id !== undefined ? data.group_id : current.group_id,
                    room_id: data.room_id !== undefined ? data.room_id : current.room_id,
                    period_id: data.period_id !== undefined ? data.period_id : current.period_id,
                    year_id: data.year_id !== undefined ? data.year_id : current.year_id,
                };

                await this.checkConflict(checkData, recordId);
            }
        }
        return await super.update(args, model);
    }
}

export const groupconfigRepository = new GroupconfigRepository();