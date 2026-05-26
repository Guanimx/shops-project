import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const res = await fetch(`${getApiBaseUrl()}/api/auth/profile`, {
      method: "POST",
      headers: {
        Cookie: `auth_token=${token}`,
      },
      body: formData,
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    const response = NextResponse.json(data, { status: res.status });
    const setCookie = res.headers.get("set-cookie");

    if (setCookie) {
      response.headers.append("set-cookie", setCookie);
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
