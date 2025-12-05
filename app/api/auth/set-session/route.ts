import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { sessionToken } = await request.json();

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Session token is required" },
        { status: 400 }
      );
    }

    // Create response
    const response = NextResponse.json(
      { status: "success", message: "Session set" },
      { status: 200 }
    );

    // Set httpOnly cookie with session token
    // 30 days expiration
    response.cookies.set({
      name: "sessionToken",
      value: sessionToken,
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Set session error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
