export type ExtractedUsage = {
  key: string;
  kind: 'literal' | 'dynamic' | 'missing';
  file: string;
  line?: number;
};

export type ScanOptions = {
  root: string;
  locales: string[];
  report?: 'console' | 'json';
  out?: string | undefined;
  i18nFunctions?: string[]; // custom i18n function names, e.g., ['translate','i18n.translate']
};

export type ScanReport = {
  summary: { totalKeys: number; used: number; unused: number; missing: number; kbSaved: number };
  locales: string[];
  unused: string[];
  missing: string[];
};


