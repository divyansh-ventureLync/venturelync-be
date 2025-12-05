# VentureLync - Implementation Guide

## Overview

This guide explains how the key systems work in VentureLync, enabling future developers to understand and extend the platform.

---

## 1. XP System Architecture

### Founder XP Flow

```typescript
// When a founder creates a post:
1. User clicks "Create Post" → Opens CreatePostModal
2. Selects category (Build, Traction, Team, Reflection, Setback)
3. System checks daily limits via checkDailyLimits(userId, category, 'founder')
4. If allowed:
   - Calculate XP via calculateXPForCategory(category)
   - Create post in database
   - Award XP via awardXP(userId, xpAmount, 'post', postId)
   - Update daily XP tracker
   - Calculate streak bonus via calculateAndUpdateStreak(userId)
   - Update user's total_xp and current_level
   - Log to xp_events table
```

**Daily Limits (Founders)**:
- Total: 50 XP/day
- Reflections: Max 3/day
- Setbacks: Max 1/day

### Investor XP Flow

```typescript
// Example: Investor upvotes a post
1. User clicks heart icon on post
2. System checks: await checkIdempotency(key)
3. If not duplicate:
   - Award 8 XP via awardXP(userId, 8, 'upvote', postId)
   - Insert upvote record
   - Increment post upvotes_count
   - Log with idempotency_key to prevent double-XP
```

**Key Investor Actions**:
- `upvotePost`: 8 XP
- `createComment`: 30 XP
- `replyComment`: 20 XP
- `mentorMessage`: 80 XP
- `investCommit`: 1000 XP

**Daily Cap**: 1500 XP (soft cap)

### XP Calculation Functions

**Location**: `lib/xpEngine.ts`

```typescript
// Calculate XP for post category
calculateXPForCategory(category: string): number

// Check if user can earn more XP today
checkDailyLimits(userId, category, userType): Promise<{allowed, reason}>

// Award XP and update level
awardXP(userId, xpAmount, eventType, postId?, description?): Promise<{xpAwarded, leveledUp, newLevel}>

// Calculate and update posting streak
calculateAndUpdateStreak(userId): Promise<{streak, bonusXP}>

// Update daily XP tracker
updateDailyXP(userId, xpAmount, category): Promise<void>

// Calculate user's level from total XP
calculateLevel(totalXP): number

// Get level label
getLevelLabel(level): string
```

### Level Progression

```typescript
const LEVEL_THRESHOLDS = [
  { level: 1, min: 0, max: 100, label: 'Active Learner' },
  { level: 2, min: 100, max: 300, label: 'Builder' },
  { level: 3, min: 300, max: 700, label: 'Experienced Operator' },
  { level: 4, min: 700, max: 2000, label: 'High Credibility' },
  { level: 5, min: 2000, max: 5000, label: 'Elite Executor' },
];
```

### XP Animation

**Component**: `components/XPCelebration.tsx`

```tsx
<XPCelebration
  xpAmount={10}
  show={true}
  onComplete={() => setShowXP(false)}
  leveledUp={false}
  newLevel={undefined}
/>
```

**Features**:
- Floating animation with Framer Motion
- 2.5 second duration
- 12 confetti particles
- Rotating Zap icon
- Level up indicator
- Auto-dismisses

---

## 2. Comment Ranking Algorithm

### Implementation

**Location**: `lib/xpEngine.ts`

```typescript
export function calculateCommentRelevanceScore(
  commentContent: string,
  authorLevel: number,
  createdAt: string,
  upvotes: number
): number {
  const relevanceScore = commentContent.length > 50 ? 1.0 : 0.5;
  const recencyWeight = calculateRecencyWeight(createdAt);
  const upvoteBoost = Math.log10(upvotes + 1) * 0.5;

  const compositeScore =
    relevanceScore * (Math.log10(authorLevel + 1) + 1) +
    recencyWeight +
    upvoteBoost;

  return compositeScore;
}

function calculateRecencyWeight(createdAt: string): number {
  const now = new Date();
  const created = new Date(createdAt);
  const hoursSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

  if (hoursSince < 1) return 1.0;
  if (hoursSince < 24) return 0.8;
  if (hoursSince < 168) return 0.5;
  return 0.2;
}
```

### Usage Example

```typescript
// Sort comments by relevance
const sortedComments = comments.sort((a, b) => {
  const scoreA = calculateCommentRelevanceScore(
    a.content,
    a.author.current_level,
    a.created_at,
    a.upvotes_count || 0
  );
  const scoreB = calculateCommentRelevanceScore(
    b.content,
    b.author.current_level,
    b.created_at,
    b.upvotes_count || 0
  );
  return scoreB - scoreA; // Higher score first
});
```

### Factors Explained

1. **Content Length** (`relevanceScore`)
   - Long comment (>50 chars): 1.0
   - Short comment: 0.5

2. **Author Level** (`Math.log10(authorLevel + 1)`)
   - Level 1: +0.30
   - Level 3: +0.60
   - Level 5: +0.78
   - Logarithmic to prevent extreme bias

3. **Recency** (`recencyWeight`)
   - < 1 hour: 1.0
   - < 24 hours: 0.8
   - < 7 days: 0.5
   - Older: 0.2

4. **Upvotes** (`Math.log10(upvotes + 1) * 0.5`)
   - 10 upvotes: +0.50
   - 100 upvotes: +1.00
   - Logarithmic to prevent vote inflation

---

## 3. Threaded Comments System

### Database Schema

```sql
CREATE TABLE comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) NOT NULL,
  author_id uuid REFERENCES profiles(id) NOT NULL,
  content text NOT NULL,
  parent_comment_id uuid REFERENCES comments(id), -- For threading
  replies_count integer DEFAULT 0,
  xp_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
```

### Loading Comments

**Top-Level Comments**:
```typescript
const { data: comments } = await supabase
  .from('comments')
  .select(`*, author:profiles(*)`)
  .eq('post_id', postId)
  .is('parent_comment_id', null) // Top level only
  .order('created_at', { ascending: true });
```

**Replies to Comment**:
```typescript
const { data: replies } = await supabase
  .from('comments')
  .select(`*, author:profiles(*)`)
  .eq('parent_comment_id', commentId)
  .order('created_at', { ascending: true });
```

### Comment Structure

```typescript
interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_comment_id?: string; // null for top-level
  replies_count: number;
  created_at: string;
  author?: Profile;
  replies?: Comment[]; // Nested replies
}
```

### Creating a Reply

```typescript
const handleReply = async (parentCommentId: string) => {
  // 1. Insert reply comment
  const { data: reply } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: userId,
      content: replyContent,
      parent_comment_id: parentCommentId, // Link to parent
      xp_awarded: 20, // Reply XP (investor)
    })
    .select()
    .single();

  // 2. Increment parent's replies_count
  await supabase
    .from('comments')
    .update({ replies_count: supabase.rpc('increment', { x: 1 }) })
    .eq('id', parentCommentId);

  // 3. Increment post's comments_count
  await supabase
    .from('posts')
    .update({ comments_count: post.comments_count + 1 })
    .eq('id', postId);

  // 4. Award XP
  await awardXP(userId, 20, 'reply', reply.id, 'Posted a reply');
};
```

### UI Display (LinkedIn Style)

```tsx
{comments.map((comment) => (
  <div key={comment.id} className="border-l-2 border-neutral-700 pl-4">
    {/* Top-level comment */}
    <CommentDisplay comment={comment} />

    {/* Reply button */}
    <button onClick={() => setReplyToId(comment.id)}>Reply</button>

    {/* Reply form (if active) */}
    {replyToId === comment.id && <ReplyForm />}

    {/* Nested replies */}
    {comment.replies && comment.replies.length > 0 && (
      <div className="ml-13 space-y-3 mt-3">
        {comment.replies.map((reply) => (
          <CommentDisplay key={reply.id} comment={reply} isReply />
        ))}
      </div>
    )}
  </div>
))}
```

---

## 4. Anti-Farming System

### Idempotency Keys

**Purpose**: Prevent duplicate XP awards for the same action.

```typescript
// Generate unique key
export async function getIdempotencyKey(
  userId: string,
  actionType: string,
  targetId: string
): Promise<string> {
  const date = new Date().toISOString().split('T')[0];
  return `${userId}_${actionType}_${targetId}_${date}`;
}

// Check if action already processed
export async function checkIdempotency(key: string): Promise<boolean> {
  const { data } = await supabase
    .from('xp_events')
    .select('id')
    .eq('idempotency_key', key)
    .maybeSingle();

  return !!data; // true if already exists
}
```

### Usage Example

```typescript
// Before awarding XP for upvote
const key = await getIdempotencyKey(userId, 'upvote_post', postId);
const alreadyProcessed = await checkIdempotency(key);

if (alreadyProcessed) {
  console.log('XP already awarded for this action today');
  return;
}

// Award XP and store with idempotency key
await supabase
  .from('xp_events')
  .insert({
    user_id: userId,
    event_type: 'upvote',
    xp_amount: 8,
    post_id: postId,
    idempotency_key: key, // Prevent duplicates
  });
```

### Daily XP Tracking

**Table**: `user_daily_xp`

```typescript
interface DailyXP {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  total_xp: number;
  reflection_count: number; // Max 3/day
  setback_count: number; // Max 1/day
}
```

**Check Before Award**:
```typescript
const { data: dailyData } = await supabase
  .from('user_daily_xp')
  .select('*')
  .eq('user_id', userId)
  .eq('date', today)
  .maybeSingle();

if (dailyData && dailyData.total_xp >= DAILY_CAP) {
  throw new Error('Daily XP cap reached');
}
```

---

## 5. Invite System

### Flow

1. **User Requests Invite** (`/request-invite`)
   - Submits: name, email, company, role, userType
   - Record saved to `invite_requests` table
   - Status: 'pending'

2. **Admin Reviews** (`/admin/invites`)
   - Views all requests
   - Filters by status
   - Searches by name/email/company

3. **Admin Approves**
   - Generates 10-char code: `generateInviteCode()`
   - Sets expiry: 30 days from now
   - Inserts into `invite_codes` table
   - Updates request: status='approved', adds code
   - (Optional) Triggers email edge function

4. **User Redeems** (built into signup flow)
   - Enters invite code
   - System validates:
     - Code exists
     - Not expired
     - Not already used
   - Marks code as used
   - Proceeds to onboarding

### Code Generation

```typescript
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code; // Example: "XY7K9M2N4P"
}
```

### Validation

```typescript
// Check invite code
const { data: invite } = await supabase
  .from('invite_codes')
  .select('*')
  .eq('code', inputCode)
  .maybeSingle();

if (!invite) {
  return { valid: false, error: 'Invalid code' };
}

if (invite.used) {
  return { valid: false, error: 'Code already used' };
}

const now = new Date();
const expiry = new Date(invite.expires_at);
if (now > expiry) {
  return { valid: false, error: 'Code expired' };
}

return { valid: true };
```

---

## 6. Email System (Edge Functions)

### Structure

**Location**: `supabase/functions/send-invite-email/index.ts`

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { email, name, inviteCode, deepLink } = await req.json();

    // Send with SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email, name }] }],
        from: { email: 'noreply@venturelync.com', name: 'VentureLync' },
        subject: 'Your VentureLync Invite Code',
        content: [{
          type: 'text/html',
          value: `
            <h1>Welcome to VentureLync</h1>
            <p>Your invite code: <strong>${inviteCode}</strong></p>
            <p><a href="${deepLink}">Redeem your invite</a></p>
          `,
        }],
      }),
    });

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

### Calling from API Route

```typescript
// app/api/invite/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // Call edge function
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-invite-email`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        name: body.name,
        inviteCode: generatedCode,
        deepLink: `https://venturelync.com/signup?code=${generatedCode}`,
      }),
    }
  );

  return Response.json({ success: true });
}
```

---

## 7. Authentication Flow

### Signup

1. User enters email/password
2. Validates invite code (if required)
3. Creates auth user via `supabase.auth.signUp()`
4. Trigger creates profile record (database trigger or manual)
5. Marks invite code as used
6. Redirects to onboarding

### Onboarding

1. User enters username (validation: lowercase, numbers, underscore only)
2. Uploads avatar (optional)
3. Enters tagline (optional)
4. System:
   - Updates profile with username, avatar_url, tagline
   - Awards "Complete Profile" XP (120 XP for investors)
   - Redirects to `/feed`

### Login

1. User enters email/password
2. Calls `supabase.auth.signInWithPassword()`
3. If 2FA enabled, prompts for code
4. On success, redirects to `/feed`

---

## 8. Profile System

### Data Structure

```typescript
interface Profile {
  id: string; // Matches auth.users.id
  email: string;
  username: string | null;
  avatar_url: string | null;
  tagline: string | null;
  user_type: 'founder' | 'investor';
  total_xp: number;
  current_level: number;
  current_streak: number;
  last_post_date: string | null;
  created_at: string;
}
```

### Avatar Upload

```typescript
const handleAvatarUpload = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  // Get public URL
  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update profile
  await supabase
    .from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('id', userId);
};
```

---

## 9. Feed Algorithm

### Post Ordering

**Current**: Chronological (newest first)

```typescript
const { data: posts } = await supabase
  .from('posts')
  .select(`*, author:profiles(*)`)
  .order('created_at', { ascending: false })
  .limit(50);
```

**Future**: Ranked by engagement + recency

```typescript
// Add computed relevance score
const rankedPosts = posts.map(post => ({
  ...post,
  score: (post.upvotes_count * 2) +
         (post.comments_count * 3) +
         (getRecencyBonus(post.created_at))
})).sort((a, b) => b.score - a.score);
```

---

## 10. Connection System

### States

- `pending`: Request sent, awaiting response
- `accepted`: Both users connected
- `rejected`: Request declined

### Request Flow

```typescript
// Send request
await supabase.from('connections').insert({
  requester_id: currentUserId,
  recipient_id: targetUserId,
  status: 'pending',
});

// Accept request
await supabase
  .from('connections')
  .update({ status: 'accepted' })
  .eq('id', connectionId);

// Award XP for accepting (investor: acceptMeeting = 200 XP)
await awardXP(userId, 200, 'accept_meeting', connectionId);
```

---

## Conclusion

This guide covers the core systems in VentureLync. All code is TypeScript, fully typed, and follows Next.js 13 App Router patterns.

**Key Principles**:
- XP is private, shown only to earner
- Anti-farming via idempotency + daily limits
- Comments thread like LinkedIn
- Execution over performance
- Clean, premium UX

---

**Questions? Reference the codebase or contact the VentureLync team.**
