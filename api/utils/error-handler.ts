import { Response } from "express";
import { ZodError } from "zod";
import { CrudError } from "../repository/base/crud.errors.js";

function extractPrismaError(error: unknown): { code: string; meta?: any } | null {
    const candidates = [error, (error as any)?.message, (error as any)?.cause];
    for (const candidate of candidates) {
        if (candidate && typeof candidate === 'object' && typeof (candidate as any).code === 'string') {
            return candidate as { code: string; meta?: any };
        }
    }
    return null;
}

function extractUniqueFields(meta: any): string[] {
    const target = meta?.target;
    if (Array.isArray(target)) return target.map(String);
    if (typeof target === 'string') return [target];

    const fields = meta?.driverAdapterError?.cause?.constraint?.fields;
    if (Array.isArray(fields)) return fields.map(String);

    const originalMessage: string | undefined = meta?.driverAdapterError?.cause?.originalMessage;
    const match = originalMessage?.match(/"[^"]+_(.+)_key"/);
    return match ? [match[1]] : [];
}

function uniqueConstraintResponse(res: Response, meta: any) {
    const modelName: string | undefined = meta?.modelName;
    const fields = extractUniqueFields(meta);

    if (!fields.length) {
        return res.status(409).json({ message: "Já existe um registo com estes dados." });
    }

    const where = modelName ? ` em ${modelName}` : "";
    const message = `Já existe um registo${where} com este(s) campo(s): ${fields.join(", ")}.`;

    const errors: Record<string, string[]> = {};
    for (const field of fields) {
        errors[field] = [`O valor informado para "${field}" já existe.`];
    }

    return res.status(409).json({ message, errors });
}

export function errorReport(res: Response, error: unknown) {
    if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        for (const issue of error.issues) {
            const key = issue.path.join('.') || '_root';
            (errors[key] ??= []).push(issue.message);
        }
        return res.status(422).json({
            message: "Verifique os campos do formulário",
            errors
        });
    }

    if (error instanceof CrudError) {
        const statusMap: Record<string, number> = {
            NOT_FOUND: 404,
            CHURCH_REQUIRED: 400,
            SCHOOL_REQUIRED: 400,
            FORBIDDEN: 403,
            INVALID_MODEL: 400,
        };
        return res.status(statusMap[error.code] || 400).json({ message: error.message });
    }

    const prismaError = extractPrismaError(error);
    if (prismaError) {
        switch (prismaError.code) {
            case "P2002":
                return uniqueConstraintResponse(res, prismaError.meta);
            case "P2025":
                return res.status(404).json({ message: "Registo não encontrado no sistema" });
            case "P2003":
                return res.status(400).json({ message: "Falha na relação entre dados (Chave estrangeira inválida)." });
            default:
                return res.status(400).json({ message: "Erro na operação de base de dados", code: prismaError.code });
        }
    }

    if (typeof error === 'object' && error !== null && 'statusCode' in error && 'message' in error) {
        const customError = error as { statusCode: number; message: unknown; fieldErrors?: any };
        return res.status(customError.statusCode || 400).json({
            message: typeof customError.message === 'string' ? customError.message : "Ocorreu um erro na requisição.",
            errors: customError.fieldErrors || undefined
        });
    }

    if (error instanceof Error) {
        if (error.message === "NOT_FOUND") {
            return res.status(404).json({ message: "Registo não encontrado" });
        }
        if (error.message === "INVALID_CREDENTIALS") {
            return res.status(401).json({ message: "Nome de utilizador ou palavra-passe incorretos." });
        }
        if (error.message === "USER_BLOCKED") {
            return res.status(403).json({ message: "Este utilizador está bloqueado." });
        }

        return res.status(400).json({ message: error.message || "Ocorreu um erro na requisição." });
    }

    return res.status(500).json({ message: "Erro interno do servidor" });
}