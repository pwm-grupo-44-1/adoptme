import { spawnSync } from 'node:child_process';

const port = Number.parseInt(process.argv[2] ?? '4200', 10);

if (!Number.isInteger(port) || port <= 0) {
  console.error('Invalid port. Usage: node ./scripts/android-live-prep.mjs [port]');
  process.exit(1);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    ...options
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const npxCommand = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const nodeCommand = process.execPath;
const env = {
  ...process.env,
  CAP_SERVER_URL: `http://localhost:${port}`
};

run(npxCommand, ['cap', 'sync', 'android'], { env });
run(nodeCommand, ['./scripts/adb-reverse.mjs', String(port)]);

console.log(`Live reload prepared for Android on http://localhost:${port}.`);
