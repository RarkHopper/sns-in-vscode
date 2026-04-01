import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILLS_DIR = join(fileURLToPath(import.meta.url), '..', '..', '..', '..', 'skills');

export interface Skill {
  name: string;
  description: string;
  content: string;
}

export function loadSkills(): Skill[] {
  let files: string[];
  try {
    files = readdirSync(SKILLS_DIR).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }

  return files.map((file) => {
    const content = readFileSync(join(SKILLS_DIR, file), 'utf8');
    const nameMatch = /^name:\s*(.+)$/m.exec(content);
    const descMatch = /^description:\s*(.+)$/m.exec(content);
    return {
      name: nameMatch?.[1]?.trim() ?? file.replace('.md', ''),
      description: descMatch?.[1]?.trim() ?? '',
      content,
    };
  });
}

export function buildSkillsSection(skills: Skill[]): string {
  if (skills.length === 0) return '';
  return [
    '## Available Skills',
    '',
    ...skills.map((s) => `### ${s.name}\n${s.description}\n\n${s.content}`),
  ].join('\n');
}
