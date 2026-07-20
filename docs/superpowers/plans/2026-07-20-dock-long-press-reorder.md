# Dock Long-Press Reordering Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cross-group long-press reordering to the Dock while preserving click actions and saving each visitor's order locally.

**Architecture:** Store one flat icon order and derive the four visual groups from fixed boundaries. Keep normalization and moving as pure tested helpers, while the existing Dock component owns pointer gesture state and guarded local persistence. Use Pointer Events for mouse/touch/pen and Motion layout animation for reflow.

**Tech Stack:** React 19, TypeScript, Motion, Node test runner, Vite

---

## File Structure

- Create `src/components/dockOrder.ts`: default order, fixed boundaries, normalization, persistence parsing, and item movement.
- Create `src/components/dockOrder.test.ts`: behavioral tests for every pure ordering case.
- Modify `src/components/DesktopScene.tsx`: persistent order state, long-press gesture, hit testing, click suppression, and animated rendering.
- Modify `src/components/DesktopScene.test.ts`: source-contract regression checks for pointer and persistence wiring.

### Task 1: Pure Dock Ordering

**Files:**
- Create: `src/components/dockOrder.ts`
- Create: `src/components/dockOrder.test.ts`

- [ ] **Step 1: Write the failing helper tests**

Test the default list, valid stored order, malformed JSON fallback, removal of unknown/duplicate IDs, appending missing IDs, and `moveDockIcon` in both directions:

```ts
test('normalizes a partial outdated stored order', () => {
  assert.deepEqual(normalizeDockOrder(['2-1', 'unknown', '2-1']), [
    '2-1', '1-1', '1-2', '1-3', '1-4', '2-2', '3-1', '3-2', '4-1',
  ]);
});

test('moves an icon to a later position', () => {
  assert.deepEqual(moveDockIcon(['a', 'b', 'c'], 'a', 'c'), ['b', 'c', 'a']);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run: `node --import tsx --test src/components/dockOrder.test.ts`

Expected: FAIL because `dockOrder.ts` does not exist.

- [ ] **Step 3: Implement the pure helpers**

```ts
export const DEFAULT_DOCK_ORDER = ['1-1', '1-2', '1-3', '1-4', '2-1', '2-2', '3-1', '3-2', '4-1'] as const;
export const DOCK_GROUP_ENDS = new Set([4, 6, 8]);

export function normalizeDockOrder(value: unknown): string[] {
  const source = Array.isArray(value) ? value : [];
  const allowed = new Set<string>(DEFAULT_DOCK_ORDER);
  const seen = new Set<string>();
  const kept = source.filter((id): id is string => typeof id === 'string' && allowed.has(id) && !seen.has(id) && Boolean(seen.add(id)));
  return [...kept, ...DEFAULT_DOCK_ORDER.filter((id) => !seen.has(id))];
}

export function parseDockOrder(value: string | null): string[] {
  if (!value) return [...DEFAULT_DOCK_ORDER];
  try { return normalizeDockOrder(JSON.parse(value)); } catch { return [...DEFAULT_DOCK_ORDER]; }
}

export function moveDockIcon(order: readonly string[], draggedId: string, targetId: string): string[] {
  const from = order.indexOf(draggedId);
  const to = order.indexOf(targetId);
  if (from < 0 || to < 0 || from === to) return [...order];
  const next = [...order];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
```

- [ ] **Step 4: Run the helper tests and verify GREEN**

Run: `node --import tsx --test src/components/dockOrder.test.ts`

Expected: all helper tests pass.

### Task 2: Long-Press Dock Interaction

**Files:**
- Modify: `src/components/DesktopScene.test.ts`
- Modify: `src/components/DesktopScene.tsx`

- [ ] **Step 1: Add failing interaction contract tests**

Assert that the Dock includes `DOCK_LONG_PRESS_MS = 150`, pointer down/move/up/cancel handlers, `setPointerCapture`, click suppression after dragging, fixed `DOCK_GROUP_ENDS`, guarded `localStorage` reads/writes, and Motion `layout` rendering.

- [ ] **Step 2: Run the component tests and verify RED**

Run: `node --import tsx --test src/components/DesktopScene.test.ts`

Expected: new assertions fail because the gesture is not implemented.

- [ ] **Step 3: Add persistent flat order state**

Initialize with a guarded browser read and persist changed order in an effect:

```ts
const [dockOrder, setDockOrder] = useState(() => {
  try { return parseDockOrder(window.localStorage.getItem(DOCK_ORDER_STORAGE_KEY)); }
  catch { return [...DEFAULT_DOCK_ORDER]; }
});

useEffect(() => {
  try { window.localStorage.setItem(DOCK_ORDER_STORAGE_KEY, JSON.stringify(dockOrder)); } catch { /* session-only fallback */ }
}, [dockOrder]);
```

- [ ] **Step 4: Implement the 150 ms pointer gesture**

Track the pressed pointer and start coordinates in refs, activate after 150 ms, cancel pre-activation movement beyond 8 px, capture the pointer on activation, and locate the target icon with `[data-dock-icon]` rectangles during active movement. Move via functional state updates and suppress the following click when a drag ends.

- [ ] **Step 5: Render one flat animated sequence with fixed separators**

Map the flat order, add a separator whenever `DOCK_GROUP_ENDS.has(index + 1)`, apply `layout` to each icon wrapper, and visually lift the active icon. Disable tooltip hover and CSS hover enlargement during drag.

- [ ] **Step 6: Run the component and helper tests**

Run: `node --import tsx --test src/components/dockOrder.test.ts src/components/DesktopScene.test.ts`

Expected: all tests pass.

### Task 3: Full Verification

**Files:**
- Modify only if verification exposes a defect.

- [ ] **Step 1: Run type checking**

Run: `npm run lint`

Expected: exit 0 with no TypeScript errors.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: exit 0 and Vite emits `dist` assets.

- [ ] **Step 3: Verify in a browser**

At desktop and mobile viewport sizes, verify short click behavior, 150 ms drag activation, cross-separator movement, no click after drag, and persistence after reload. Inspect the console for runtime errors.

- [ ] **Step 4: Review the final diff**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors and only intended feature/test/plan files plus regenerated build artifacts already tracked by the project.
