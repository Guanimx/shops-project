import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password } = body;
    const login = email || username;

    if (!login || !password) {
      return NextResponse.json(
        { message: "Username or email and password are required" },
        { status: 400 }
      );
    }

    const res = await fetch(`${getApiBaseUrl()}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: login, password, expiresInMins: 60 }),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Invalid credentials" },
        { status: res.status }
      );
    }

    const response = NextResponse.json(data);
    const accessToken = data.accessToken || data.token;
    const refreshToken = data.refreshToken;

    if (accessToken) {
      response.cookies.set("auth_token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60,
        path: "/",
      });
    }

    if (refreshToken) {
      response.cookies.set("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        message: "Internal server error",
        detail: process.env.NODE_ENV !== "production" && error instanceof Error ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
