import { describe, it, expect, beforeAll } from 'vitest';
import path from 'node:path';
import { promisify } from 'node:util';

const execFile = promisify(require('node:child_process').exec);

describe('CLI', () => {
  beforeAll(async () => {
    const cwd = path.resolve(__dirname, '..');
    await execFile('npm run build', { cwd });
  });
  it('runs scan command and prints summary', async () => {
    const cwd = path.resolve(__dirname, '..');
    const cmd = `node ./dist/cli.cjs scan --root ./fixtures/vue-basic --locales "src/locales/*.json" --report console`;
    const { stdout } = await execFile(cmd, { cwd });
    expect(stdout.trim()).toMatch(/i18n-sweep: total=\d+ used=\d+ unused=\d+ missing=\d+ kbSaved=\d+(\.\d+)?/);
  });

  it('writes JSON report to default path when report=json', async () => {
    const cwd = path.resolve(__dirname, '..');
    const out = path.join(cwd, 'i18n-sweep-report.json');
    try { require('node:fs').unlinkSync(out); } catch { /* ignore */ }
    const cmd = `node ./dist/cli.cjs scan --root ./fixtures/vue-basic --locales "src/locales" --report json`;
    await execFile(cmd, { cwd });
    const text = require('node:fs').readFileSync(out, 'utf8');
    const parsed = JSON.parse(text);
    expect(parsed.summary.totalKeys).toBeGreaterThan(0);
    expect(parsed).toHaveProperty('unused');
    expect(parsed).toHaveProperty('missing');
    expect(parsed.summary).toHaveProperty('kbSaved');
  });

  it('respects custom i18n function names via --i18n-fns', async () => {
    const cwd = path.resolve(__dirname, '..');
    const cmd = `node ./dist/cli.cjs scan --root ./fixtures/custom-fns --locales "fixtures/custom-fns/locales" --report console --i18n-fns translate,i18n.translate`;
    const { stdout } = await execFile(cmd, { cwd });
    expect(stdout.trim()).toMatch(/i18n-sweep: total=0 used=0 unused=0 missing=0 kbSaved=0/);
  });
});


