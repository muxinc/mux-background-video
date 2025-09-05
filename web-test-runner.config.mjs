// @ts-check
import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  groups: [
    {
      name: 'unit',
      files: 'test/unit/**/*.test.ts',
      testFramework: {
        config: { timeout: 5000 }
      }
    },
    {
      name: 'integration',
      files: 'test/integration/**/*.test.ts',
      testFramework: {
        config: { timeout: 30000 }
      }
    }
  ],
  concurrency: 1,
  nodeResolve: true,
  plugins: [
    esbuildPlugin({ ts: true, target: "esnext" })
  ],
  // @ts-ignore
  filterBrowserLogs: ({ args }) => !args[0]?.startsWith?.('Lit is in dev mode'),
};
