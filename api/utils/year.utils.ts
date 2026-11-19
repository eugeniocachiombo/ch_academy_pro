import { prisma } from '../lib/prisma.js'

export interface YearScopeContext {
  id?: number | string | null
  schoolId?: number | string | null
  school_id?: number | null
  tx?: any
  data?: {
    id?: number | string | null
    school_id?: number | null
    isCurrent?: boolean
    [key: string]: any
  }
  [key: string]: any
}

export interface OtherActiveYearsWhere {
  isCurrent: boolean
  id?: { not: number }
  school_id?: number | null
}

const NON_MODEL_FIELDS = ['id', 'schoolId', 'isSuperAdmin', 'createdAt', 'updatedAt']
const DATE_FIELDS = ['startdate', 'enddate']

function normalizeDateField(value: unknown): Date | string | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  const parsed = new Date(String(value))
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed
}

export function sanitizeModelUpdateData(
  data: Record<string, any>,
  extraIgnoredFields: string[] = []
): Record<string, any> {
  const ignored = new Set([...NON_MODEL_FIELDS, ...extraIgnoredFields])
  const clean: Record<string, any> = {}

  for (const [key, value] of Object.entries(data || {})) {
    if (ignored.has(key)) continue
    clean[key] = DATE_FIELDS.includes(key) ? normalizeDateField(value) : value
  }

  return clean
}

export function buildOtherActiveYearsFilter(
  context: YearScopeContext = {},
  excludeId?: number | string | null
): OtherActiveYearsWhere {
  const where: OtherActiveYearsWhere = {
    isCurrent: true,
  }

  const targetExcludeId = excludeId ?? context?.id ?? context?.data?.id
  if (targetExcludeId !== null && targetExcludeId !== undefined && targetExcludeId !== '') {
    where.id = { not: Number(targetExcludeId) }
  }

  const rawSchoolId = context?.schoolId ?? context?.school_id ?? context?.data?.school_id
  if (rawSchoolId !== null && rawSchoolId !== undefined && rawSchoolId !== '') {
    where.school_id = Number(rawSchoolId)
  }

  return where
}

export async function deactivateOtherActiveYears(
  repository: any,
  context: YearScopeContext = {},
  excludeId?: number | string | null
): Promise<void> {
  const yearDelegate =
    context?.tx?.year ||
    prisma?.year ||
    repository?.prisma?.year ||
    repository?.model

  const where = buildOtherActiveYearsFilter(context, excludeId)

  if (typeof yearDelegate?.updateMany === 'function') {
    await yearDelegate.updateMany({
      where,
      data: { isCurrent: false },
    })
  }
}