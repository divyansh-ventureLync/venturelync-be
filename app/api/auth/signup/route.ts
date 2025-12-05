import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { email, password, inviteCode } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check invite code if provided
    let userId: string | null = null;
    if (inviteCode) {
      const { data: inviteData } = await supabase
        .from("invite_codes")
        .select("*")
        .eq("code", inviteCode.toUpperCase())
        .maybeSingle();

      if (!inviteData) {
        // Generate new invite code for waitlist
        const generatedCode = `INVITE${Date.now()
          .toString(36)
          .toUpperCase()}${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`;

        await supabase.from("invite_codes").insert({ code: generatedCode });

        await supabase.from("waitlist").insert({
          email,
          invite_code: generatedCode,
          invite_sent: false,
        });

        return NextResponse.json(
          {
            status: "waitlisted",
            email,
            inviteCode: generatedCode,
          },
          { status: 202 }
        );
      }

      if (inviteData.used_by) {
        return NextResponse.json(
          { error: "This invite code has already been used" },
          { status: 400 }
        );
      }
    }

    // Generate a simple UUID for user ID
    const newUserId = crypto.randomUUID();

    // Create user in profiles table with hashed password
    const { error: profileError } = await supabase.from("profiles").insert({
      id: newUserId,
      email,
      password_hash: hashedPassword,
      profile_completed: false,
    });

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }

    // Mark invite code as used
    if (inviteCode) {
      await supabase
        .from("invite_codes")
        .update({
          used_by: newUserId,
          used_at: new Date().toISOString(),
        })
        .eq("code", inviteCode.toUpperCase());
    }

    // Return success without storing password
    return NextResponse.json(
      {
        status: "success",
        message: "User created successfully",
        userId: newUserId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
