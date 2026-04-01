import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveProjectDir } from './utils.js';

const POST_TAG_RE = /<post>([\s\S]*?)<\/post>/i;

/** リポジトリルートの opencode.json から model フィールドを読む。読めない場合は undefined。 */
function readModelFromConfig(): string | undefined {
  try {
    const configPath = join(dirname(fileURLToPath(import.meta.url)), '../../..', 'opencode.json');
    const raw = readFileSync(configPath, 'utf8');
    const config = JSON.parse(raw) as { model?: string };
    return config.model;
  } catch {
    return undefined;
  }
}

interface Options {
  /** opencode に渡すモデル文字列（例: "ollama/llama3.2"）。未指定時は opencode のデフォルト設定に従う。 */
  model?: string;
  /** opencode を実行するプロジェクトディレクトリ。未指定時は SNS_PROJECT_DIR または cwd。 */
  projectDir?: string;
  /** opencode の最大待機時間（ms）。デフォルト 120 秒。 */
  timeoutMs?: number;
}

/**
 * opencode を `opencode run "<prompt>"` でヘッドレス呼び出しし、
 * プロジェクトを分析させて SNS 投稿テキストを生成する。
 *
 * プロンプトは <post>...</post> タグで囲んだ出力を要求する前提。
 * タグが見つからない場合は出力の最後の段落にフォールバックする。
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
    const args: string[] = ['run'];
    if (this.model) args.push('--model', this.model);
    args.push(prompt);

    const result = spawnSync('opencode', args, {
      encoding: 'utf8',
      cwd: this.projectDir,
      timeout: this.timeoutMs,
    });

    if (result.error) {
      const err = result.error as NodeJS.ErrnoException;
      if (err.code === 'ENOENT') {
        throw new Error(
          'opencode が見つかりません。インストールしてください: npm install -g opencode-ai',
        );
      }
      throw result.error;
    }

    if (result.status !== 0) {
      throw new Error(
        `opencode が終了コード ${String(result.status)} で失敗しました:\n${result.stderr}`,
      );
    }

    const raw = result.stdout.trim();
    return Promise.resolve(extractPost(raw));
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
