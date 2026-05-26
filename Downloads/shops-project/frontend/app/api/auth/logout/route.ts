import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/serverApi";

function clearAuthCookies(response: NextResponse) {
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    const res = await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
      method: "POST",
      headers: token ? { Cookie: `auth_token=${token}` } : undefined,
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    const response = NextResponse.json(data, { status: res.status });
    const setCookie = res.headers.get("set-cookie");

    if (setCookie) {
      response.headers.append("set-cookie", setCookie);
    }

    clearAuthCookies(response);
    return response;
  } catch {
    const response = NextResponse.json({ success: true, message: "Logged out locally" });
    clearAuthCookies(response);
    return response;
  }
}
