import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const workflowUrl = new URL('./deploy.yml', import.meta.url);

test('defines the Aliyun deployment workflow', () => {
  assert.ok(existsSync(workflowUrl), 'missing deploy.yml');
});

const source = existsSync(workflowUrl) ? readFileSync(workflowUrl, 'utf8') : '';

test('deploys pushes to main and supports manual runs', () => {
  assert.match(source, /push:\s*\n\s*branches:\s*\n\s*- main/);
  assert.match(source, /workflow_dispatch:/);
});

test('builds and validates the Vite application', () => {
  assert.match(source, /npm ci/);
  assert.match(source, /npm run lint/);
  assert.match(source, /npm run build/);
});

test('uses repository secrets for the SSH connection', () => {
  for (const secret of [
    'ALIYUN_SERVER_HOST',
    'ALIYUN_SERVER_PORT',
    'ALIYUN_SERVER_USER',
    'ALIYUN_SERVER_SSH_KEY',
  ]) {
    assert.match(source, new RegExp(`secrets\\.${secret}`));
  }
});

test('deploys versioned releases to the portfolio web root', () => {
  assert.match(source, /APP_ROOT="\/www\/zerinnblog"/);
  assert.match(source, /RELEASES="\$APP_ROOT\/releases"/);
  assert.match(source, /DIST_LINK="\$APP_ROOT\/dist"/);
  assert.match(source, /deploy-version\.txt/);
});

test('rolls back the symlink when the public health check fails', () => {
  assert.match(source, /PREVIOUS_RELEASE=/);
  assert.match(source, /ln -sfn "\$PREVIOUS_RELEASE" "\$NEXT_LINK"/);
  assert.match(source, /https:\/\/www\.zerinnai\.online\/deploy-version\.txt/);
});
