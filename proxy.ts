import NextAuth from "next-auth"
import authConfig from "./auth.config"
 
const { auth: proxy } = NextAuth(authConfig)

export default proxy;

// Filter Middleware to avoid API routes and static assets
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};