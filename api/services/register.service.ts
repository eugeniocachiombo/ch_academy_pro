import { BaseService, CrudContext, type PrismaModel } from './base.service.js';
import type { ZodSchema } from 'zod';
import { prisma } from '../lib/prisma.js';
import { registerRepository } from '../repository/register.repository.js';
import { createRegisterSchema, updateRegisterSchema } from '../validators/register.schema.js';
import { nextRegisterProcessNum } from '../utils/process-number.js';

const fullGroupError = () => ({
    statusCode: 422,
    message: 'Esta turma já não tem vagas disponíveis.',
    fieldErrors: { groupconfig_id: ['Esta turma já não tem vagas disponíveis.'] }
});

class RegisterService extends BaseService {
    constructor() {
        super(
            registerRepository,
            "register",
            {
                create: createRegisterSchema,
                update: updateRegisterSchema
            },
            {
                tenant: 'mixed',
                include: {
                    student: {
                        include: {
                            user: {
                                include: {
                                    person: true
                                }
                            }
                        }
                    },
                    school: true,
                    groupconfig: true,
                    year: true
                }
            }
        );
    }

    protected async beforeCreate(data: unknown, _ctx: CrudContext): Promise<unknown> {
        let body = data as any;
        if (body) {
            if (body.registnum === null || body.registnum === undefined || body.registnum === '') {
                body.registnum = await nextRegisterProcessNum();
            } else {
                body.registnum = Number(body.registnum);
            }
        }
        return body;
    }

    async create(ctx: CrudContext, data: unknown, model?: PrismaModel, customSchema?: ZodSchema) {
        const m = this.getModel(model);
        const schema = customSchema || this.schemas?.create;
        let validated = schema ? await schema.parseAsync(data) : data;
        validated = await this.beforeCreate(validated, ctx);
        const prepared = this.prepareData(m, ctx, validated, true) as any;

        const groupconfigId = prepared?.groupconfig_id ? Number(prepared.groupconfig_id) : null;

        if (!groupconfigId) {
            return await this.repository.create({ data: prepared }, m);
        }

        return await prisma.$transaction(async (tx) => {
            const config = await tx.groupconfig.findUnique({ where: { id: groupconfigId } });

            if (!config) {
                throw {
                    statusCode: 422,
                    message: 'Configuração de turma não encontrada.',
                    fieldErrors: { groupconfig_id: ['Configuração de turma não encontrada.'] }
                };
            }

            if (Number(config.total_enrolled) >= Number(config.total_slots)) {
                throw fullGroupError();
            }

            const updated = await tx.groupconfig.updateMany({
                where: { id: groupconfigId, total_enrolled: { lt: config.total_slots } },
                data: { total_enrolled: { increment: 1 } }
            });

            if (updated.count === 0) {
                throw fullGroupError();
            }

            return await this.repository.create({ data: prepared }, m, tx);
        });
    }
}

export default new RegisterService();