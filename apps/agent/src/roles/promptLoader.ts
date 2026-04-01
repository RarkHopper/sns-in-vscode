import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import Mustache from 'mustache';
import type { PromptContext } from './PostRole.js';

const PROMPTS_DIR = join(dirname(fileURLToPath(import.meta.url)), '../../prompts/roles');

/** prompts/roles/<name>.md を mustache でレンダリングして返す。 */
export function loadRolePrompt(name: string, context: PromptContext): string {
  const template = readFileSync(join(PROMPTS_DIR, `${name}.md`), 'utf8');
  return Mustache.render(template, context);
}
