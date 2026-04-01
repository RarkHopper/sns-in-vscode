#!/usr/bin/env node
/**
 * sns — CLI for sns-in-vscode
 *
 * Usage:
 *   sns --help
 *   sns post "<text>"
 *   sns timeline [--limit N] [--format json|text]
 */

const [, , command, ...args] = process.argv;

function printHelp(): void {
  console.log(`sns — SNS in VS Code CLI

Usage:
  sns post "<text>"                  Post a message
  sns timeline [--limit N]           Show timeline (default: 20)
               [--format json|text]

Options:
  -h, --help   Show this help
`);
}

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command !== 'post' && command !== 'timeline') {
  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exit(1);
}

// Lazy-load subcommands to keep startup fast
if (command === 'post') {
  const { runPost } = await import('./commands/post.js');
  runPost(args);
} else {
  const { runTimeline } = await import('./commands/timeline.js');
  runTimeline(args);
}
