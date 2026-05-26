import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/serverApi";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const res = await fetch(`${getApiBaseUrl()}/api/auth/me`, {
      headers: {
        Cookie: `auth_token=${token}`,
      },
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    const setCookie = res.headers.get("set-cookie");

    if (!res.ok) {
      const response = NextResponse.json(
        { message: data.message || "Failed to fetch profile" },
        { status: res.status }
      );
      if (setCookie) {
        response.headers.append("set-cookie", setCookie);
      }

      return response;
    }

    const response = NextResponse.json(data);
    if (setCookie) {
      response.headers.append("set-cookie", setCookie);
    }

    return response;
  } catch {
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
