import { prisma } from "../../lib/prisma.js";

/**
 * ctx (Context): Representa o contexto da requisição atual (contém dados como schoolId, isSuperAdmin, etc).
 * tx (Transaction): Representa a instância de transação ativa do Prisma para garantir atomicidade e rollback.
 */
export class BaseRepository {
    constructor(protected model: string) {}

    private delegate(model?: string, tx?: any) {
        const activeModel = model || this.model;
        const client = tx || prisma;
        return client[activeModel];
    }

    async create(args: any, model?: string, tx?: any) {
        return await this.delegate(model, tx).create(args);
    }

    async findMany(args: any, model?: string, tx?: any) {
        const queryArgs = args || {};
        if (!queryArgs.orderBy) {
            queryArgs.orderBy = { id: 'desc' };
        }
        return await this.delegate(model, tx).findMany(queryArgs);
    }

    async findFirst(args: any, model?: string, tx?: any) {
        return await this.delegate(model, tx).findFirst(args);
    }

    async update(args: any, model?: string, tx?: any) {
        return await this.delegate(model, tx).update(args);
    }

    async delete(args: any, model?: string, tx?: any) {
        return await this.delegate(model, tx).delete(args);
    }

    async count(args: any, model?: string, tx?: any) {
        return await this.delegate(model, tx).count(args);
    }
}