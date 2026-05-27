import { NextResponse } from "next/server";

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

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  clearAuthCookies(response);
  return response;
}
