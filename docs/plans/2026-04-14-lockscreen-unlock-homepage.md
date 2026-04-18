# Lockscreen Unlock Homepage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a homepage where the existing `首页zip` design is preserved as a full-screen lock screen, then unlocks upward after wheel-scroll threshold and reveals the desktop scene built from the `zip` project assets.

**Architecture:** Keep the current desktop app in `zip` as the post-unlock scene and wrap it in a new scene-shell component that manages `locked → unlocking → unlocked` states. Recreate the `首页zip` page as a dedicated `LockScreen` component with matching structure and styling, then animate the lock-screen wrapper upward while the desktop scene becomes active underneath it.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, motion/react, existing local image assets

---

### Task 1: Create the lock-screen component from the homepage source

**Files:**
- Create: `src/components/LockScreen.tsx`
- Create: `src/components/InkTrail.tsx`
- Modify: `src/index.css:1-40`
- Reference: `D:/zerinn/Ai-project/复刻/首页zip/src/App.tsx:1-69`
- Reference: `D:/zerinn/Ai-project/复刻/首页zip/src/components/InkTrail.tsx:1-119`
- Reference: `D:/zerinn/Ai-project/复刻/首页zip/src/index.css:1-11`

**Step 1: Write the failing implementation scaffold**

Create `src/components/LockScreen.tsx` exporting:
- `type LockScreenProps = { unlockProgress: number; isUnlocking: boolean; isUnlocked: boolean }`
- `export default function LockScreen(props: LockScreenProps)`

Render the same semantic blocks as the source homepage:
- `<main>` wrapper
- top-right text block
- rotating badge block
- main typography block with `BUILDING / TOMORROW / FOR [image] TODAY`
- bottom stripe footer
- `InkTrail`

Use the same text content and class structure from `首页zip/src/App.tsx` unless a class must change for integration.

**Step 2: Copy the cursor effect into the target project**

Create `src/components/InkTrail.tsx` by copying the logic from `首页zip/src/components/InkTrail.tsx`.

Keep these behaviors unchanged:
- full-screen fixed canvas
- shrinking trail points
- `ink-bleed` SVG filter
- `mix-blend-difference`

Only change code if needed for TypeScript or lint compatibility in the target app.

**Step 3: Add the lock-screen font and utility styles**

Update `src/index.css` to include:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;900&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

Keep the existing no-scrollbar rules.

**Step 4: Add integration-only props without changing appearance**

Inside `LockScreen.tsx`, add wrapper styles that can later be animated by parent state, but do not visually alter the lock-screen content itself yet.

Allowed additions:
- `data-state` attributes
- outer container class names
- props for progress labels or opacity hooks

Not allowed:
- changing layout copy
- changing badge content
- replacing the hero image
- restyling the page away from the source look

**Step 5: Run type-check**

Run: `npm run lint`
Expected: PASS or only pre-existing unrelated issues.

---

### Task 2: Extract the existing desktop app into a dedicated scene component

**Files:**
- Create: `src/components/DesktopScene.tsx`
- Modify: `src/App.tsx:1-260`
- Reference: `src/data.ts:1-120`

**Step 1: Move the current desktop rendering out of `App.tsx`**

Create `src/components/DesktopScene.tsx` and move these responsibilities there:
- blurred full-screen background image
- desktop icons grid/absolute icon placement
- active window state
- detail window open/close behavior
- dock rendering

`DesktopScene` should become the owner of:
- `activeWindows`
- `toggleWindow`
- `bringToFront`

**Step 2: Preserve existing desktop behavior exactly**

Copy the current implementations of:
- `DesktopIcon`
- `Window`
- `Dock`

Do not redesign them during extraction. The purpose is to keep the desktop scene stable while the homepage shell is rebuilt around it.

**Step 3: Add a scene wrapper prop interface**

Expose props such as:

```ts
type DesktopSceneProps = {
  isUnlocked: boolean;
  isUnlocking: boolean;
};
```

Initially, use the props only for wrapper classes/attributes. Do not gate functionality yet.

**Step 4: Reduce `App.tsx` to orchestration only**

After extraction, `src/App.tsx` should no longer contain the window management implementation details.

It should eventually import:
- `LockScreen`
- `DesktopScene`
- scene state hooks

**Step 5: Run type-check**

Run: `npm run lint`
Expected: PASS.

---

### Task 3: Build the scene shell and unlock state machine

**Files:**
- Modify: `src/App.tsx:1-220`
- Modify: `src/index.css:1-220`

**Step 1: Add minimal scene state**

In `src/App.tsx`, add:

```ts
const UNLOCK_THRESHOLD = 520;
const UNLOCK_ANIMATION_MS = 1100;

const [unlockProgress, setUnlockProgress] = useState(0);
const [isUnlocking, setIsUnlocking] = useState(false);
const [isUnlocked, setIsUnlocked] = useState(false);
```

**Step 2: Add wheel accumulation logic**

Attach a wheel listener at the shell level that:
- ignores input if already unlocking/unlocked
- only reacts to positive `deltaY`
- accumulates progress up to `UNLOCK_THRESHOLD`
- clamps values so progress never exceeds the threshold visually

Example logic:

```ts
const next = Math.min(UNLOCK_THRESHOLD, current + Math.max(0, event.deltaY));
```

**Step 3: Trigger one-shot unlock animation**

When progress reaches threshold:
- set `isUnlocking` to `true`
- stop accepting new wheel input
- after `UNLOCK_ANIMATION_MS`, set `isUnlocked` to `true`
- reset `isUnlocking` to `false`

Do not implement reverse-locking.

**Step 4: Compose the layers in `App.tsx`**

Render in this order:
1. desktop scene at the bottom
2. lock-screen overlay on top
3. optional unlock hint/progress text if needed

Pseudo-structure:

```tsx
<div className="homepage-shell">
  <DesktopScene isUnlocked={isUnlocked} isUnlocking={isUnlocking} />
  {!isUnlocked && (
    <LockScreen
      unlockProgress={unlockProgress}
      isUnlocking={isUnlocking}
      isUnlocked={isUnlocked}
    />
  )}
</div>
```

**Step 5: Add cleanup for timers/listeners**

Ensure wheel listeners and unlock timeout are cleaned up in `useEffect` cleanup.

**Step 6: Run type-check**

Run: `npm run lint`
Expected: PASS.

---

### Task 4: Animate the lock-screen upward without changing its internal design

**Files:**
- Modify: `src/components/LockScreen.tsx:1-220`
- Modify: `src/index.css:1-260`

**Step 1: Add progress-driven pre-unlock feedback**

Before the threshold is reached, the lock-screen wrapper may respond slightly to scroll progress using only outer transforms:
- `translateY`: small negative offset
- `scale`: very subtle reduction
- optional top-edge shadow or opacity shift

Keep it restrained so the lock-screen still looks identical at rest.

Suggested mapping:

```ts
const progressRatio = unlockProgress / UNLOCK_THRESHOLD;
const previewLift = progressRatio * 32;
const previewScale = 1 - progressRatio * 0.015;
```

**Step 2: Add one-shot unlock animation classes**

When `isUnlocking` becomes true, animate the lock-screen wrapper to:
- move fully above the viewport
- slightly fade during exit
- keep pointer-events disabled during animation

Suggested end state:
- `transform: translateY(-105vh) scale(0.96)`
- `opacity: 0.45`

**Step 3: Keep lock-screen internals untouched**

Do not individually animate the lock-screen text, badge, footer, or image. The whole page should move as one layer, matching the “screen slides away” feel.

**Step 4: Add unlock hint text on the wrapper only if needed**

If the interaction feels unclear, add a minimal hint such as “SCROLL TO UNLOCK” outside the source layout, pinned near the bottom center. Keep it removable and visually secondary.

**Step 5: Run manual visual check**

Run: `npm run dev`
Expected:
- initial lock-screen matches the source homepage look
- small wheel movements create only subtle wrapper feedback
- reaching threshold launches a single upward unlock motion
- no internal layout jumps occur during animation

---

### Task 5: Stage the desktop scene so it feels like the revealed layer

**Files:**
- Modify: `src/components/DesktopScene.tsx:1-320`
- Modify: `src/index.css:1-320`

**Step 1: Add pre-unlock desktop staging styles**

Before unlock completes, the desktop scene should be visible underneath but visually subordinate.

Add wrapper states such as:
- slightly lowered position
- slightly larger blur or lower opacity overlay
- small scale difference that resolves on unlock

Suggested initial wrapper state:

```css
transform: translateY(40px) scale(1.015);
opacity: 0.88;
```

**Step 2: Promote the desktop on unlock**

When unlocking/unlocked:
- transition the desktop wrapper to neutral transform
- remove extra dimming/blur
- preserve icon/window interactivity only after unlock

Implementation rule:
- before unlock, set desktop scene wrapper `pointer-events: none`
- after unlock, restore interactivity

**Step 3: Keep the desktop design aligned with the reference image**

Do not redesign the existing desktop app into a different aesthetic. Preserve:
- centered portrait background
- scattered thumbnail icons
- bottom frosted dock
- floating detail windows

Only adjust wrapper-level depth/atmosphere if needed to support the unlock reveal.

**Step 4: Run manual visual check**

Run: `npm run dev`
Expected:
- desktop feels present behind the lock-screen
- unlock reveal feels like exposing the existing desktop layer
- once unlocked, desktop interactions work normally

---

### Task 6: Verify the real assets and tune composition

**Files:**
- Modify: `src/data.ts:1-120` (only if icon positions or labels need small tuning)
- Modify: `src/components/DesktopScene.tsx:1-320` (only if layout needs wrapper-safe adjustments)

**Step 1: Verify all asset paths resolve**

Check these existing asset families in the browser:
- `/img/works/...`
- `/dock-icons/...`
- `/img/background.jpg`

If any are broken, fix only the path mapping. Do not rename or reorganize assets unless required.

**Step 2: Compare against the provided desktop reference**

Check whether the composed desktop scene still matches the intended reference:
- portrait background dominant
- icons dispersed with open whitespace
- dock centered at bottom
- no excessive overlays after unlock

**Step 3: Make only minimal composition fixes**

Allowed fixes:
- small `x/y` adjustments in `src/data.ts`
- icon spacing tweaks
- dock bottom offset tweak
- background position/size adjustment

Avoid scope creep such as adding new apps, windows, or alternate layouts.

**Step 4: Run build verification**

Run: `npm run build`
Expected: Vite production build succeeds.

**Step 5: Run final type-check**

Run: `npm run lint`
Expected: PASS.

---

### Task 7: Final interaction QA

**Files:**
- Test only: `src/App.tsx:1-220`
- Test only: `src/components/LockScreen.tsx:1-220`
- Test only: `src/components/DesktopScene.tsx:1-320`

**Step 1: Verify locked initial state**

Manual checks:
- page opens on lock-screen, not desktop
- lock-screen visual matches the source homepage
- desktop is not interactable before unlock

**Step 2: Verify threshold behavior**

Manual checks:
- small downward scroll does not instantly unlock
- repeated scroll accumulates progress
- unlock triggers once when threshold is reached
- extra wheel input during animation does nothing

**Step 3: Verify unlocked desktop behavior**

Manual checks:
- desktop icons can be clicked and dragged
- windows open and close correctly
- dock remains visible and aligned
- no lock-screen overlay remains blocking input

**Step 4: Verify refresh behavior**

Manual checks:
- refreshing the page returns to locked state unless the user explicitly asked for persistence

**Step 5: Record any remaining visual polish items**

If something is off, log only concrete follow-ups such as:
- “unlock threshold too short”
- “desktop background too dim before unlock”
- “lock-screen wrapper exits too fast”

Do not implement extra features during QA.
