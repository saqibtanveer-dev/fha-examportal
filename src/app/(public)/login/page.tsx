import { LoginForm } from './login-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <LoginForm />
    </div>
  );
}
