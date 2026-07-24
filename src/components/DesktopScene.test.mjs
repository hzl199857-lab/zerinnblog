import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const file = readFileSync(new URL('./DesktopScene.tsx', import.meta.url), 'utf8');

test('dock bubbles cycle randomly among the three primary icons', () => {
  assert.match(file, /data-dock-label=\{iconName\}/);
  assert.match(file, /const DOCK_BUBBLE_IDS = \['1-1', '1-2', '2-1'\]/);
  assert.match(file, /setInterval\(showRandomBubble, 4200\)/);
  assert.match(file, /showBubble=\{activeBubbleIcon === iconName\}/);
  assert.doesNotMatch(file, /hoveredIcon ===/);
});

test('dock bubbles use the original white callout treatment', () => {
  assert.match(file, /-top-16/);
  assert.match(file, /rounded-\[18px\][^\n]*bg-white px-4 py-2 text-\[14px\] font-bold/);
  assert.doesNotMatch(file, /backdrop-blur-\[22px\]/);
});
