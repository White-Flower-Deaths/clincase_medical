import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/patients/:path*",
    "/cases/:path*",
    "/profile",
    "/profile/:path*",
  ],
};
