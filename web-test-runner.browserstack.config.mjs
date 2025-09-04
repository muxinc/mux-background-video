import dotenv from 'dotenv';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { browserstackLauncher } from '@web/test-runner-browserstack';

dotenv.config();

// BrowserStack capabilities common to all devices
const browserstackCapabilities = {
  project: 'mux-background-video',
  build: `mux-background-video-${process.env.GITHUB_RUN_NUMBER || new Date().toISOString().split('T')[0]}`,
  // 'browserstack.debug': true,
  // 'browserstack.video': true,
  // 'browserstack.networkLogs': true,
  // 'browserstack.console': 'verbose',
  'browserstack.user': process.env.BROWSERSTACK_USERNAME,
  'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
};

// Mobile device configurations
const mobileDevices = {
  'iphone-15-pro': {
    device: 'iPhone 15 Pro',
    os: 'ios',
    osVersion: '17',
    browserName: 'safari',
    browserVersion: 'latest',
  },
  'iphone-14': {
    device: 'iPhone 14',
    os: 'ios',
    osVersion: '16',
    browserName: 'safari',
    browserVersion: 'latest',
  },
  'iphone-12': {
    device: 'iPhone 12',
    os: 'ios',
    osVersion: '15',
    browserName: 'safari',
    browserVersion: 'latest',
  },
  'ipad-air-13-2025': {
    device: 'iPad Air 13 2025',
    os: 'ios',
    osVersion: '18',
    browserName: 'safari',
    browserVersion: 'latest',
  },
  'ipad-pro-12-9-2022': {
    device: 'iPad Pro 12.9 2022',
    os: 'ios',
    osVersion: '16',
    browserName: 'safari',
    browserVersion: 'latest',
  },
  'google-pixel-10-pro': {
    device: 'Google Pixel 10 Pro',
    os: 'android',
    osVersion: '16.0',
    browserName: 'chrome',
    browserVersion: 'latest',
  },
  'samsung-galaxy-s23': {
    device: 'Samsung Galaxy S23',
    os: 'android',
    osVersion: '13.0',
    browserName: 'chrome',
    browserVersion: 'latest',
  },
  'oneplus-9': {
    device: 'OnePlus 9',
    os: 'android',
    osVersion: '12.0',
    browserName: 'chrome',
    browserVersion: 'latest',
  },
};

// Get device from command line argument or environment variable
const deviceKey = process.env.TEST_DEVICE;

let browsers;

if (deviceKey) {
  // Single device testing
  if (!mobileDevices[deviceKey]) {
    console.error('Please specify a valid device key:');
    console.error('Available devices:', Object.keys(mobileDevices).join(', '));
    process.exit(1);
  }
  
  const device = mobileDevices[deviceKey];
  browsers = [
    browserstackLauncher({
      capabilities: {
        ...device,
        ...browserstackCapabilities,
        name: `${device.device} - ${deviceKey}`,
      }
    })
  ];
} else {
  // All devices testing
  browsers = Object.entries(mobileDevices).map(([key, device]) => 
    browserstackLauncher({
      capabilities: {
        ...device,
        ...browserstackCapabilities,
        name: device.device,
      }
    })
  );
}

export default {
  files: 'test/integration/playback.test.ts',
  nodeResolve: true,
  plugins: [
    esbuildPlugin({ ts: true, target: "esnext" })
  ],
  concurrentBrowsers: deviceKey ? 1 : 1, // Single browser for device-specific, 1 for all devices
  browsers,
  filterBrowserLogs: ({ args }) => !args[0]?.startsWith?.('Lit is in dev mode'),
};
