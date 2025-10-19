import type { ScanReport } from '../utils/types';
import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export async function jsonReporter(report: ScanReport, out?: string): Promise<void> {
  if (!out) return;
  const json = JSON.stringify(report, null, 2);
  const dir = path.dirname(out);
  try {
    await mkdir(dir, { recursive: true });
  } catch {
    // ignore mkdir errors (directory may already exist)
  }
  await writeFile(out, json, 'utf8');
}


