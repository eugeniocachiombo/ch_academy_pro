import { prisma } from '../lib/prisma.js';
import { formatProcessNum } from './formaters.js';

export const nextProcessNum = async (tx?: any): Promise<string> => {
    const client = tx || prisma;
    const last = await client.student.findFirst({
        orderBy: { id: 'desc' },
        select: { processnum: true }
    });
    const lastNumber = Number(last?.processnum) || 0;
    return formatProcessNum(lastNumber + 1);
};