import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { test } from 'node:test';

import { projects } from './data';

const promptCatcher = projects.find((project) => project.id === 'prompt-catcher');

test('includes the published Prompt Catcher case study', () => {
  assert.ok(promptCatcher);
  assert.equal(promptCatcher.title, '提示词抓取器');
  assert.match(promptCatcher.caseStudy?.storeUrl ?? '', /chromewebstore\.google\.com/);
  assert.equal(promptCatcher.caseStudy?.metrics.length, 4);
  assert.equal(promptCatcher.caseStudy?.workflow.length, 4);
  assert.equal(promptCatcher.caseStudy?.capabilities.length, 4);
  assert.equal(promptCatcher.caseStudy?.engineering.length, 4);
});

test('ships every Prompt Catcher showcase asset from public', () => {
  assert.ok(promptCatcher);

  for (const asset of [promptCatcher.iconSrc, ...promptCatcher.previews.map((preview) => preview.src)]) {
    assert.ok(existsSync(new URL(`../public${asset}`, import.meta.url)), `missing showcase asset: ${asset}`);
  }
});
