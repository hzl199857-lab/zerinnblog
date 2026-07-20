export const DEFAULT_DOCK_ORDER = [
  '1-1',
  '1-2',
  '1-3',
  '1-4',
  '2-1',
  '2-2',
  '3-1',
  '3-2',
  '4-1',
] as const;

export const DOCK_GROUP_ENDS = new Set([4, 6, 8]);
export const DOCK_ORDER_STORAGE_KEY = 'zerinnblog:dock-order:v1';

export function normalizeDockOrder(value: unknown): string[] {
  const allowed = new Set<string>(DEFAULT_DOCK_ORDER);
  const seen = new Set<string>();
  const normalized: string[] = [];

  if (Array.isArray(value)) {
    for (const id of value) {
      if (typeof id !== 'string' || !allowed.has(id) || seen.has(id)) continue;
      seen.add(id);
      normalized.push(id);
    }
  }

  for (const id of DEFAULT_DOCK_ORDER) {
    if (!seen.has(id)) normalized.push(id);
  }

  return normalized;
}

export function parseDockOrder(value: string | null): string[] {
  if (!value) return [...DEFAULT_DOCK_ORDER];

  try {
    return normalizeDockOrder(JSON.parse(value));
  } catch {
    return [...DEFAULT_DOCK_ORDER];
  }
}

export function moveDockIcon(
  order: readonly string[],
  draggedId: string,
  targetId: string,
): string[] {
  const fromIndex = order.indexOf(draggedId);
  const targetIndex = order.indexOf(targetId);

  if (fromIndex < 0 || targetIndex < 0 || fromIndex === targetIndex) {
    return [...order];
  }

  const nextOrder = [...order];
  const [draggedIcon] = nextOrder.splice(fromIndex, 1);
  nextOrder.splice(targetIndex, 0, draggedIcon);
  return nextOrder;
}
