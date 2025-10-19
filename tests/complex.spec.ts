import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { scan } from '../src';

describe('complex fixtures (dynamic prefixes and unused suppression)', () => {
  it('handles dynamic prefixes and does not mark covered keys as unused', async () => {
    const root = path.resolve(__dirname, '../fixtures/vue-advanced');
    const report = await scan({ root, locales: ['src/locales/**/*.{json,yaml,yml}'] });
    // dynamic prefixes from Complex.vue: menu., form.
    // ensure missing literal appears
    expect(report.missing).toContain('menu.admin');
    // ensure defined keys remain used or suppressed if covered by dynamic
    expect(report.summary.totalKeys).toBeGreaterThan(0);
    // menu.home is defined; admin is missing; dynamic should exist internally but not in JSON
    // verify that keys like form.email (defined) are not reported unused due to dynamic 'form.' usage
    expect(report.unused.includes('form.email')).toBe(false);
  });
});


