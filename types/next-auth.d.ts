import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isAdmin: boolean;
      mustChangePassword: boolean;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/types" {
  interface User {
    isAdmin: boolean;
    mustChangePassword: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    isAdmin: boolean;
    mustChangePassword: boolean;
  }
}
