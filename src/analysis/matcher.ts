import type { ScanReport } from '../utils/types';
import type { DictionaryInfo } from '../parser/dictionaryParser';
import type { CodeInfo } from '../parser/codeParser';

export function matchFindings(
  dict: DictionaryInfo,
  code: CodeInfo
): ScanReport {
  const allLocales = dict.locales;
  const defined = new Set<string>();
  for (const set of dict.keysByLocale.values()) {
    for (const k of set) defined.add(k);
  }

  // Compute used keys that exist in dictionaries and missing keys that don't
  const usedInDict = new Set<string>();
  const missingLiterals = new Set<string>();
  for (const k of code.literalKeys) {
    if (defined.has(k)) usedInDict.add(k);
    else missingLiterals.add(k);
  }

  const dynamicPrefixes = [...code.dynamicPrefixes];

  // Unused = definidos que no están usados literalmente y NO están cubiertos por prefijos dinámicos
  const unused = new Set<string>();
  for (const k of defined) {
    if (usedInDict.has(k)) continue;
    const coveredByDynamic = dynamicPrefixes.some((p) => k.startsWith(p));
    if (!coveredByDynamic) unused.add(k);
  }

  const missing = missingLiterals;
  return {
    summary: {
      totalKeys: defined.size,
      used: usedInDict.size,
      unused: unused.size,
      missing: missing.size,
      kbSaved: 0, // filled in core/scan using dictionary sizes
    },
    locales: allLocales,
    unused: Array.from(unused).sort(),
    missing: Array.from(missing).sort(),
  };
}


