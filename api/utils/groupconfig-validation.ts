const classesIsentas = [
    "pré-iniciação",
    "iniciação",
    "1ª classe",
    "2ª classe",
    "3ª classe",
    "4ª classe",
    "5ª classe",
    "6ª classe",
    "7ª classe",
    "8ª classe",
    "9ª classe"
];

export async function validateGroupconfigBusinessRules(
    repository: any,
    data: {
        group_id?: number;
        room_id?: number;
        period_id?: number;
        year_id?: number;
        class_id?: number;
        course_id?: number | null;
    },
    excludeId?: number
) {
    if (data.class_id) {
        const classRecord = await repository.delegate("class").findUnique({
            where: { id: data.class_id }
        });

        if (classRecord && classRecord.name) {
            const normalizedClassName = classRecord.name.trim().toLowerCase();
            const isExempt = classesIsentas.some(c => normalizedClassName.includes(c));

            if (!isExempt && (!data.course_id || data.course_id <= 0)) {
                throw {
                    statusCode: 422,
                    message: "Verifique os campos do formulário",
                    fieldErrors: {
                        course_id: ["O curso é obrigatório para esta classe."]
                    }
                };
            }
        }
    }

    if (data.group_id && data.room_id && data.period_id && data.year_id) {
        const conflictingConfig = await repository.findFirst({
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
}