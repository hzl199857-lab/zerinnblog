import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const file = readFileSync(new URL('./DesktopScene.tsx', import.meta.url), 'utf8');

test('desktop background does not animate blur during unlock handoff', () => {
  assert.match(file, /backgroundImage: 'url\(\/img\/gen_20260413_0013\.jpg\)'/);
  assert.doesNotMatch(file, /transition-\[filter\]/);
});

test('safari dock tooltip is kept behind a disabled entry flag', () => {
  assert.match(file, /const ENABLE_SAFARI_DOCK_ENTRY = false;/);
  assert.match(file, /ENABLE_SAFARI_DOCK_ENTRY && iconName === '1-1' && hoveredIcon === '1-1'/);
  assert.match(file, /点击查看我的一些小项目/);
});

test('safari dock window code is retained but click entry is disabled', () => {
  assert.match(file, /if \(iconName === '1-1'\)/);
  assert.match(file, /if \(!ENABLE_SAFARI_DOCK_ENTRY\) return;/);
  assert.match(file, /setIsSafariWindowOpen\(true\)/);
  assert.match(file, /<SafariWindow onClose=\{\(\) => setIsSafariWindowOpen\(false\)\} \/>/);
  assert.match(file, /url: 'https:\/\/kv\.zerinnai\.online\/'/);
  assert.match(file, /src=\{activeTab\.url\}/);
  assert.match(file, /title=\{`Safari \$\{activeTab\.label\}`\}/);
});

test('dock blur treatment no longer includes disabled safari hover', () => {
  assert.match(file, /const isDockTooltipHovered = hoveredDockIcon === '1-2';/);
  assert.doesNotMatch(file, /hoveredDockIcon === '1-1' \|\| hoveredDockIcon === '1-2'/);
  assert.match(file, /filter: isDockTooltipHovered \? 'blur\(12px\)' : undefined/);
  assert.match(file, /\{isDockTooltipHovered && \(/);
});

test('contact dock bubble uses larger label sizing', () => {
  assert.match(file, /text-\[14px\][^\n]*font-bold/);
  assert.match(file, /px-4 py-2/);
});

test('contact dock bubble includes looping attention animation', () => {
  assert.match(file, /animate=\{hoveredIcon === '1-2' \? \{[^}]*scale:/s);
  assert.match(file, /transition=\{\{[^}]*repeat: Infinity/s);
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
