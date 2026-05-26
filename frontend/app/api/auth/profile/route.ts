import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/serverApi";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const apiBaseUrl = getApiBaseUrl();
    const currentUserRes = await fetch(`${apiBaseUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const currentUserText = await currentUserRes.text();
    const currentUser = currentUserText ? JSON.parse(currentUserText) : {};

    if (!currentUserRes.ok) {
      return NextResponse.json(
        { message: currentUser.message || "Failed to fetch profile" },
        { status: currentUserRes.status }
      );
    }

    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const username = String(formData.get("username") || "").trim();
    const [firstName, ...lastNameParts] = name.split(/\s+/).filter(Boolean);

    const updateRes = await fetch(`${apiBaseUrl}/users/${currentUser.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        firstName: firstName || currentUser.firstName,
        lastName: lastNameParts.join(" ") || currentUser.lastName,
        email,
        phone,
        username,
      }),
    });

    const updateText = await updateRes.text();
    const updatedUser = updateText ? JSON.parse(updateText) : {};

    if (!updateRes.ok) {
      return NextResponse.json(
        { message: updatedUser.message || "Failed to update profile" },
        { status: updateRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        ...currentUser,
        ...updatedUser,
        image: currentUser.image,
        role: currentUser.role,
      },
    });
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
