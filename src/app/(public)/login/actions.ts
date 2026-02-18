'use server';

import { signIn, signOut } from '@/lib/auth';
import { loginSchema } from '@/validations/user-schemas';
import { AuthError } from 'next-auth';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

export type AuthActionResult = {
  success: boolean;
  error?: string;
};

export async function loginAction(formData: FormData): Promise<AuthActionResult> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: 'Invalid email or password format' };
  }

  // Rate limit by email to prevent brute-force attacks
  const rateLimitKey = `login:${parsed.data.email.toLowerCase()}`;
  const rateLimit = checkRateLimit(rateLimitKey, RATE_LIMITS.LOGIN);
  if (!rateLimit.allowed) {
    const retryMinutes = Math.ceil(rateLimit.retryAfterMs / 60000);
    return {
      success: false,
      error: `Too many login attempts. Please try again in ${retryMinutes} minute${retryMinutes !== 1 ? 's' : ''}.`,
    };
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid email or password' };
        default:
          return { success: false, error: 'An authentication error occurred' };
      }
    }
    throw error;
  }
}

export async function logoutAction() {
  await signOut({ redirect: false });
}
