import type { ZodSchema } from 'zod';
import { BaseService, type CrudContext, type PrismaModel } from './base.service.js';
import { groupconfigRepository } from '../repository/groupconfig.repository.js';
import {
    createGroupconfigSchema,
    createGroupconfigBatchSchema,
    updateGroupconfigSchema
} from '../validators/groupconfig.schema.js';

class GroupconfigService extends BaseService {
    constructor() {
        super(
            groupconfigRepository,
            "groupconfig",
            {
                create: createGroupconfigSchema,
                update: updateGroupconfigSchema
            },
            {
                tenant: 'mixed',
                include: {
                    room: true,
                    class: true,
                    group: true,
                    period: true,
                    course: true,
                    year: true,
                    school: true
                }
            }
        );
    }

    protected async beforeCreate(data: unknown, _ctx: CrudContext): Promise<unknown> {
        return { ...(data as Record<string, unknown>), total_enrolled: 0 };
    }

    async create(ctx: CrudContext, data: unknown, model?: PrismaModel, customSchema?: ZodSchema) {
        if (!Array.isArray(data)) {
            return await super.create(ctx, data, model, customSchema);
        }

        const m = this.getModel(model);
        const parsed = createGroupconfigBatchSchema.safeParse(data);

        if (!parsed.success) {
            const fieldErrors: Record<string, string[]> = {};
            for (const issue of parsed.error.issues) {
                const key = issue.path.length > 0 ? `rows.${issue.path.join('.')}` : 'rows.0.name';
                (fieldErrors[key] ||= []).push(issue.message);
            }
            throw {
                statusCode: 422,
                message: 'Verifique os campos do formulário',
                fieldErrors
            };
        }

        const items: unknown[] = [];
        for (const item of parsed.data) {
            const withDefaults = await this.beforeCreate(item, ctx);
            items.push(this.prepareData(m, ctx, withDefaults, true));
        }

        return await this.repository.create({ data: items }, m);
    }
}

export default new GroupconfigService();