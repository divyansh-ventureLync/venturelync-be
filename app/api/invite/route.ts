import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, role, userType } = body;

    if (!name || !email || !role || !userType) {
      return NextResponse.json(
        { error: 'Name, email, role, and user type are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const inviteCode = generateInviteCode();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const { data: inviteCodeData, error: codeError } = await supabase
      .from('invite_codes')
      .insert({
        code: inviteCode,
        expires_at: expiryDate.toISOString(),
      })
      .select()
      .single();

    if (codeError) {
      console.error('Error creating invite code:', codeError);
      return NextResponse.json(
        { error: 'Failed to generate invite code' },
        { status: 500 }
      );
    }

    const { data: requestData, error: requestError } = await supabase
      .from('invite_requests')
      .insert({
        name,
        email,
        company: company || '',
        role,
        user_type: userType,
        status: 'pending',
        invite_code: inviteCode,
        code_expiry: expiryDate.toISOString(),
      })
      .select()
      .single();

    if (requestError) {
      console.error('Error creating invite request:', requestError);
      return NextResponse.json(
        { error: 'Failed to save invite request' },
        { status: 500 }
      );
    }

    try {
      const welcomeEmailResponse = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-invite-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            type: 'welcome',
          }),
        }
      );

      if (!welcomeEmailResponse.ok) {
        console.error('Welcome email sending failed:', await welcomeEmailResponse.text());
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
    }

    return NextResponse.json(
      {
        message: 'Your application has been received! Check your email for a welcome message.',
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing invite request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
