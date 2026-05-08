import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const port = Number.parseInt(process.argv[2] ?? '4200', 10);

if (!Number.isInteger(port) || port <= 0) {
  console.error('Invalid port. Usage: node ./scripts/adb-reverse.mjs [port]');
  process.exit(1);
}

function resolveAdbCommand() {
  const sdkRoots = [
    process.env.ANDROID_SDK_ROOT,
    process.env.ANDROID_HOME,
    process.env.LOCALAPPDATA
      ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk')
      : undefined
  ].filter(Boolean);

  for (const sdkRoot of sdkRoots) {
    const adbPath = path.join(sdkRoot, 'platform-tools', process.platform === 'win32' ? 'adb.exe' : 'adb');
    if (existsSync(adbPath)) {
      return adbPath;
    }
  }

  return process.platform === 'win32' ? 'adb.exe' : 'adb';
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit'
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function getConnectedDevices(command) {
  const result = spawnSync(command, ['devices'], {
    encoding: 'utf8'
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }

  return result.stdout
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [serial, state] = line.split(/\s+/);
      return { serial, state };
    });
}

const adbCommand = resolveAdbCommand();

run(adbCommand, ['start-server']);
const devices = getConnectedDevices(adbCommand);
const onlineDevices = devices.filter((device) => device.state === 'device');

if (onlineDevices.length === 0) {
  const offlineDevices = devices.filter((device) => device.state === 'offline');
  if (offlineDevices.length > 0) {
    console.error('ADB found a device in offline state. Reconnect the phone and accept the USB debugging prompt, then rerun the command.');
  } else {
    console.error('No Android device detected by ADB. Connect the phone with USB debugging enabled, then rerun the command.');
  }
  process.exit(1);
}

run(adbCommand, ['reverse', `tcp:${port}`, `tcp:${port}`]);

console.log(`adb reverse ready on tcp:${port}.`);
