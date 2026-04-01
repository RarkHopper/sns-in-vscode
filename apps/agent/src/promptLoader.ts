import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROMPTS_DIR = join(fileURLToPath(import.meta.url), '..', '..', 'prompts');

export function loadPrompt(name: string, vars: Record<string, unknown>): string {
  const template = readFileSync(join(PROMPTS_DIR, `${name}.mustache`), 'utf8');
  return renderMustache(template, vars);
}

function renderMustache(template: string, vars: Record<string, unknown>): string {
  let result = template;

  // {{#section}}...{{/section}} block rendering
  result = result.replace(
    /\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g,
    (_match, key: string, block: string) => {
      const val = vars[key];
      if (!Array.isArray(val)) return '';
      return val.map((item: Record<string, unknown>) => renderMustache(block, item)).join('');
    },
  );

  // {{variable}} substitution
  result = result.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const val = vars[key];
    if (val === undefined || val === null) return '';
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
      return String(val);
    }
    return '';
  });

  return result;
}
