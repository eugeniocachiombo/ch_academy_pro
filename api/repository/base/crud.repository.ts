import { ZodSchema } from 'zod';
import { prisma } from '../../lib/prisma';

export type PrismaModel = {
    [K in keyof typeof prisma]: K extends `$${string}` | symbol ? never : K;
}[keyof typeof prisma];

export interface CrudSchemas {
    create?: ZodSchema;
    update?: ZodSchema;
}

export class Crud {
    constructor(
        protected defaultModel?: PrismaModel,
        protected schemas?: CrudSchemas
    ) {}

    private getModel(model?: PrismaModel): PrismaModel {
        const activeModel = model || this.defaultModel;
        if (!activeModel) {
            throw new Error("Nenhum modelo Prisma foi especificado.");
        }
        return activeModel;
    }

    private parseId(id: string | number): string | number {
        if (typeof id === 'number') return id;
        const isPureNumber = /^\d+$/.test(id);
        return isPureNumber ? Number(id) : id;
    }

    protected async beforeCreate(data: unknown): Promise<unknown> {
        return data;
    }

    protected async beforeUpdate(data: unknown): Promise<unknown> {
        return data;
    }

    async create(data: unknown, model?: PrismaModel, customSchema?: ZodSchema) {
        const schema = customSchema || this.schemas?.create;
        let validatedData = schema ? schema.parseAsync(data) : data;
        validatedData = await this.beforeCreate(validatedData);

        const m = this.getModel(model);
        return (prisma[m] as any).create({ 
            data: validatedData as any 
        });
    }

    async list(model?: PrismaModel) {
        const m = this.getModel(model);
        return (prisma[m] as any).findMany();
    }

    async find(id: string | number, model?: PrismaModel) {
        const m = this.getModel(model);
        const parsedId = this.parseId(id);

        const item = await (prisma[m] as any).findUnique({
            where: { id: parsedId }
        });

        if (!item) {
            throw new Error("NOT_FOUND");
        }

        return item;
    }

    async update(id: string | number, data: unknown, model?: PrismaModel, customSchema?: ZodSchema) {
        await this.find(id, model);

        const schema = customSchema || this.schemas?.update;
        let validatedData = schema ? schema.parseAsync(data) : data;
        validatedData = await this.beforeUpdate(validatedData);

        const m = this.getModel(model);
        const parsedId = this.parseId(id);

        return (prisma[m] as any).update({
            where: { id: parsedId },
            data: validatedData as any
        });
    }

    async delete(id: string | number, model?: PrismaModel) {
        console.log("saida: ", id)
        await this.find(id, model);

        const m = this.getModel(model);
        const parsedId = this.parseId(id);

        return (prisma[m] as any).delete({
            where: { id: parsedId }
        });
    }
}