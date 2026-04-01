import { build, context } from 'esbuild';

const watch = process.argv.includes('--watch');

const extensionConfig = {
  bundle: true,
  entryPoints: ['src/extension.ts'],
  external: ['vscode'],
  format: 'cjs',
  logLevel: 'info',
  outfile: 'dist/extension.js',
  platform: 'node',
  sourcemap: true,
  target: 'node20',
};

if (watch) {
  const buildContext = await context(extensionConfig);
  await buildContext.watch();
  console.log('Watching vscode-extension...');
} else {
  await build(extensionConfig);
}
