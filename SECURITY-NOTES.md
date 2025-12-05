# Security Configuration Notes

## Database Indexes

The following indexes are reported as "unused" by Supabase but are **CRITICAL** for production performance and should **NOT** be removed:

### Why These Indexes Are Important

These indexes are currently unused because the application has no user data yet. Once users start creating content, these indexes will be essential for:

- **Fast query performance** when filtering and joining tables
- **Preventing table scans** on large datasets
- **Enabling efficient pagination** and sorting
- **Supporting RLS policies** with good performance

### Index List and Purpose

1. **`idx_xp_events_post_id`** - Essential for fetching XP events by post
2. **`idx_upvotes_post_id`** - Critical for counting upvotes per post
3. **`idx_upvotes_user_id`** - Needed for checking if user has upvoted
4. **`idx_comments_post_id`** - Essential for loading comments on posts
5. **`idx_connections_requester`** - Required for user connection queries
6. **`idx_connections_recipient`** - Required for user connection queries
7. **`idx_xp_events_user_id`** - Critical for user XP history and leaderboards
8. **`idx_xp_events_created_at`** - Needed for chronological XP event sorting
9. **`idx_profiles_username`** - Essential for username lookups and validation
10. **`idx_comments_parent_id`** - Critical for threaded comment loading
11. **`idx_comments_post_parent`** - Composite index for efficient comment trees
12. **`idx_comments_author_id`** - Needed for user comment history
13. **`idx_invite_codes_used_by`** - Required for invite code validation
14. **`idx_milestones_user_id`** - Essential for user milestone queries
15. **`idx_xp_events_comment_id`** - Needed for XP attribution to comments

### Action Required: DO NOT DROP THESE INDEXES

These indexes will become critical as soon as real users start using the application. Dropping them would cause severe performance issues in production.

---

## Password Breach Detection

### Current Status
**⚠️ DISABLED** - Leaked password protection is currently disabled.

### Required Action
This setting can only be enabled through the Supabase Dashboard:

1. Go to: https://supabase.com/dashboard/project/ydeluktfdgwtprmwtmzf/auth/settings
2. Navigate to: **Authentication** → **Settings** → **Security**
3. Find: **"Leaked Password Protection"**
4. Toggle: **Enable** the setting
5. Click: **Save**

### What This Does
- Checks passwords against the HaveIBeenPwned database
- Prevents users from using compromised passwords
- Significantly improves account security
- No performance impact on the application

### Why This Is Important
Compromised passwords are one of the most common attack vectors. Enabling this feature prevents users from choosing passwords that have been exposed in data breaches, significantly reducing the risk of account takeover attacks.

---

## Security Checklist

- [x] Row Level Security (RLS) enabled on all tables
- [x] Restrictive RLS policies in place
- [x] Database indexes optimized for queries
- [x] Email verification configured
- [ ] **Password breach detection enabled** (Requires dashboard access)
- [x] Invite-only system implemented
- [x] Service role key secured in environment variables
- [x] CORS headers properly configured in Edge Functions

---

## Next Steps

1. **Immediately**: Enable Password Breach Detection in Supabase Dashboard
2. **Monitor**: Track index usage as user base grows
3. **Regular**: Review and update RLS policies as features evolve
4. **Periodic**: Audit security settings quarterly
