import NextAuth from "next-auth"
import authConfig from "./auth.config"
 
export const { auth: middleware } = NextAuth(authConfig)

// Filter Middleware to avoid API routes and static assets
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
