import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("sessionToken")?.value;

    if (sessionToken) {
      // Delete session from Supabase
      await supabase
        .from("sessions")
        .delete()
        .eq("session_token", sessionToken);
    }

    // Clear cookie
    const response = NextResponse.json(
      { status: "success", message: "Logged out successfully" },
      { status: 200 }
    );

    response.cookies.delete("sessionToken");

    return response;
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
