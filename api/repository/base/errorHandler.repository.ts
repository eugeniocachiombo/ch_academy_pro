import { Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "../../generated/prisma/client";

export function errorReport(res: Response, error: unknown) {
    
    if (error instanceof ZodError) {
        return res.status(400).json({
            message: "Verifique os campos do formulário",
            errors: error.flatten().fieldErrors
        });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002": {
                const target = error.meta?.target;
                const field = Array.isArray(target) ? target.join(", ") : target;
                const model = error.meta?.modelName || "Registo";
                
                return res.status(409).json({
                    message: field 
                        ? `Já existe um(a) ${model} com este(a) ${field}.`
                        : "Já existe um registo com estes dados."
                });
            }
            case "P2025": {
                return res.status(404).json({
                    message: "Registo não encontrado no sistema"
                });
            }
            case "P2003": {
                return res.status(400).json({
                    message: "Falha na relação entre dados (Chave estrangeira inválida)."
                });
            }
            default:
                return res.status(400).json({
                    message: "Erro na operação de base de dados",
                    code: error.code
                });
        }
    }

    if (error instanceof Error && error.message === "NOT_FOUND") {
        return res.status(404).json({ message: "Registo não encontrado" });
    }

    return res.status(500).json({ message: "Erro interno do servidor" });
}