import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, username, password } = body;
    const login = email || username;

    if (!login || !password) {
      return NextResponse.json(
        { message: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" },
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
        { message: "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง" },
        { status: res.status }
      );
    }

    const accessToken = data.accessToken || data.token;
    const refreshToken = data.refreshToken;
    const response = NextResponse.json({
      success: true,
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        image: data.image,
        role: data.role,
      },
    });

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
