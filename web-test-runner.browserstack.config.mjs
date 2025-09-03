import dotenv from 'dotenv';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { browserstackLauncher } from '@web/test-runner-browserstack';

dotenv.config();

// BrowserStack capabilities common to all devices
const browserstackCapabilities = {
  project: 'mux-background-video',
  build: `mux-background-video-${new Date().toISOString().split('T')[0]}`,
  'browserstack.debug': true,
  'browserstack.video': true,
  'browserstack.networkLogs': true,
  'browserstack.console': 'verbose',
  'browserstack.user': process.env.BROWSERSTACK_USERNAME,
  'browserstack.key': process.env.BROWSERSTACK_ACCESS_KEY,
};

// Mobile device configurations
const mobileDevices = [
  // iOS devices
  {
    device: 'iPhone 15 Pro',
    os: 'ios',
    osVersion: '17',
    browserName: 'safari',
    browserVersion: 'latest',
  },
  {
    device: 'iPhone 14',
    os: 'ios',
    osVersion: '16',
    browserName: 'safari',
    browserVersion: 'latest',
  },
  {
    device: 'iPhone 12',
    os: 'ios',
    osVersion: '15',
    browserName: 'safari',
    browserVersion: 'latest',
  },
  // iPad devices
  {
    device: 'iPad Pro 12.9 2022',
    os: 'ios',
    osVersion: '17',
    browserName: 'safari',
    browserVersion: 'latest',
  },
  {
    device: 'iPad Air 2022',
    os: 'ios',
    osVersion: '16',
    browserName: 'safari',
    browserVersion: 'latest',
  },
  // Android devices
  {
    device: 'Samsung Galaxy S23',
    os: 'android',
    osVersion: '13.0',
    browserName: 'chrome',
    browserVersion: 'latest',
  },
  {
    device: 'Google Pixel 7',
    os: 'android',
    osVersion: '13.0',
    browserName: 'chrome',
    browserVersion: 'latest',
  },
  {
    device: 'OnePlus 9',
    os: 'android',
    osVersion: '12.0',
    browserName: 'chrome',
    browserVersion: 'latest',
  },
  {
    device: 'Samsung Galaxy Tab S8',
    os: 'android',
    osVersion: '12.0',
    browserName: 'chrome',
    browserVersion: 'latest',
  },
];

export default {
  files: 'test/**/*.test.ts',
  nodeResolve: true,
  plugins: [
    esbuildPlugin({ ts: true, target: "esnext" })
  ],
  browsers: mobileDevices.map(device => browserstackLauncher({
    capabilities: {
      ...device,
      ...browserstackCapabilities,
      name: device.device,
    }
  })),
  testFramework: {
    name: '@web/test-runner-mocha',
    options: {
      ui: 'bdd',
      timeout: 30000,
    },
  },
  // Test timeout and retry settings
  testRunnerHtml: testFramework => `
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mux Background Video Tests</title>
      </head>
      <body>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>
  `,
};
