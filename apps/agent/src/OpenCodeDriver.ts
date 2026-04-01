import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProjectDir } from './utils.js';

const POST_TAG_RE = /<post>([\s\S]*?)<\/post>/i;

interface OpenCodeJson {
  model?: string;
  provider?: Record<string, { options?: { baseURL?: string; apiKey?: string } }>;
}

/** opencode.json から model 文字列を読む ("provider/model" 形式のまま返す)。 */
function readModelFromConfig(): string | undefined {
  try {
    const configPath = join(dirname(fileURLToPath(import.meta.url)), '../../..', 'opencode.json');
    const raw = readFileSync(configPath, 'utf8');
    const json = JSON.parse(raw) as OpenCodeJson;
    return json.model;
  } catch {
    return undefined;
  }
}

interface Options {
  /** opencode に渡すモデル文字列。未指定時は opencode.json → SNS_AGENT_MODEL の順で解決。 */
  model?: string;
  /** opencode を実行するプロジェクトディレクトリ。未指定時は SNS_PROJECT_DIR または cwd。 */
  projectDir?: string;
  /** 最大待機時間（ms）。デフォルト 120 秒。 */
  timeoutMs?: number;
}

/**
 * opencode を `opencode run "<prompt>"` で非同期呼び出しする。
 *
 * spawnSync と異なり spawn を使うため複数ワーカーが真に並列で動作し、
 * 推論完了次第それぞれ即座に投稿される。
 */
export class OpenCodeDriver {
  private readonly model: string | undefined;
  private readonly projectDir: string;
  private readonly timeoutMs: number;

  constructor(opts: Options = {}) {
    this.model = opts.model ?? process.env['SNS_AGENT_MODEL'] ?? readModelFromConfig();
    this.projectDir = opts.projectDir ?? resolveProjectDir();
    this.timeoutMs =
      opts.timeoutMs ??
      (process.env['SNS_AGENT_TIMEOUT_MS']
        ? Number.parseInt(process.env['SNS_AGENT_TIMEOUT_MS'], 10)
        : 120_000);
  }

  complete(prompt: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const args: string[] = ['run'];
      if (this.model) args.push('--model', this.model);
      args.push(prompt);

      const child = spawn('opencode', args, {
        cwd: this.projectDir,
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });
      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      const timer = setTimeout(() => {
        child.kill();
        reject(new Error(`opencode timeout after ${String(this.timeoutMs)}ms`));
      }, this.timeoutMs);

      child.on('error', (err: NodeJS.ErrnoException) => {
        clearTimeout(timer);
        if (err.code === 'ENOENT') {
          reject(new Error('opencode が見つかりません: npm install -g opencode-ai'));
        } else {
          reject(err);
        }
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        if (code !== 0) {
          reject(new Error(`opencode が終了コード ${String(code)} で失敗:\n${stderr}`));
          return;
        }
        try {
          resolve(extractPost(stdout.trim()));
        } catch (e) {
          reject(e instanceof Error ? e : new Error(String(e)));
        }
      });
    });
  }
}

function extractPost(raw: string): string {
  const match = POST_TAG_RE.exec(raw);
  if (match?.[1]) return match[1].trim();

  // フォールバック: 最後の非空段落を使う
  const paragraphs = raw.split(/\n{2,}/).filter((p) => p.trim());
  const last = paragraphs.at(-1);
  if (last) return last.trim();

  if (!raw) throw new Error('opencode が空の出力を返しました');
  return raw;
}
