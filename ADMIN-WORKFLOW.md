# Admin Workflow Guide

## Invite Request & Approval Process

### Overview
VentureLync uses a two-step email process to welcome and approve new members:

1. **Welcome Email** - Sent immediately when someone requests an invite
2. **Approval Email** - Sent when admin approves the request with the invite code

---

## Step-by-Step Workflow

### 1. User Requests Invite

**What happens:**
- User fills out the form at `/request-invite`
- System creates a pending invite request in the database
- **Welcome email** is automatically sent to the user's email

**Welcome Email Contains:**
- Confirmation that application was received
- Information about the 48-hour review process
- Introduction to VentureLync's values and mission
- Signed by Saswat Mohanty, Founder

### 2. Admin Reviews Request

**Access the admin panel:**
- Navigate to: `/admin/invites`
- Requires authentication (only accessible to authorized admins)

**Admin Panel Features:**
- View all invite requests
- Filter by status: All, Pending, Approved, Rejected
- Search by name, email, or company
- See user type (Founder or Investor)

### 3. Admin Approves Request

**When admin clicks "Approve":**

1. System generates a unique 10-character invite code
2. Code is set to expire in 7 days
3. Invite code is saved to the database
4. Request status is updated to "approved"
5. **Approval email** is automatically sent to the user

**Approval Email Contains:**
- The unique invite code (valid for 7 days)
- Direct link to signup page
- Welcome message about joining the community
- Information about what awaits them in VentureLync
- Motivational messaging about execution and community
- Signed by Saswat Mohanty, Founder

### 4. User Signs Up

**User receives approval email and:**
- Clicks the signup link in the email
- Enters the invite code on the signup page
- Completes their profile
- Joins the VentureLync community

---

## Email Templates

### Welcome Email (Immediate)
**Subject:** Welcome to VentureLync - Application Received

**Key Points:**
- Thank you message
- Application received confirmation
- 48-hour review timeline
- Introduction to VentureLync's mission
- Professional branding and signature

### Approval Email (After Admin Approval)
**Subject:** Your VentureLync Invite Code - Join the Community

**Key Points:**
- Congratulations on approval
- Prominently displayed invite code
- 7-day validity notice
- Direct signup link
- Description of what's inside VentureLync
- Motivational community messaging
- Professional branding and signature

---

## Admin Actions

### Approve
- Generates invite code
- Sets 7-day expiration
- Updates status to "approved"
- Sends approval email automatically

### Reject
- Updates status to "rejected"
- No email is sent
- User can reapply if needed

---

## Technical Details

### Invite Code
- **Format:** 10 uppercase alphanumeric characters (e.g., `A3K9M7B2N1`)
- **Validity:** 7 days from approval
- **Single-use:** Each code can only be used once
- **Secure:** Stored in `invite_codes` table with proper RLS

### Email Sending
- **Service:** Supabase Edge Function `send-invite-email`
- **Endpoint:** `/functions/v1/send-invite-email`
- **Types:** `welcome` and `approval`
- **Retry:** Errors are logged but don't block the approval process

### Database Tables
- **invite_requests:** Stores all invite applications
- **invite_codes:** Stores generated codes with expiration
- **profiles:** Linked after successful signup

---

## Troubleshooting

### User didn't receive welcome email
- Check spam/junk folder
- Verify email address was entered correctly
- Email system logs errors in console

### User didn't receive approval email
- Check admin console logs for errors
- Verify user's email in the database
- Check that approval was completed successfully
- User can still use the invite code shown in admin panel

### Invite code expired
- Admin can approve the request again to generate a new code
- New approval will send a fresh email with new code

---

## Security Considerations

✅ **Enabled:**
- Row Level Security on all tables
- Restrictive RLS policies
- Invite-only system
- Secure invite code generation
- Time-limited codes (7 days)

⚠️ **Action Required:**
- Enable Password Breach Detection in Supabase Dashboard
- See SECURITY-NOTES.md for details

---

## Best Practices

1. **Review Applications Promptly**
   - Try to review within 48 hours as communicated to users
   - Check for quality signals in applications

2. **Monitor Approval Rate**
   - Track approval vs rejection rates
   - Adjust criteria as needed for community quality

3. **Code Expiration**
   - 7-day expiration encourages timely signup
   - Can re-approve if user needs more time

4. **Email Deliverability**
   - Monitor email logs
   - Set up production email service (Resend, SendGrid, or Postmark)
   - Test emails regularly

---

## Production Checklist

Before going live:

- [ ] Enable Password Breach Detection (see SECURITY-NOTES.md)
- [ ] Set up production email service integration
- [ ] Test complete workflow end-to-end
- [ ] Monitor email deliverability
- [ ] Set up admin notifications for new requests
- [ ] Document admin access procedures
- [ ] Regular security audits

---

## Support

For issues or questions about the admin workflow:
1. Check console logs for errors
2. Review database entries in Supabase dashboard
3. Test email endpoints directly
4. Verify Edge Function deployment
