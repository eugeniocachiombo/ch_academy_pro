export function normalizeLessonDate(input?: string | Date | null): Date {
  if (!input) {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      return new Date(Date.UTC(year, month - 1, day));
    }
  }

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  return new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
}

export function getLessonDayBounds(input?: string | Date | null): { start: Date; end: Date } {
  const start = normalizeLessonDate(input);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export function buildTenantSchoolWhere(schoolId: unknown): { school_id: unknown | null } {
  return schoolId !== undefined && schoolId !== null
    ? { school_id: schoolId }
    : { school_id: null };
}