import { Router, Request, Response } from "express";
import { errorReport } from "../utils/error-handler.js";
import { prisma } from '../lib/prisma';
import { seedAdmin } from '../prisma/seeders/admin.seed';
import { seedAcademic } from '../prisma/seeders/academic.seed';


const seedRoutes = Router();

seedRoutes.get("/seed/execute", async (req: Request, res: Response) => {
    try {
        console.log('Iniciando execução dos seeders...');
        await prisma.$transaction(
            async (tx) => {
                await seedAdmin(tx);
                await seedAcademic(tx);
            },
            { maxWait: 10000, timeout: 120000 }
        );
        console.log('Seeders executados com sucesso!');
        return res.status(200).json('sucesso seed');
    } catch (error) {
        console.error('Erro na execução dos seeders:', error);
        return errorReport(res, error);
    }
});
export { seedRoutes };