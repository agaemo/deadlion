import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { createAuthorize } from "@/lib/auth/authorize";

const authorize = createAuthorize(db);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        username: { label: "ユーザー名", type: "text" },
        password: { label: "パスワード", type: "password" },
      },
      authorize: async (credentials) => {
        return authorize(credentials?.username, credentials?.password);
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // NextAuth v5 beta: user 型に isAdmin/mustChangePassword が含まれるが
        // 型定義の制限により unknown になるため明示的にキャストする
        const u = user as { isAdmin?: boolean; mustChangePassword?: boolean };
        token.isAdmin = u.isAdmin ?? false;
        token.mustChangePassword = u.mustChangePassword ?? false;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.sub ?? "";
      session.user.isAdmin = (token.isAdmin as boolean) ?? false;
      session.user.mustChangePassword =
        (token.mustChangePassword as boolean) ?? false;
      return session;
    },
  },
});
