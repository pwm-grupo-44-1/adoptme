import type { CapacitorConfig } from '@capacitor/cli';

const liveReloadUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: 'com.adoptme.app',
  appName: 'AdoptMe',
  webDir: 'dist/angular-version/browser',
  bundledWebRuntime: false,
  ...(liveReloadUrl
    ? {
        server: {
          url: liveReloadUrl,
          cleartext: true
        }
      }
    : {})
};

export default config;
