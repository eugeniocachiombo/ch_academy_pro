import { prisma } from '../lib/prisma.js';
import { formatProcessNum } from './formaters.js';

export const nextProcessNum = async (tx?: any): Promise<string> => {
    const client = tx || prisma;
    const currentYear = String(new Date().getFullYear());

    const last = await client.student.findFirst({
        where: {
            processnum: {
                startsWith: currentYear
            }
        },
        orderBy: { processnum: 'desc' },
        select: { processnum: true }
    });

    if (!last || !last.processnum) {
        return formatProcessNum(1, currentYear);
    }

    const currentSeq = parseInt(last.processnum.slice(currentYear.length), 10);
    const nextSeq = isNaN(currentSeq) ? 1 : currentSeq + 1;

    return formatProcessNum(nextSeq, currentYear);
};

export const nextTeacherCodeNum = async (tx?: any): Promise<string> => {
    const client = tx || prisma;
    const currentYear = new Date().getFullYear();
    const shortYear = currentYear % 100;
    const prefix = `pr${shortYear}`;

    const last = await client.teacher.findFirst({
        where: {
            codenumber: {
                startsWith: prefix
            }
        },
        orderBy: {
            codenumber: "desc"
        },
        select: {
            codenumber: true
        }
    });

    if (!last || !last.codenumber) {
        return `${prefix}0001`;
    }

    const currentSeq = parseInt(last.codenumber.slice(prefix.length), 10);
    const nextSeq = isNaN(currentSeq) ? 1 : currentSeq + 1;

    return `${prefix}${String(nextSeq).padStart(4, '0')}`;
};

export const nextRegisterProcessNum = async (tx?: any): Promise<number> => {
    const client = tx || prisma;
    const currentYear = new Date().getFullYear();
    const shortYear = currentYear % 100;
    const yearPrefix = shortYear * 10000;

    const last = await client.register.findFirst({
        where: {
            registnum: {
                gte: yearPrefix,
                lt: yearPrefix + 10000
            }
        },
        orderBy: {
            registnum: "desc"
        },
        select: {
            registnum: true
        }
    });

    if (!last || !last.registnum) {
        return yearPrefix + 1;
    }

    return last.registnum + 1;
};