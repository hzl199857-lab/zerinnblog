import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const file = readFileSync(new URL('./DesktopScene.tsx', import.meta.url), 'utf8');

test('desktop background does not animate blur during unlock handoff', () => {
  assert.match(file, /backgroundImage: 'url\(\/img\/gen_20260413_0013\.jpg\)'/);
  assert.doesNotMatch(file, /transition-\[filter\]/);
});

test('dock randomly cycles bubbles for the three primary icons', () => {
  assert.match(file, /const DOCK_LABELS: Record<string, string>/);
  assert.match(file, /const DOCK_BUBBLE_IDS = \['1-1', '1-2', '2-1'\]/);
  assert.match(file, /data-dock-label=\{iconName\}/);
  assert.match(file, /const dockLabel = DOCK_LABELS\[iconName\]/);
  assert.match(file, /setInterval\(showRandomBubble, 4200\)/);
  assert.match(file, /setTimeout\(\(\) => setActiveBubbleIcon\(null\), 2200\)/);
  assert.match(file, /showBubble=\{activeBubbleIcon === iconName\}/);
  assert.doesNotMatch(file, /'1-3': 'Illustrator'/);
  assert.doesNotMatch(file, /hoveredIcon === '1-1'/);
});

test('safari dock opens the Prompt Catcher project in a native browser shell', () => {
  assert.match(file, /if \(iconName === '1-1'\)/);
  assert.match(file, /setIsSafariWindowOpen\(true\)/);
  assert.match(file, /<SafariWindow project=\{promptCatcherProject\}/);
  assert.match(file, /data-safari-project-window/);
  assert.match(file, /zerinn\.local \/ 我的项目 \/ prompt-catcher/);
  assert.match(file, /<PromptCatcherCaseStudy/);
  assert.doesNotMatch(file, /const safariTabs/);
  assert.doesNotMatch(file, /kv\.zerinnai\.online/);
});

test('random dock bubbles do not blur the desktop', () => {
  assert.doesNotMatch(file, /isDockTooltipHovered/);
  assert.doesNotMatch(file, /hoveredDockIcon/);
  assert.doesNotMatch(file, /filter: .*blur\(12px\)/);
});

test('dock bubbles use the original white callout styling with more spacing', () => {
  assert.match(file, /data-dock-label=\{iconName\}[\s\S]*-top-16/);
  assert.match(file, /rounded-\[18px\][^\n]*bg-white px-4 py-2 text-\[14px\] font-bold/);
  assert.doesNotMatch(file, /backdrop-blur-\[22px\]/);
  assert.doesNotMatch(file, /backdrop-saturate-\[180%\]/);
});

test('dock bubbles are not hover-gated', () => {
  assert.doesNotMatch(file, /hoveredIcon === '1-2'/);
  assert.match(file, /!isDockDragging && showBubble && dockLabel/);
  assert.doesNotMatch(file, /repeat: Infinity/);
});

test('dock uses a 150 ms pointer long press gesture', () => {
  assert.match(file, /const DOCK_LONG_PRESS_MS = 150;/);
  assert.match(file, /onPointerDown=\{\(event\) => startDockPress\(event, iconName\)\}/);
  assert.match(file, /onPointerMove=\{moveDockPress\}/);
  assert.match(file, /onPointerUp=\{endDockPress\}/);
  assert.match(file, /onPointerCancel=\{cancelDockPress\}/);
  assert.match(file, /setPointerCapture\(gesture\.pointerId\)/);
});

test('dock suppresses icon clicks after dragging', () => {
  assert.match(file, /const suppressNextClickRef = useRef\(false\);/);
  assert.match(file, /if \(suppressNextClickRef\.current\)/);
  assert.match(file, /event\.preventDefault\(\);/);
  assert.match(file, /onIconClick\(iconName\);/);
});

test('dock renders a flat order with fixed separator boundaries and layout animation', () => {
  assert.match(file, /dockOrder\.map\(\(iconName, index\) =>/);
  assert.match(file, /DOCK_GROUP_ENDS\.has\(index \+ 1\)/);
  assert.match(file, /data-dock-icon=\{iconName\}/);
  assert.match(file, /layout="position"/);
});

test('dock order is read and persisted with guarded local storage access', () => {
  assert.match(file, /parseDockOrder\(window\.localStorage\.getItem\(DOCK_ORDER_STORAGE_KEY\)\)/);
  assert.match(file, /window\.localStorage\.setItem\(/);
  assert.match(file, /JSON\.stringify\(dockOrder\)/);
  assert.match(file, /catch \{/);
});

test('dock scales to fit narrow mobile viewports', () => {
  assert.match(file, /max-\[640px\]:scale-\[0\.64\]/);
});

test('project windows are not trapped below the dock stacking context', () => {
  assert.match(file, /zIndex=\{50 \+ index\}/);
  assert.match(file, /className="absolute bottom-10 left-1\/2 z-40 -translate-x-1\/2"/);
  assert.match(file, /className="relative h-full w-full transition-all duration-200"/);
  assert.doesNotMatch(file, /className="relative z-10 h-full w-full transition-all duration-200"/);
});

test('case study projects are removed from desktop icons and routed through Safari', () => {
  assert.match(file, /projects\.filter\(\(project\) => !project\.caseStudy\)\.map/);
  assert.match(file, /const promptCatcherProject = projects\.find/);
  assert.doesNotMatch(file, /function FeaturedProductWidget/);
  assert.doesNotMatch(file, /data-featured-project/);
});
