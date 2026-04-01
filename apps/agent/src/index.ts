#!/usr/bin/env node
/**
 * sns-agent — AI agent for sns-in-vscode
 *
 * Usage:
 *   sns-agent --help
 *   sns-agent run          Run once and exit
 *   sns-agent start        Start as background daemon
 */

const [, , command, ...args] = process.argv;

function printHelp(): void {
  console.log(`sns-agent — SNS in VS Code AI agent

Usage:
  sns-agent run             Analyze project and generate posts (once)
  sns-agent start           Start background daemon (concurrent workers, no interval)

Environment:
  SNS_DB_PATH           Path to SQLite DB (default: ~/.sns-in-vscode/sns.db)
  SNS_PROJECT_DIR       Project root to analyze (default: cwd)
  SNS_AGENT_CONCURRENCY Number of parallel workers (default: 3)
`);
}

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command !== 'run' && command !== 'start') {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

if (command === 'run') {
  const { runOnce } = await import('./commands/run.js');
  await runOnce(args);
} else {
  const { startDaemon } = await import('./commands/start.js');
  await startDaemon(args);
}
