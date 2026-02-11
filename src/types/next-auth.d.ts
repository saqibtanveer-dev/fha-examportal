import type { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      isActive: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    isActive: boolean;
  }
}
