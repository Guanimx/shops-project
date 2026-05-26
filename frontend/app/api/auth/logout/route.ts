import { NextRequest, NextResponse } from "next/server";

function clearAuthCookies(response: NextResponse) {
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function POST(_req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  clearAuthCookies(response);
  return response;
}
