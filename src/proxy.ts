import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Next.js 16 : `proxy` remplace la convention `middleware`.
export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/fermes/:path*"],
};
