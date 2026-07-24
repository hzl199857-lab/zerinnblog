import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  DEFAULT_DOCK_ORDER,
  moveDockIcon,
  normalizeDockOrder,
  parseDockOrder,
} from './dockOrder';

test('uses the requested dock order by default', () => {
  assert.deepEqual(DEFAULT_DOCK_ORDER, [
    '1-1',
    '1-2',
    '2-1',
    '1-3',
    '1-4',
    '2-2',
    '3-1',
    '3-2',
    '4-1',
  ]);
});

test('keeps a valid stored dock order', () => {
  const reversed = [...DEFAULT_DOCK_ORDER].reverse();

  assert.deepEqual(normalizeDockOrder(reversed), reversed);
});

test('normalizes a partial outdated stored order', () => {
  assert.deepEqual(normalizeDockOrder(['2-1', 'unknown', '2-1']), [
    '2-1',
    '1-1',
    '1-2',
    '1-3',
    '1-4',
    '2-2',
    '3-1',
    '3-2',
    '4-1',
  ]);
});

test('falls back to the default order for malformed persisted JSON', () => {
  assert.deepEqual(parseDockOrder('{not json'), [...DEFAULT_DOCK_ORDER]);
});

test('falls back to the default order for a non-array persisted value', () => {
  assert.deepEqual(parseDockOrder('{"icon":"1-2"}'), [...DEFAULT_DOCK_ORDER]);
});

test('moves an icon to a later position', () => {
  assert.deepEqual(moveDockIcon(['a', 'b', 'c'], 'a', 'c'), ['b', 'c', 'a']);
});

test('moves an icon to an earlier position', () => {
  assert.deepEqual(moveDockIcon(['a', 'b', 'c'], 'c', 'a'), ['c', 'a', 'b']);
});

test('returns an unchanged copy when either move id is missing', () => {
  const order = ['a', 'b', 'c'];
  const result = moveDockIcon(order, 'missing', 'b');

  assert.deepEqual(result, order);
  assert.notEqual(result, order);
});
