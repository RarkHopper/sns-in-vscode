import { execSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const MAX_FILE_BYTES = 8_000;
const MAX_FILES = 30;

export interface ProjectInfo {
  projectDir: string;
  /** Git-tracked file paths relative to projectDir */
  files: string[];
  /** Directory tree (depth 3) */
  tree: string;
  /** Sampled file contents */
  samples: FileSample[];
}

export interface FileSample {
  path: string;
  content: string;
  truncated: boolean;
}

export class ProjectCollector {
  constructor(private readonly projectDir: string) {}

  collect(): ProjectInfo {
    const files = this.gitFiles();
    const samples = this.sampleFiles(files);
    const tree = this.buildTree(files);
    return { projectDir: this.projectDir, files, tree, samples };
  }

  private gitFiles(): string[] {
    try {
      const out = execSync('git ls-files', {
        cwd: this.projectDir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      return out.split('\n').filter(Boolean);
    } catch {
      return [];
    }
  }

  private sampleFiles(files: string[]): FileSample[] {
    const codeExts = new Set([
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.mjs',
      '.cjs',
      '.py',
      '.go',
      '.rs',
      '.java',
      '.kt',
      '.json',
      '.yaml',
      '.yml',
      '.toml',
      '.md',
    ]);

    const candidates = files.filter((f) => {
      const ext = f.slice(f.lastIndexOf('.'));
      return codeExts.has(ext);
    });

    const picked = candidates.slice(0, MAX_FILES);
    const samples: FileSample[] = [];

    for (const rel of picked) {
      const abs = join(this.projectDir, rel);
      try {
        const stat = statSync(abs);
        if (stat.size === 0) continue;
        const raw = readFileSync(abs, 'utf8');
        const truncated = Buffer.byteLength(raw) > MAX_FILE_BYTES;
        const content = truncated ? raw.slice(0, MAX_FILE_BYTES) : raw;
        samples.push({ path: rel, content, truncated });
      } catch {
        // skip unreadable files
      }
    }

    return samples;
  }

  private buildTree(files: string[]): string {
    const dirs = new Set<string>();
    for (const f of files) {
      const parts = f.split('/');
      for (let i = 1; i < Math.min(parts.length, 4); i++) {
        dirs.add(parts.slice(0, i).join('/'));
      }
    }

    const sorted = [...dirs].sort();
    return sorted
      .map((d) => {
        const depth = d.split('/').length - 1;
        const indent = '  '.repeat(depth);
        const name = d.split('/').at(-1) ?? d;
        return `${indent}${name}/`;
      })
      .join('\n');
  }
}
