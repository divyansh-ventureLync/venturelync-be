# VentureLync Private Network

A production-ready Next.js platform where founders track execution, earn credibility, and get discovered by investors. No performance. No noise. Just verified progress.

## Features

### Core Platform
- **Landing Page** with founder and investor hero sections
- **Invite Flow** with secure code generation and email notifications
- **Onboarding** with username selection and avatar upload
- **Feed** with posts, threaded comments, and upvotes
- **XP Engine** with separate rules for founders and investors
- **Profile Pages** with user stats, level badges, and streaks
- **Admin Panel** for managing invite requests
- **Manifesto Page** outlining platform philosophy

### Gamification
- **Founder XP**: Earn points for builds, traction, team updates, reflections, and setbacks
- **Investor XP**: Granular point system for engagement (upvotes, comments, mentoring, etc.)
- **Streaks**: Daily posting streaks with bonus XP (3, 7, and 14 day milestones)
- **Levels**: Progress from Active Learner to Elite Executor
- **Daily Caps**: Founders (50 XP), Investors (1500 XP)
- **Anti-Farming**: Idempotency keys and action limits

### Social Features
- Threaded comments (LinkedIn style)
- First comment preview in feed
- Profile avatars and usernames
- Connection requests and management
- Post upvoting with heart icon
- Comment ranking algorithm

## Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **UI Components**: Headless UI / Radix UI
- **Email**: Supabase Edge Functions (SendGrid/Postmark ready)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd project
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Email configuration (for edge functions)
SENDGRID_API_KEY=your_sendgrid_api_key
# OR
POSTMARK_SERVER_TOKEN=your_postmark_server_token
```

4. **Run database migrations**

All migrations are in `/supabase/migrations/`. Apply them in order via Supabase Dashboard or CLI:

```bash
# If using Supabase CLI
supabase db push
```

5. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

## Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=your-repo-url)

### Manual Deploy

1. **Install Vercel CLI**
```bash
npm i -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

4. **Set Environment Variables**

In Vercel Dashboard → Settings → Environment Variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

5. **Deploy to Production**
```bash
vercel --prod
```

### Vercel Configuration

The project includes a `vercel.json` (if needed) with optimal settings. Default Next.js detection works perfectly.

## Database Schema

### Core Tables

**profiles**
- User information, XP, levels, streaks
- Fields: `id`, `email`, `username`, `avatar_url`, `user_type`, `total_xp`, `current_level`, `current_streak`

**posts**
- User posts in 5 categories
- Fields: `id`, `author_id`, `category`, `content`, `upvotes_count`, `comments_count`, `xp_awarded`

**comments**
- Threaded comments with parent-child relationships
- Fields: `id`, `post_id`, `author_id`, `content`, `parent_comment_id`, `replies_count`

**upvotes**
- Post and comment upvotes
- Fields: `id`, `post_id`, `user_id`, `created_at`

**invite_codes**
- Secure 10-character alphanumeric codes with 30-day expiry
- Fields: `id`, `code`, `expires_at`, `used`, `used_by`, `created_by`

**invite_requests**
- Pending invite requests from users
- Fields: `id`, `name`, `email`, `company`, `role`, `user_type`, `status`, `invite_code`

**xp_events**
- XP transaction log with idempotency
- Fields: `id`, `user_id`, `event_type`, `xp_amount`, `post_id`, `idempotency_key`

**user_daily_xp**
- Daily XP tracking for anti-farming
- Fields: `id`, `user_id`, `date`, `total_xp`, `reflection_count`, `setback_count`

### Row Level Security (RLS)

All tables have RLS enabled with policies for:
- Authenticated users can read public data
- Users can only modify their own data
- Invite codes verified before use
- Admin actions restricted

## XP System

### Founder XP Values
- Product Update: 10 XP
- Feature Release: 12 XP
- Customer Milestone: 20 XP
- Revenue Milestone: 25 XP
- Team Update: 10 XP
- Weekly Summary: 15 XP
- Daily Reflection: 5 XP
- Setback Reflection: 5 XP
- Comment: 2 XP

### Investor XP Values
- First Time Post View: 2 XP
- Upvote Post: 8 XP
- Create Comment: 30 XP
- Reply Comment: 20 XP
- Upvote Comment: 6 XP
- Mark High Signal: 40 XP
- Endorse Skill: 60 XP
- Mentor Message: 80 XP
- Accept Meeting: 200 XP
- Add Resource: 100 XP
- Complete Profile: 120 XP
- Daily Presence: 5 XP
- Create Collection: 150 XP
- Invest Commit: 1000 XP
- Pin Comment: 50 XP

### Streak Bonuses
- 3-day streak: +2 XP
- 7-day streak: +5 XP
- 14-day streak: +10 XP

### Level Thresholds
1. Active Learner: 0-100 XP
2. Builder: 100-300 XP
3. Experienced Operator: 300-700 XP
4. High Credibility: 700-2000 XP
5. Elite Executor: 2000+ XP

## API Routes

### `/api/invite` (POST)
Creates invite request and sends email notification.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Acme Inc",
  "role": "CEO",
  "userType": "founder"
}
```

## Edge Functions

### `send-invite-email`
Sends transactional email with invite code and deep link.

**Configuration:**
- Update API keys in Supabase Dashboard → Edge Functions → Secrets
- `SENDGRID_API_KEY` or `POSTMARK_SERVER_TOKEN`

## Project Structure

```
project/
├── app/
│   ├── (auth)/           # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── onboarding/
│   │   └── waitlist/
│   ├── admin/            # Admin panel
│   │   └── invites/
│   ├── api/              # API routes
│   │   └── invite/
│   ├── connections/      # User connections
│   ├── feed/             # Main feed
│   ├── founders/         # Founder directory
│   ├── investors/        # Investor directory
│   ├── manifesto/        # Platform manifesto
│   ├── post/[id]/        # Post detail view
│   ├── profile/[id]/     # User profiles
│   ├── request-invite/   # Invite request
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # UI primitives
│   ├── CreatePostModal.tsx
│   ├── PostCard.tsx
│   ├── XPCelebration.tsx
│   └── ...
├── lib/
│   ├── supabase.ts       # Supabase client
│   ├── xpEngine.ts       # XP calculation logic
│   └── utils.ts          # Utilities
├── supabase/
│   ├── functions/        # Edge functions
│   └── migrations/       # Database migrations
└── public/               # Static assets
```

## Voice & Tone

**Founder-focused. Human. Sharp. Reflective. Contrarian. Premium.**

VentureLync celebrates execution over performance. The copy is direct, confident, and anti-noise. No hyphens in user-facing copy. No theatrics.

Key principles:
- Build without performing
- Rise without pretending
- Execution speaks louder
- Consistency compounds into credibility

## Admin Access

To access the admin panel (`/admin/invites`), users must be authenticated. For production, implement proper admin role checks in the profile table or use Supabase Auth metadata.

## Testing

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build test
npm run build
```

## Contributing

This is a private network platform. Contributions should maintain the sharp, premium tone and focus on execution over vanity metrics.

## License

All rights reserved. VentureLync Private Network.

## Support

For questions or issues, contact the VentureLync team.

---

**Build without performing. Rise without pretending.**
