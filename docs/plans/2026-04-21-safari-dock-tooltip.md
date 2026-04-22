# Safari Dock 气泡提示 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 给 Dock 左侧第一个 Safari 图标增加仅在悬停时出现的冒泡提示，文案为“点击查看我的一些小项目”。

**Architecture:** 沿用 `src/components/DesktopScene.tsx` 中现有 `1-2` 图标的 hover 气泡模式，在 Dock 图标循环内为 `1-1` 增加一个同风格、同动画节奏的分支，不额外抽象组件。测试继续使用现有静态源码断言方式，验证气泡条件和文案存在，避免引入超出本次需求的测试基础设施。

**Tech Stack:** React 19、TypeScript、Framer Motion (`motion/react`)、Node test runner via `tsx`

---

### Task 1: 先写失败的 Safari 气泡测试

**Files:**
- Modify: `src/components/DesktopScene.test.ts`
- Test: `src/components/DesktopScene.test.ts`

**Step 1: Write the failing test**

在 `src/components/DesktopScene.test.ts` 增加一个新测试，断言源码里存在：

```ts
test('safari dock icon shows project tooltip on hover', () => {
  assert.match(file, /iconName === '1-1' && hoveredIcon === '1-1'/);
  assert.match(file, /点击查看我的一些小项目/);
});
```

**Step 2: Run test to verify it fails**

Run:

```bash
npx tsx --test "D:/zerinn/Ai-project/复刻/zerinnblog/src/components/DesktopScene.test.ts"
```

Expected: FAIL，并提示找不到 `iconName === '1-1' && hoveredIcon === '1-1'` 或找不到新文案。

**Step 3: Commit**

先不要提交，继续到实现步骤。

### Task 2: 最小实现 Safari hover 气泡

**Files:**
- Modify: `src/components/DesktopScene.tsx:546-566`
- Test: `src/components/DesktopScene.test.ts`

**Step 1: Write minimal implementation**

在 Dock 图标循环里、现有 `1-2` 气泡旁边增加 `1-1` 的条件渲染，保持结构与参考气泡一致：

```tsx
{iconName === '1-1' && hoveredIcon === '1-1' && (
  <motion.div
    className="pointer-events-none absolute -top-16 left-1/2 flex -translate-x-1/2 flex-col items-center"
    initial={{ opacity: 0.92, y: 0, scale: 1 }}
    animate={hoveredIcon === '1-1' ? { opacity: [0.92, 1, 0.92], y: [0, -4, 0], scale: [1, 1.06, 1] } : { opacity: 0, y: 0, scale: 0.98 }}
    transition={{ duration: 1.9, ease: 'easeInOut', repeat: Infinity }}
  >
    <div className="whitespace-nowrap rounded-[18px] border border-white/80 bg-white px-4 py-2 text-[14px] font-bold tracking-[0.01em] text-[#121212] shadow-[0_14px_30px_rgba(0,0,0,0.22)]">
      点击查看我的一些小项目
    </div>
    <div className="-mt-1.5 h-3.5 w-3.5 rotate-45 rounded-[3px] border-r border-b border-black/5 bg-white shadow-[4px_4px_10px_rgba(0,0,0,0.06)]"></div>
  </motion.div>
)}
```

要求：
- 只在 hover `1-1` 时出现。
- 不改动 `1-2` 现有“联系我~”行为。
- 不抽象公共组件；本次只做最小修改。

**Step 2: Run test to verify it passes**

Run:

```bash
npx tsx --test "D:/zerinn/Ai-project/复刻/zerinnblog/src/components/DesktopScene.test.ts"
```

Expected: PASS，包含新的 Safari tooltip 测试和已有测试。

**Step 3: Run type check**

Run:

```bash
npm run lint
```

Expected: PASS，无 TypeScript 报错。

**Step 4: Commit**

```bash
git add src/components/DesktopScene.tsx src/components/DesktopScene.test.ts
git commit -m "feat: add safari dock hover tooltip"
```

### Task 3: 浏览器验证视觉与交互

**Files:**
- Verify: `src/components/DesktopScene.tsx`

**Step 1: Start dev server**

Run:

```bash
npm run dev
```

Expected: Vite 在 3000 端口启动成功。

**Step 2: Verify hover behavior manually**

在浏览器里进入桌面态后，悬停 Dock 左一 Safari 图标，检查：
- 气泡出现位置在图标正上方。
- 文案为“点击查看我的一些小项目”。
- 白色圆角卡片、小箭头、轻微浮动动画与“联系我~”风格一致。
- 鼠标移出后气泡消失。
- `1-2` 联系我气泡仍正常工作。

**Step 3: Commit**

如果人工验证中需要微调样式，再单独提交一次：

```bash
git add src/components/DesktopScene.tsx
git commit -m "refine safari dock tooltip spacing"
```

如果无需微调，则跳过此提交。
