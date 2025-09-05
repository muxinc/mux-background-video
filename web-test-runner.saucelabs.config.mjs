import dotenv from 'dotenv';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { createSauceLabsLauncher } from '@web/test-runner-saucelabs';

dotenv.config({ quiet: true });

const saucelabsLauncher = createSauceLabsLauncher(
  {
    user: process.env.SAUCE_USERNAME ?? '',
    key: process.env.SAUCE_ACCESS_KEY ?? '',
  },
  // Sauce Labs capabilities common to all devices
  {
    build: `mux-background-video ${process.env.GITHUB_REF ?? 'local'} build ${
      process.env.GITHUB_RUN_NUMBER ?? ''
    }`,
    appiumVersion: 'stable',
  }
);

// Mobile device configurations
/* @type {Record<string, any>} */
const mobileDevices = {
  'iphone-15-pro': {
    'appium:options': {
      deviceName: 'iPhone 15 Pro',
      platformVersion: '17',
      automationName: 'XCUITest',
    },
    platformName: 'iOS',
    browserName: 'Safari',
    browserVersion: 'latest',
  },
  'iphone-14': {
    'appium:options': {
      deviceName: 'iPhone 14',
      platformVersion: '16',
      automationName: 'XCUITest',
    },
    platformName: 'iOS',
    browserName: 'Safari',
    browserVersion: 'latest',
  },
  'iphone-12': {
    'appium:options': {
      deviceName: 'iPhone 12',
      platformVersion: '15',
      automationName: 'XCUITest',
    },
    platformName: 'iOS',
    browserName: 'Safari',
    browserVersion: 'latest',
  },
  'ipad-air-13-2025': {
    'appium:options': {
      deviceName: 'iPad Air 13 2025',
      platformVersion: '18',
      automationName: 'XCUITest',
    },
    platformName: 'iOS',
    browserName: 'Safari',
    browserVersion: 'latest',
  },
  'ipad-pro-12-9-2022': {
    'appium:options': {
      deviceName: 'iPad Pro 12.9 2022',
      platformVersion: '16',
      automationName: 'XCUITest',
    },
    platformName: 'iOS',
    browserName: 'Safari',
    browserVersion: 'latest',
  },
  'google-pixel-10-pro': {
    'appium:options': {
      deviceName: 'Google Pixel 10 Pro',
      platformVersion: '16.0',
      automationName: 'UiAutomator2',
    },
    platformName: 'Android',
    browserName: 'Chrome',
    browserVersion: 'latest',
  },
  'samsung-galaxy-s23': {
    'appium:options': {
      deviceName: 'Samsung Galaxy S23',
      platformVersion: '13.0',
      automationName: 'UiAutomator2',
    },
    platformName: 'Android',
    browserName: 'Chrome',
    browserVersion: 'latest',
  },
  'oneplus-9': {
    'appium:options': {
      deviceName: 'OnePlus 9',
      platformVersion: '12.0',
      automationName: 'UiAutomator2',
    },
    platformName: 'Android',
    browserName: 'Chrome',
    browserVersion: 'latest',
  },
};

// Get device from command line argument or environment variable
const deviceKey = /** @type {keyof typeof mobileDevices} */ (process.env.TEST_DEVICE ?? '');

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
    saucelabsLauncher({
      'sauce:options': {
        name: `${device['appium:options'].deviceName}`,
      },
      ...device,
    }),
  ];
} else {
  // All devices testing
  browsers = Object.entries(mobileDevices).map(([key, device]) =>
    saucelabsLauncher({
      'sauce:options': {
        name: `${device['appium:options'].deviceName}`,
      },
      ...device,
    })
  );
}

export default {
  files: 'test/integration/playback.test.ts',
  nodeResolve: true,
  plugins: [esbuildPlugin({ ts: true, target: 'esnext' })],
  browsers,
  // @ts-ignore
  filterBrowserLogs: ({ args }) => !args[0]?.startsWith?.('Lit is in dev mode'),
};
