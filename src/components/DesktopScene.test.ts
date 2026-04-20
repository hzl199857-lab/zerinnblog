import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const file = readFileSync(new URL('./DesktopScene.tsx', import.meta.url), 'utf8');

test('contact dock bubble uses larger label sizing', () => {
  assert.match(file, /text-\[14px\][^\n]*font-bold/);
  assert.match(file, /px-4 py-2/);
});

test('contact dock bubble includes looping attention animation', () => {
  assert.match(file, /animate=\{hoveredIcon === '1-2' \? \{[^}]*scale:/s);
  assert.match(file, /transition=\{\{[^}]*repeat: Infinity/s);
});
