'use server';

import { signIn, signOut } from '@/lib/auth';
import { loginSchema } from '@/validations/user-schemas';
import { AuthError } from 'next-auth';

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
