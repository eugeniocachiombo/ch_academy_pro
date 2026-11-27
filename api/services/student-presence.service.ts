import { BaseService, type CrudContext, type ListOptions, type PrismaModel } from "./base.service.js";
import { studentPresenceRepository } from "../repository/student-presence.repository.js";
import {
    createStudentPresenceSchema,
    updateStudentPresenceSchema,
} from "../validators/student-presence.schema.js";
import { isDirector } from "../utils/role.util.js";

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

        return payload;
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