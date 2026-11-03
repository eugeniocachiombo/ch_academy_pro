import { Response } from "express";
import { ZodError } from "zod";
import { CrudError } from "../repository/base/crud.errors.js";

export function errorReport(res: Response, error: unknown) {
    if (error instanceof ZodError) {
        return res.status(422).json({
            message: "Verifique os campos do formulário",
            errors: error.flatten().fieldErrors
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

    // Tratamento de erros do Prisma via código de erro (sem importar instâncias pesadas)
    if (typeof error === 'object' && error !== null && 'code' in error) {
        const prismaError = error as { code: string; meta?: any };
        switch (prismaError.code) {
            case "P2002": {
                const target = prismaError.meta?.target;
                const field = Array.isArray(target) ? target.join(", ") : target;
                const model = prismaError.meta?.modelName || "Registo";
                return res.status(409).json({
                    message: field 
                        ? `Já existe um(a) ${model} com este(a) ${field}.`
                        : "Já existe um registo com estes dados."
                });
            }
            case "P2025":
                return res.status(404).json({ message: "Registo não encontrado no sistema" });
            case "P2003":
                return res.status(400).json({ message: "Falha na relação entre dados (Chave estrangeira inválida)." });
            default:
                return res.status(400).json({ message: "Erro na operação de base de dados", code: prismaError.code });
        }
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