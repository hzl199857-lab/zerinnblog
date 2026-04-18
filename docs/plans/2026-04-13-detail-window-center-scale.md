# 详情弹窗中心缩放动画 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 让详情弹窗在出现和消失时仅以自身中心进行缩放和淡入淡出，保留静态错位排布，不让 `x/y` 参与动画。

**Architecture:** 继续使用 `Window` 组件中的绝对定位和静态 `offsetX / offsetY` 作为窗口排布方式。把 Motion 动画从 `opacity + scale + x/y` 改成只控制 `opacity + scale`，并显式设置中心缩放语义，这样窗口不会产生额外位移感。

**Tech Stack:** React 19, TypeScript, Vite, motion/react, Tailwind CSS

---

### Task 1: 调整详情弹窗动画定义

**Files:**
- Modify: `src/App.tsx:122-145`
- Test: `src/App.tsx:123-145`

**Step 1: 先写出要验证的行为**

目标行为：
- 弹窗初始显示时只从自身中心缩小到正常大小
- 弹窗关闭时只从当前尺寸缩小并淡出
- `offsetX / offsetY` 只负责静态错位，不参与 enter/exit tween

**Step 2: 检查当前动画定义**

查看 `Window` 组件中的以下区域：
- `initial`
- `animate`
- `exit`
- `style`

预期会看到 `x: offsetX`、`y: offsetY` 仍在动画对象里。

**Step 3: 写最小实现**

把动画改成只控制透明度和缩放，保留静态位置：

```tsx
<motion.div
  drag
  dragControls={dragControls}
  dragListener={false}
  dragMomentum={false}
  dragConstraints={{ left: -300, right: 300, top: -200, bottom: 200 }}
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.95 }}
  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
  onPointerDownCapture={onFocus}
  className="absolute w-[500px] max-w-[90vw] max-h-[85vh] bg-[#f5f5f5] text-black rounded-xl shadow-2xl overflow-hidden flex flex-col border border-white/50"
  style={{
    left: 'max(5vw, calc(50vw - 250px))',
    top: 'max(5vh, calc(50vh - 350px))',
    x: offsetX,
    y: offsetY,
    zIndex,
    transformOrigin: 'center center',
  }}
>
```

如果 `style.x / style.y` 与当前 motion/react 用法不兼容，则退而求其次，使用包裹层：
- 外层负责 `left/top` 和静态 `x/y`
- 内层负责 `scale/opacity`

但只有在直接写法不生效时才这么做。

**Step 4: 运行项目验证行为**

Run: `npm run dev`
Expected:
- 点击任意桌面图标后，详情弹窗原地放大淡入
- 关闭时原地缩小淡出
- 不再出现向上/向下滑动的感觉
- 多窗口依旧保持错位排布

**Step 5: 再验证多窗口场景**

手动检查：
- 连续打开两个或三个弹窗
- 每个窗口的错位仍存在
- 新窗口不会因为动画而看起来从别处移动过来

**Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "fix: center detail window open close animation"
```
