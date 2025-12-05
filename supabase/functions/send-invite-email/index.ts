import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, type, inviteCode } = await req.json();

    if (!email || !type) {
      throw new Error('Email and type are required');
    }

    let emailBody = '';
    let subject = '';

    if (type === 'welcome') {
      subject = 'Welcome to VentureLync - Application Received';
      emailBody = `
        <html>
          <body style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafafa;">
            <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <h1 style="color: #00008B; margin-bottom: 24px; font-size: 28px;">Welcome to VentureLync</h1>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
                Dear Builder,
              </p>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
                Thank you for your interest in joining VentureLync. We have received your invitation request and are excited to review your application.
              </p>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
                VentureLync is a private community built for clarity, not spectacle. A space where signal rises, where the right people meet without noise, and where progress speaks louder than performance.
              </p>
              
              <div style="background: #f9fafb; border-left: 4px solid #00008B; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <p style="color: #1f2937; margin: 0; line-height: 1.6;">
                  <strong>What's Next?</strong><br/>
                  Our team will review your application within 48 hours. Once approved, you'll receive your unique invite code to join our community of executioners.
                </p>
              </div>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
                We care about excellence, effort, and intent. If you're here, it's because you share these values.
              </p>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                Thank you for being part of this journey.
              </p>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
                <p style="color: #374151; margin: 0;">Best regards,</p>
                <p style="color: #00008B; font-weight: 600; margin: 8px 0 0 0;">Saswat Mohanty</p>
                <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">Founder, VentureLync</p>
              </div>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </body>
        </html>
      `;
    } else if (type === 'approval') {
      if (!inviteCode) {
        throw new Error('Invite code is required for approval emails');
      }
      
      subject = 'Your VentureLync Invite Code - Join the Community';
      const appUrl = Deno.env.get('APP_URL') || 'https://venturelync.com';
      emailBody = `
        <html>
          <body style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #fafafa;">
            <div style="background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <h1 style="color: #00008B; margin-bottom: 24px; font-size: 28px;">You're In. Welcome to VentureLync.</h1>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
                Dear Executioner,
              </p>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                Your application has been approved. You are now part of an invite-only circle built for clarity, not spectacle.
              </p>
              
              <div style="background: linear-gradient(135deg, #00008B 0%, #000066 100%); padding: 32px; margin: 32px 0; border-radius: 12px; text-align: center;">
                <p style="color: #ffffff; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Your Exclusive Invite Code</p>
                <h2 style="margin: 0; color: #ffffff; letter-spacing: 4px; font-size: 32px; font-weight: 700;">${inviteCode}</h2>
                <p style="color: #a5b4fc; margin: 16px 0 0 0; font-size: 13px;">Valid for 7 days</p>
              </div>
              
              <div style="text-align: center; margin: 32px 0;">
                <a href="${appUrl}/signup" style="display: inline-block; background: #00008B; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Join VentureLync →</a>
              </div>
              
              <div style="background: #f9fafb; padding: 24px; margin: 32px 0; border-radius: 8px;">
                <p style="color: #1f2937; margin: 0 0 16px 0; font-weight: 600; font-size: 16px;">What awaits you inside:</p>
                <ul style="color: #374151; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>A quiet room where your work is respected</li>
                  <li>Connect with founders and investors who value execution over performance</li>
                  <li>Track your journey with our XP system that rewards genuine contribution</li>
                  <li>Build relationships based on demonstrated momentum, not polished narratives</li>
                </ul>
              </div>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 16px; font-style: italic; border-left: 4px solid #00008B; padding-left: 16px;">
                "A space where signal rises, where the right people meet without noise, and where progress speaks louder than performance."
              </p>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 16px;">
                Your code is valid for 7 days. Use it to complete your registration and step into a community that stands behind intent, not spectacle.
              </p>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 24px;">
                Let us build a better venture world together.
              </p>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
                <p style="color: #374151; margin: 0;">Sincerely,</p>
                <p style="color: #00008B; font-weight: 600; margin: 8px 0 0 0;">Saswat Mohanty</p>
                <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">Founder, VentureLync</p>
                <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0 0;">Bengaluru, IND</p>
              </div>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
              This is an automated message. Please do not reply to this email.
            </p>
          </body>
        </html>
      `;
    } else {
      throw new Error('Invalid email type');
    }

    console.log(`Sending ${type} email to ${email}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${type} email sent successfully`,
        email: emailBody,
        subject: subject,
        note: 'In production, integrate with email service like Resend, SendGrid, or Postmark'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});