export function parseBirthday(birthday: unknown): Date | string | unknown {
    if (!birthday) return birthday;
    if (birthday instanceof Date) return birthday;
  
    if (typeof birthday === "string") {
      const trimmed = birthday.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return new Date(`${trimmed}T00:00:00.000Z`);
      }
      const parsed = new Date(trimmed);
      return Number.isNaN(parsed.getTime()) ? birthday : parsed;
    }
  
    return birthday;
  }
  
  export function normalizeEmployeePerson(person: any, isCreate = false) {
    if (!person) return person;
  
    const normalized = { ...person };
  
    if (isCreate) {
      normalized.nif = normalized.nif || normalized.bi_number;
    } else if (normalized.bi_number && !normalized.nif) {
      normalized.nif = normalized.bi_number;
    }
  
    if (normalized.birthday !== undefined) {
      normalized.birthday = parseBirthday(normalized.birthday);
    }
  
    return normalized;
  }
  
  export function normalizeEmployeePositions(
    positionId?: number | null,
    positionIds?: number[]
  ) {
    const uniqueIds = Array.from(
      new Set([
        ...(positionId ? [Number(positionId)] : []),
        ...(Array.isArray(positionIds) ? positionIds.map(Number).filter(Boolean) : []),
      ])
    );
  
    const primaryPositionId =
      positionId && uniqueIds.includes(Number(positionId))
        ? Number(positionId)
        : uniqueIds[0] ?? null;
  
    return { uniqueIds, primaryPositionId };
  }