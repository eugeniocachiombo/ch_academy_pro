import { ZodSchema } from 'zod';
import { prisma } from '../lib/prisma.js';
import cryptoService from './crypto.service.js';
import { CrudError } from '../repository/base/crud.errors.js';

export type PrismaModel = {
  [K in keyof typeof prisma]: K extends `$${string}` | symbol ? never : K;
}[keyof typeof prisma];

export interface CrudSchemas {
  create?: ZodSchema;
  update?: ZodSchema;
}

export type TenantMode = 'scoped' | 'global' | 'mixed';

export interface CrudOptions {
  tenant?: TenantMode;
  modes?: Partial<Record<PrismaModel, TenantMode>>;
  include?: object;
  omit?: Record<string, true>;
}

export interface CrudContext {
  schoolId?: string | number;
  isSuperAdmin?: boolean;
}

export interface ListOptions {
  where?: object;
  orderBy?: object | object[];
  include?: object;
  select?: object;
}

export interface PaginateOptions extends ListOptions {
  page?: number;
  limit?: number;
}

export interface Paginated<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export class BaseService {
  constructor(
    protected repository: any,
    protected defaultModel?: PrismaModel,
    protected schemas?: CrudSchemas,
    protected options: CrudOptions = {}
  ) {}

  private getModel(model?: PrismaModel): PrismaModel {
    const activeModel = model || this.defaultModel;
    if (!activeModel) throw new CrudError('INVALID_MODEL', 'Nenhum modelo Prisma foi especificado.');
    return activeModel;
  }

  private parseId(id: string | number): string | number {
    const rawId = typeof id === 'string' && id.length > 20 ? cryptoService.decryptId(id) : id;
    return typeof rawId === 'number' ? rawId : (/^\d+$/.test(String(rawId)) ? Number(rawId) : rawId);
  }

  private mode(m: PrismaModel): TenantMode {
    const specific = this.options.modes?.[m];
    if (specific) return specific;
    if (m === this.defaultModel) return this.options.tenant ?? 'scoped';
    return 'scoped';
  }

  private requireSchool(ctx: CrudContext): string | number {
    if (ctx.schoolId === undefined || ctx.schoolId === null) throw new CrudError('SCHOOL_REQUIRED');
    return ctx.schoolId;
  }

  private readScope(m: PrismaModel, ctx: CrudContext, where: object = {}) {
    if (ctx.isSuperAdmin) return where;
    const mode = this.mode(m);
    if (mode === 'global') return where;
    const schoolId = this.requireSchool(ctx);
    if (mode === 'scoped') return { AND: [where, { school_id: schoolId }] };
    return { AND: [where, { OR: [{ school_id: schoolId }, { school_id: null }] }] };
  }

  protected writeScope(m: PrismaModel, ctx: CrudContext, where: object = {}) {
    if (ctx.isSuperAdmin) return where;
    if (this.mode(m) === 'global') throw new CrudError('FORBIDDEN');
    return { AND: [where, { school_id: this.requireSchool(ctx) }] };
  }

  private prepareData(m: PrismaModel, ctx: CrudContext, data: any, isCreate: boolean) {
    const mode = this.mode(m);
    if (mode === 'global') {
      if (!ctx.isSuperAdmin) throw new CrudError('FORBIDDEN');
      return data;
    }
    const { school_id: fromClient, ...rest } = data ?? {};
    if (!isCreate) return rest;
    if (ctx.isSuperAdmin) {
      const target = fromClient !== undefined ? fromClient : (ctx.schoolId ?? null);
      if (mode === 'scoped' && target === null) throw new CrudError('SCHOOL_REQUIRED');
      return { ...rest, school_id: target };
    }
    return { ...rest, school_id: this.requireSchool(ctx) };
  }

  protected async beforeCreate(data: unknown, _ctx: CrudContext): Promise<unknown> {
    return data;
  }

  protected async beforeUpdate(data: unknown, _ctx: CrudContext): Promise<unknown> {
    return data;
  }

  async create(ctx: CrudContext, data: unknown, model?: PrismaModel, customSchema?: ZodSchema) {
    const m = this.getModel(model);
    const schema = customSchema || this.schemas?.create;
    let validated = schema ? await schema.parseAsync(data) : data;
    validated = await this.beforeCreate(validated, ctx);
    const preparedData = this.prepareData(m, ctx, validated, true);
    return await this.repository.create({ data: preparedData }, m);
  }

  async list(ctx: CrudContext, options: ListOptions = {}, model?: PrismaModel) {
    const m = this.getModel(model);
    const { where, orderBy, include, select } = options;
    const defaultInclude = this.defaultModel === m ? this.options.include : undefined;

    return await this.repository.findMany({
      where: this.readScope(m, ctx, where),
      ...(orderBy && { orderBy }),
      ...((include || defaultInclude) && { include: { ...defaultInclude, ...include } }),
      ...(select && { select }),
    }, m);
  }

  async find(ctx: CrudContext, id: string | number, options: Pick<ListOptions, 'include' | 'select'> = {}, model?: PrismaModel) {
    const m = this.getModel(model);
    const parsedId = this.parseId(id);
    const item = await this.repository.findFirst({
      where: this.readScope(m, ctx, { id: parsedId }),
      ...(options.include && { include: options.include }),
      ...(options.select && { select: options.select }),
    }, m);
    if (!item) throw new CrudError('NOT_FOUND');
    return item;
  }

  async update(ctx: CrudContext, id: string | number, data: unknown, model?: PrismaModel, customSchema?: ZodSchema) {
    const m = this.getModel(model);
    const parsedId = this.parseId(id);

    const found = await this.repository.findFirst({
      where: this.writeScope(m, ctx, { id: parsedId }),
      select: { id: true },
    }, m);
    if (!found) throw new CrudError('NOT_FOUND');

    const schema = customSchema || this.schemas?.update;
    let validated = schema ? await schema.parseAsync(data) : data;
    validated = await this.beforeUpdate(validated, ctx);

    const preparedData = this.prepareData(m, ctx, validated, false);
    return await this.repository.update({
      where: { id: parsedId },
      data: preparedData,
    }, m);
  }

  async remove(ctx: CrudContext, id: string | number, model?: PrismaModel) {
    const m = this.getModel(model);
    const parsedId = this.parseId(id);

    const found = await this.repository.findFirst({
      where: this.writeScope(m, ctx, { id: parsedId }),
      select: { id: true },
    }, m);
    if (!found) throw new CrudError('NOT_FOUND');

    return await this.repository.delete({ where: { id: parsedId } }, m);
  }
}