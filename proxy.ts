import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const isLoginPage = pathname === "/login";
  const isChangePasswordPage = pathname === "/change-password";
  const isAdminPage = pathname.startsWith("/admin");

  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isLoggedIn) {
    const mustChangePassword = req.auth?.user?.mustChangePassword;
    if (mustChangePassword && !isChangePasswordPage) {
      return NextResponse.redirect(new URL("/change-password", req.nextUrl));
    }

    if (isAdminPage && !req.auth?.user?.isAdmin) {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icon\\.svg).*)",
  ],
};
