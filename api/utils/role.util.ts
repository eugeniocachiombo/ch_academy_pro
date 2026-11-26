import { prisma } from '../lib/prisma.js';
import type { CrudContext } from '../services/base.service.js';

export const DIRECTOR_ROLE_NAMES = [
  'director',
  'diretor',
  'Director',
  'Diretor',
  'DIRECTOR',
  'DIRETOR',
] as const;

export async function hasRole(
  userId: string | number | undefined | null,
  roleNames: readonly string[],
  schoolId?: string | number | null
): Promise<boolean> {
  if (userId === undefined || userId === null || userId === '') {
    return false;
  }

  const parsedUserId = Number(userId);
  if (Number.isNaN(parsedUserId)) {
    return false;
  }

  const parsedSchoolId =
    schoolId !== undefined && schoolId !== null && schoolId !== ''
      ? Number(schoolId)
      : undefined;

  const schoolFilter =
    parsedSchoolId !== undefined && !Number.isNaN(parsedSchoolId)
      ? { OR: [{ school_id: parsedSchoolId }, { school_id: null }] }
      : {};

  const match = await prisma.userRole.findFirst({
    where: {
      user_id: parsedUserId,
      ...schoolFilter,
      role: {
        name: {
          in: [...roleNames],
        },
      },
    },
    select: { id: true },
  });

  return Boolean(match);
}

export async function isDirector(
  ctxOrUserId: Pick<CrudContext, 'userId' | 'schoolId'> | string | number | undefined | null,
  schoolId?: string | number | null
): Promise<boolean> {
  if (typeof ctxOrUserId === 'object' && ctxOrUserId !== null) {
    return hasRole(ctxOrUserId.userId, DIRECTOR_ROLE_NAMES, ctxOrUserId.schoolId);
  }

  return hasRole(ctxOrUserId, DIRECTOR_ROLE_NAMES, schoolId);
}