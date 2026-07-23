import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const file = readFileSync(new URL('./DesktopScene.tsx', import.meta.url), 'utf8');

test('desktop background does not animate blur during unlock handoff', () => {
  assert.match(file, /backgroundImage: 'url\(\/img\/gen_20260413_0013\.jpg\)'/);
  assert.doesNotMatch(file, /transition-\[filter\]/);
});

test('safari dock entry shows the projects tooltip', () => {
  assert.match(file, /const ENABLE_SAFARI_DOCK_ENTRY = true;/);
  assert.match(file, /ENABLE_SAFARI_DOCK_ENTRY && iconName === '1-1' && hoveredIcon === '1-1'/);
  assert.match(file, /我的项目/);
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

test('dock blur treatment applies to projects and contact hover', () => {
  assert.match(file, /const isDockTooltipHovered = hoveredDockIcon === '1-1' \|\| hoveredDockIcon === '1-2';/);
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
