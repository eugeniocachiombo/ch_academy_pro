export interface NormalizedEmployeePosition {
    id: number;
    name: string;
    is_primary: boolean;
  }
  
  export function extractEmployeePositions(emp: any): NormalizedEmployeePosition[] {
    if (!emp) return [];
  
    const rawList = Array.isArray(emp.employee_positions)
      ? emp.employee_positions
      : Array.isArray(emp.employeePositions)
        ? emp.employeePositions
        : Array.isArray(emp.positions)
          ? emp.positions
          : [];
  
    const map = new Map<number, NormalizedEmployeePosition>();
  
    for (const item of rawList) {
      if (!item) continue;
      if (item.active === false) continue;
  
      const posObj = item.position ?? item;
      const posId = Number(item.position_id ?? posObj?.id);
      const posName = String(posObj?.name ?? '').trim();
  
      if (!posId || !posName) continue;
  
      const isPrimary =
        Boolean(item.is_primary) ||
        (emp.position_id != null && Number(emp.position_id) === posId);
  
      const existing = map.get(posId);
      if (existing) {
        existing.is_primary = existing.is_primary || isPrimary;
      } else {
        map.set(posId, {
          id: posId,
          name: posName,
          is_primary: isPrimary,
        });
      }
    }
  
    const primaryId = Number(emp.position_id ?? emp.position?.id);
    const primaryName = String(emp.position?.name ?? '').trim();
    if (primaryId && primaryName) {
      const existing = map.get(primaryId);
      if (existing) {
        existing.is_primary = true;
      } else {
        map.set(primaryId, {
          id: primaryId,
          name: primaryName,
          is_primary: true,
        });
      }
    }
  
    return Array.from(map.values());
  }
  
  export function hasPositionNamed(emp: any, targetName: string): boolean {
    const normalizedTarget = targetName.trim().toLowerCase();
    return extractEmployeePositions(emp).some(
      (pos) => pos.name.trim().toLowerCase() === normalizedTarget
    );
  }