import type { ScanOptions, ScanReport } from '../utils/types';
import { parseDictionaries } from '../parser/dictionaryParser';
import { extractCodeUsages } from '../parser/codeParser';
import { matchFindings } from '../analysis/matcher';
import { consoleReporter } from '../reporters/consoleReporter';
import { jsonReporter } from '../reporters/jsonReporter';
import path from 'node:path';

export async function scan(opts: ScanOptions): Promise<ScanReport> {
  const rootAbs = path.resolve(opts.root);
  const dictInfo = await parseDictionaries(rootAbs, opts.locales);
  const codeInfo = await extractCodeUsages(rootAbs, opts.i18nFunctions);
  const report = matchFindings(dictInfo, codeInfo);
  // Compute kbSaved: estimate bytes of unused keys across locales
  let totalBytesSaved = 0;
  if (dictInfo.bytesByLocale && dictInfo.keysByLocale) {
    for (const [, keys] of dictInfo.keysByLocale.entries()) {
      let localeBytes = 0;
      for (const k of report.unused) {
        if (keys.has(k)) {
          // rough per-key cost: key + minimal value length; assume value avg 6 bytes if unknown
          const keyLen = JSON.stringify(String(k)).length;
          const avgVal = 6;
          localeBytes += keyLen + 1 + avgVal;
        }
      }
      totalBytesSaved += localeBytes;
    }
  }
  report.summary.kbSaved = Math.round((totalBytesSaved / 1024) * 100) / 100;

  if (opts.report === 'console') {
    consoleReporter(report);
  } else if (opts.report === 'json') {
    await jsonReporter(report, opts.out);
  }

  return report;
}


