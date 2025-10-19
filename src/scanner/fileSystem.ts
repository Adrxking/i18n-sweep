import fg from 'fast-glob';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function globFiles(
  root: string,
  patterns: string[],
  ignore: string[] = []
): Promise<string[]> {
  const entries = await fg(patterns, {
    cwd: root,
    absolute: true,
    dot: false,
    onlyFiles: true,
    ignore,
  });
  return entries.map((p) => path.resolve(p));
}

export async function readTextFile(filePath: string): Promise<string> {
  return readFile(filePath, 'utf8');
}


