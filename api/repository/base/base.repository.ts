import { prisma } from "../../lib/prisma.js";

export class BaseRepository {
    constructor(protected model: string) {}

    private delegate(model?: string) {
        const activeModel = model || this.model;
        return (prisma as any)[activeModel];
    }

    async create(args: any, model?: string) {
        return await this.delegate(model).create(args);
    }

    async findMany(args: any, model?: string) {
        return await this.delegate(model).findMany(args);
    }

    async findFirst(args: any, model?: string) {
        return await this.delegate(model).findFirst(args);
    }

    async update(args: any, model?: string) {
        return await this.delegate(model).update(args);
    }

    async delete(args: any, model?: string) {
        return await this.delegate(model).delete(args);
    }

    async count(args: any, model?: string) {
        return await this.delegate(model).count(args);
    }
}