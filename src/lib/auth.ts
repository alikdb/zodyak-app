import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const SESSION_COOKIE = "zodyak_session";
const APP_PASSWORD = process.env.APP_PASSWORD ?? "zodyak2025";

export function checkPassword(password: string): boolean {
  return password === APP_PASSWORD;
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE);
  return session?.value === "authenticated";
}

export { SESSION_COOKIE };
