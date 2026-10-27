// Runs the automated tests in tests/*.test.ts with Node's built-in test runner.
// Each test file is bundled with esbuild (already installed with Vite), so no extra packages are needed.
//   npm test
import { createRequire } from 'module';
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
let esbuild;
try { esbuild = require('esbuild'); } catch { esbuild = require(process.env.ESBUILD_PATH ?? 'esbuild'); }

const out = '.test-out';
fs.rmSync(out, { recursive: true, force: true });
const only = process.argv[2];
const files = fs.readdirSync('tests').filter((f) => f.endsWith('.test.ts') && (!only || f.includes(only))).map((f) => path.join('tests', f));
await esbuild.build({
  entryPoints: files, bundle: true, platform: 'node', format: 'cjs', target: 'node18', outdir: out, outExtension: { '.js': '.cjs' },
  jsx: 'automatic', logLevel: 'warning', nodePaths: process.env.NODE_PATH ? process.env.NODE_PATH.split(':') : [],
  loader: { '.webp': 'file', '.png': 'file', '.woff': 'file', '.css': 'empty' }, assetNames: 'assets/[name]-[hash]',
  define: { 'process.env.NODE_ENV': '"test"' },
});
const r = spawnSync(process.execPath, ['--test', ...fs.readdirSync(out).filter((f) => f.endsWith('.cjs')).map((f) => path.join(out, f))], { stdio: 'inherit' });
process.exit(r.status ?? 1);
