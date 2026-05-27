import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/serverApi";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      const response = NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return response;
    }

    const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      const response = NextResponse.json(
        { message: data.message || "Failed to fetch profile" },
        { status: res.status }
      );
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return response;
    }

    const response = NextResponse.json({
      id: data.id,
      firstName: data.firstName,
      lastName: data.lastName,
      username: data.username,
      email: data.email,
      phone: data.phone,
      image: data.image,
      role: data.role,
    });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch {
    const response = NextResponse.json({ message: "Internal server error" }, { status: 500 });
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }
}
