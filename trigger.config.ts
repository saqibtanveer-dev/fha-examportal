import { defineConfig } from '@trigger.dev/sdk/v3';
import { prismaExtension } from '@trigger.dev/build/extensions/prisma';

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF ?? 'proj_wxgnqcfeevxyucxnccrv',
  maxDuration: 3600,
  dirs: ['./src/modules/reports/workflows', './src/modules/fees/workflows'],
  build: {
    extensions: [
      prismaExtension({
        mode: 'legacy',
        schema: './prisma/schema.prisma',
      }),
    ],
  },
});
