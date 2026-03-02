import { z } from 'zod/v4';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required'),
  AUTH_URL: z.string().url('AUTH_URL must be a valid URL').optional(),
  OPENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL').optional(),
  ADMIN_INITIAL_PASSWORD: z.string().min(8, 'ADMIN_INITIAL_PASSWORD must be at least 8 chars').optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // SMTP Email Configuration
  EMAIL_HOST: z.string().default('smtp.gmail.com'),
  EMAIL_PORT: z.coerce.number().default(587),
  EMAIL_HOST_USER: z.string().optional(),
  EMAIL_HOST_PASSWORD: z.string().optional(),
  DEFAULT_FROM_EMAIL: z.string().default('noreply@examcore.app'),
  DEFAULT_FROM_NAME: z.string().default('ExamCore'),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables. Check server logs.');
  }

  return parsed.data;
}

export const env = validateEnv();
