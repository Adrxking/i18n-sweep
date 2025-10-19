import type { ScanReport } from '../utils/types';

export function consoleReporter(report: ScanReport): void {
  const { summary } = report;
  // keep output short for MVP
  // eslint-disable-next-line no-console
  console.log(
    `i18n-sweep: total=${summary.totalKeys} used=${summary.used} unused=${summary.unused} missing=${summary.missing} kbSaved=${summary.kbSaved}`
  );
}


