import { describe, it, expect } from 'vitest';
import path from 'node:path';
import { scan } from '../src';

describe('advanced fixtures (Options API data with this.$t)', () => {
  it('detects missing keys referenced via this.$t in data()', async () => {
    const root = path.resolve(__dirname, '../fixtures/vue-advanced');
    const report = await scan({ root, locales: ['src/locales/**/*.{json,yaml,yml}'] });
    // Claves intencionadamente ausentes en dicts
    expect(report.missing).toContain('Utilities.stepperForm.weekly');
    expect(report.missing).toContain('Utilities.stepperForm.monthly');
    expect(report.missing).toContain('Utilities.stepperForm.twoWeeks');
  });
});


