import { Router, Request, Response } from "express";
import { errorReport } from "../utils/error-handler.js";
import { prisma } from '../lib/prisma';
import { seedAdmin } from '../prisma/seeders/admin.seed';
import { seedAcademic } from '../prisma/seeders/academic.seed';


const seedRoutes = Router();

async function main() {
    await prisma.$transaction(
        async (tx) => {
            await seedAdmin(tx);
            await seedAcademic(tx);
        },
        { maxWait: 10000, timeout: 120000 }
    );
}

seedRoutes.get("/seed/execute", async (req: Request, res: Response) => {
    try {
        main()
            .catch((e) => {
                console.error("Erro durante o seed:", e);
                process.exit(1);
            })
            .finally(async () => {
                await prisma.$disconnect();
            });
        return res.status(200).json('sucesso seed');
    } catch (error) {
        return errorReport(res, error);
    }
});

export { seedRoutes };