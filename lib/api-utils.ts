import { NextResponse } from "next/server";

export function apiError(
  logTag: string,
  error: unknown,
  message = "Server error",
  status = 500,
) {
  console.error(`[${logTag}]`, error);
  if (process.env.NODE_ENV !== "production") {
    const detail = (error && (error as any).message) || String(error);
    return NextResponse.json({ error: message, detail }, { status });
  }
  return NextResponse.json({ error: message }, { status });
}
