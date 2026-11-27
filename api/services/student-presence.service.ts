import { ZodSchema } from "zod";
import { BaseService, type CrudContext, type ListOptions, type PrismaModel } from "./base.service.js";
import { studentPresenceRepository } from "../repository/student-presence.repository.js";
import {
    createStudentPresenceSchema,
    updateStudentPresenceSchema,
} from "../validators/student-presence.schema.js";
import { isDirector } from "../utils/role.util.js";
import {
    buildTenantSchoolWhere,
    getLessonDayBounds,
    normalizeLessonDate,
} from "../utils/student-presence.util.js";
import { CrudError } from "../repository/base/crud.errors.js";

class StudentPresenceService extends BaseService {
    constructor() {
        super(
            studentPresenceRepository,
            "studentPresence",
            {
                create: createStudentPresenceSchema,
                update: updateStudentPresenceSchema,
            },
            {
                tenant: "mixed",
                include: {
                    groupconfig: {
                        include: {
                            group: true,
                            course: true,
                            class: true,
                            period: true,
                            room: true,
                            year: true,
                        },
                    },
                    teacher: {
                        include: {
                            user: true,
                        },
                    },
                    subject: true,
                    schedule: true,
                    author: true,
                    student_presence_lists: {
                        include: {
                            student: {
                                include: {
                                    user: true,
                                },
                            },
                        },
                    },
                },
            }
        );
    }

    protected override async beforeCreate(data: any, ctx: CrudContext): Promise<any> {
        const payload = { ...(data ?? {}) };

        if (ctx.userId !== undefined && ctx.userId !== null && payload.created_by === undefined) {
            payload.created_by = Number(ctx.userId);
        }

        if (payload.date !== undefined) {
            payload.date = normalizeLessonDate(payload.date);
        }

        return payload;
    }

    protected override async beforeUpdate(data: any, _ctx: CrudContext): Promise<any> {
        const payload = { ...(data ?? {}) };

        if (payload.date !== undefined && payload.date !== null) {
            payload.date = normalizeLessonDate(payload.date);
        }

        return payload;
    }

    public override async create(
        ctx: CrudContext,
        data: unknown,
        model?: PrismaModel,
        customSchema?: ZodSchema
    ) {
        const m = this.getModel(model);
        const schema = customSchema || this.schemas?.create;
        let validated: any = schema ? await schema.parseAsync(data) : data;
        validated = await this.beforeCreate(validated, ctx);

        const preparedData: any = this.prepareData(m, ctx, validated, true);
        const { start, end } = getLessonDayBounds(preparedData.date);
        preparedData.date = start;

        const tenantWhere = buildTenantSchoolWhere(preparedData.school_id);

        const duplicate = await this.repository.findFirst(
            {
                where: {
                    ...tenantWhere,
                    teacher_id: Number(preparedData.teacher_id),
                    groupconfig_id: Number(preparedData.groupconfig_id),
                    subject_id: Number(preparedData.subject_id),
                    ...(preparedData.schedule_id != null
                        ? { schedule_id: Number(preparedData.schedule_id) }
                        : {}),
                    date: {
                        gte: start,
                        lt: end,
                    },
                },
                select: { id: true },
            },
            m
        );

        if (duplicate) {
            throw new CrudError(
                "CONFLICT",
                "Já existe uma chamada registada para este professor, turma, disciplina e data."
            );
        }

        try {
            return await this.repository.create({ data: preparedData }, m);
        } catch (err: any) {
            if (err?.code === "P2002") {
                throw new CrudError(
                    "CONFLICT",
                    "Já existe uma chamada registada para este professor, turma, disciplina e data."
                );
            }
            throw err;
        }
    }

    public override async list(
        ctx: CrudContext,
        options: ListOptions = {},
        model?: PrismaModel
    ) {
        let roleWhere: object | undefined;

        if (ctx?.isSuperAdmin) {
            roleWhere = undefined;
        } else if (await isDirector(ctx)) {
            roleWhere = undefined;
        } else {
            if (!ctx?.userId) {
                return [];
            }
            roleWhere = { created_by: Number(ctx.userId) };
        }

        const where =
            options.where && roleWhere
                ? { AND: [options.where, roleWhere] }
                : (roleWhere ?? options.where);

        return super.list(
            ctx,
            {
                ...options,
                where,
            },
            model
        );
    }
}

export default new StudentPresenceService();