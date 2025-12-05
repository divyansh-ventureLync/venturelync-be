import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // List of protected routes
  const protectedRoutes = ["/feed", "/onboarding", "/profile", "/connections", "/founders", "/investors", "/post"];
  
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get("sessionToken")?.value;

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Verify session exists in Supabase
    const { data: session, error } = await supabase
      .from("sessions")
      .select("id, user_id, expires_at")
      .eq("session_token", sessionToken)
      .maybeSingle();

    if (error || !session) {
      // Session not found, redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("sessionToken");
      return response;
    }

    // Check if session is expired
    const expiresAt = new Date(session.expires_at);
    if (expiresAt < new Date()) {
      // Session expired, delete it and redirect to login
      await supabase
        .from("sessions")
        .delete()
        .eq("id", session.id);

      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("sessionToken");
      return response;
    }

    // Update last_activity timestamp
    await supabase
      .from("sessions")
      .update({ last_activity: new Date().toISOString() })
      .eq("id", session.id);

    // Add user info to request headers for use in pages/components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", session.user_id);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/feed/:path*", "/onboarding/:path*", "/profile/:path*", "/connections/:path*", "/founders/:path*", "/investors/:path*", "/post/:path*"],
};
