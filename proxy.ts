import { auth } from "./auth";

export default auth; 

// Filter Proxy to avoid API routes and static assets
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};