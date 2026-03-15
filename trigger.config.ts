import { defineConfig } from '@trigger.dev/sdk/v3';

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? 'tr_dev_replace_me',
  maxDuration: 3600,
  dirs: ['./src/modules/reports/workflows', './src/modules/fees/workflows'],
});
