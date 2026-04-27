import { NextResponse } from "next/server";

const REALM = "VoiceAI Receptionists Dashboard";

function unauthorizedResponse() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  });
}

export function middleware(request) {
  const password = process.env.DASHBOARD_PASSWORD;
  if (!password) {
    return new NextResponse(
      "DASHBOARD_PASSWORD env var not configured",
      { status: 500 }
    );
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Basic ")) {
    return unauthorizedResponse();
  }

  const encoded = authHeader.slice(6).trim();
  let decoded;
  try {
    decoded = atob(encoded);
  } catch {
    return unauthorizedResponse();
  }

  const colonIdx = decoded.indexOf(":");
  if (colonIdx < 0) return unauthorizedResponse();
  const supplied = decoded.slice(colonIdx + 1);

  if (supplied !== password) {
    return unauthorizedResponse();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/calls/:path*", "/api/recordings/:path*"],
};
