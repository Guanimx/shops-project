import { cookies } from "next/headers";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token");
  if (!token) redirect("/login");

  const headerStore = await headers();
  const host = headerStore.get("host");
  const protocol = headerStore.get("x-forwarded-proto") || "http";

  if (!host) redirect("/login");

  const res = await fetch(`${protocol}://${host}/api/auth/me`, {
    headers: { Cookie: `auth_token=${token.value}` },
    cache: "no-store",
  });

  if (!res.ok) redirect("/login");
  const user = await res.json();

  return <ProfileClient user={user} />;
}
