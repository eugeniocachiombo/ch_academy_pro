import { prisma } from '../lib/prisma';
import { seedAdmin } from './seeders/admin.seed';
import { seedAcademic } from './seeders/academic.seed';
import { seedProvinceMunicipality } from './seeders/province.seed';
import { seedPositions } from './seeders/position.seed';

async function main() {
    await prisma.$transaction(
        async (tx) => {
            await seedAdmin(tx);
            await seedAcademic(tx);
            await seedProvinceMunicipality(tx);
            await seedPositions(tx);
        },
        { maxWait: 10000, timeout: 120000 }
    );
}

main()
    .catch((e) => {
        console.error("Erro durante o seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });