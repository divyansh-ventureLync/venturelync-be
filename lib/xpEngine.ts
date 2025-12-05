import { supabase } from './supabase';

export const FOUNDER_XP_VALUES = {
  PRODUCT_UPDATE: 10,
  FEATURE_RELEASE: 12,
  CUSTOMER_MILESTONE: 20,
  REVENUE_MILESTONE: 25,
  TEAM_UPDATE: 10,
  WEEKLY_SUMMARY: 15,
  DAILY_REFLECTION: 5,
  PERSONAL_INSIGHT: 5,
  SETBACK_REFLECTION: 5,
  LIGHT_MOMENT: 2,
  INSIGHTFUL_COMMENT: 2,
};

export const INVESTOR_XP_VALUES = {
  firstTimePostView: 2,
  upvotePost: 8,
  createComment: 30,
  replyComment: 20,
  upvoteComment: 6,
  markHighSignal: 40,
  endorseSkill: 60,
  mentorMessage: 80,
  acceptMeeting: 200,
  addResource: 100,
  completeProfile: 120,
  dailyPresence: 5,
  createCollection: 150,
  investCommit: 1000,
  pinComment: 50,
};

export const STREAK_BONUSES = {
  DAY_3: 2,
  DAY_7: 5,
  DAY_14: 10,
};

export const LEVEL_THRESHOLDS = [
  { level: 1, min: 0, max: 100, label: 'Active Learner' },
  { level: 2, min: 100, max: 300, label: 'Builder' },
  { level: 3, min: 300, max: 700, label: 'Experienced Operator' },
  { level: 4, min: 700, max: 2000, label: 'High Credibility' },
  { level: 5, min: 2000, max: 5000, label: 'Elite Executor' },
];

export const FOUNDER_DAILY_XP_CAP = 50;
export const INVESTOR_DAILY_XP_CAP = 1500;
export const MAX_REFLECTION_PER_DAY = 3;
export const MAX_SETBACK_PER_DAY = 1;
export const MAX_COMMENT_XP_PER_DAY = 10;

export function calculateXPForCategory(category: string): number {
  switch (category) {
    case 'Build':
      return FOUNDER_XP_VALUES.PRODUCT_UPDATE;
    case 'Traction':
      return FOUNDER_XP_VALUES.CUSTOMER_MILESTONE;
    case 'Team':
      return FOUNDER_XP_VALUES.TEAM_UPDATE;
    case 'Reflection':
      return FOUNDER_XP_VALUES.DAILY_REFLECTION;
    case 'Setback':
      return FOUNDER_XP_VALUES.SETBACK_REFLECTION;
    default:
      return 0;
  }
}

export function calculateLevel(totalXP: number): number {
  for (const threshold of LEVEL_THRESHOLDS) {
    if (totalXP >= threshold.min && totalXP < threshold.max) {
      return threshold.level;
    }
  }
  return 5;
}

export function getLevelLabel(level: number): string {
  const threshold = LEVEL_THRESHOLDS.find(t => t.level === level);
  return threshold?.label || 'Builder';
}

export async function checkDailyLimits(userId: string, category: string, userType: 'founder' | 'investor'): Promise<{ allowed: boolean; reason?: string }> {
  const today = new Date().toISOString().split('T')[0];

  const { data: dailyData } = await supabase
    .from('user_daily_xp')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  if (!dailyData) {
    return { allowed: true };
  }

  const dailyCap = userType === 'founder' ? FOUNDER_DAILY_XP_CAP : INVESTOR_DAILY_XP_CAP;

  if (dailyData.total_xp >= dailyCap) {
    return { allowed: false, reason: `Daily XP cap reached (${dailyCap} XP)` };
  }

  if (category === 'Reflection' && dailyData.reflection_count >= MAX_REFLECTION_PER_DAY) {
    return { allowed: false, reason: 'Maximum 3 reflection posts per day' };
  }

  if (category === 'Setback' && dailyData.setback_count >= MAX_SETBACK_PER_DAY) {
    return { allowed: false, reason: 'Maximum 1 setback post per day' };
  }

  return { allowed: true };
}

export async function updateDailyXP(userId: string, xpAmount: number, category: string): Promise<void> {
  const today = new Date().toISOString().split('T')[0];

  const { data: existing } = await supabase
    .from('user_daily_xp')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .maybeSingle();

  const newTotalXP = (existing?.total_xp || 0) + xpAmount;
  const newReflectionCount = category === 'Reflection' ? (existing?.reflection_count || 0) + 1 : (existing?.reflection_count || 0);
  const newSetbackCount = category === 'Setback' ? (existing?.setback_count || 0) + 1 : (existing?.setback_count || 0);

  if (existing) {
    await supabase
      .from('user_daily_xp')
      .update({
        total_xp: newTotalXP,
        reflection_count: newReflectionCount,
        setback_count: newSetbackCount,
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('user_daily_xp')
      .insert({
        user_id: userId,
        date: today,
        total_xp: newTotalXP,
        reflection_count: newReflectionCount,
        setback_count: newSetbackCount,
      });
  }
}

export async function calculateAndUpdateStreak(userId: string): Promise<{ streak: number; bonusXP: number }> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('current_streak, last_post_date')
    .eq('id', userId)
    .single();

  if (!profile) return { streak: 0, bonusXP: 0 };

  const today = new Date().toISOString().split('T')[0];
  const lastPostDate = profile.last_post_date;

  let newStreak = 1;
  let bonusXP = 0;

  if (lastPostDate) {
    const lastDate = new Date(lastPostDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      newStreak = profile.current_streak;
    } else if (diffDays === 1) {
      newStreak = profile.current_streak + 1;

      if (newStreak === 3) bonusXP = STREAK_BONUSES.DAY_3;
      else if (newStreak === 7) bonusXP = STREAK_BONUSES.DAY_7;
      else if (newStreak === 14) bonusXP = STREAK_BONUSES.DAY_14;
    } else {
      newStreak = 1;
    }
  }

  await supabase
    .from('profiles')
    .update({
      current_streak: newStreak,
      last_post_date: today,
    })
    .eq('id', userId);

  if (bonusXP > 0) {
    await supabase
      .from('xp_events')
      .insert({
        user_id: userId,
        event_type: 'streak_bonus',
        xp_amount: bonusXP,
        description: `${newStreak} day streak bonus`,
      });
  }

  return { streak: newStreak, bonusXP };
}

export async function awardXP(userId: string, xpAmount: number, eventType: string, postId?: string, description?: string): Promise<{ xpAwarded: number; leveledUp: boolean; newLevel?: number }> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('total_xp, current_level')
    .eq('id', userId)
    .single();

  if (!profile) return { xpAwarded: 0, leveledUp: false };

  const oldLevel = profile.current_level;
  const newTotalXP = profile.total_xp + xpAmount;
  const newLevel = calculateLevel(newTotalXP);
  const leveledUp = newLevel > oldLevel;

  await supabase
    .from('profiles')
    .update({
      total_xp: newTotalXP,
      current_level: newLevel,
    })
    .eq('id', userId);

  await supabase
    .from('xp_events')
    .insert({
      user_id: userId,
      event_type: eventType as any,
      xp_amount: xpAmount,
      post_id: postId,
      description: description || `Earned ${xpAmount} XP`,
    });

  return {
    xpAwarded: xpAmount,
    leveledUp,
    newLevel: leveledUp ? newLevel : undefined
  };
}

export async function checkAndAwardMilestone(userId: string, milestoneType: string): Promise<void> {
  const { data: existing } = await supabase
    .from('milestones')
    .select('id')
    .eq('user_id', userId)
    .eq('milestone_type', milestoneType)
    .maybeSingle();

  if (!existing) {
    await supabase
      .from('milestones')
      .insert({
        user_id: userId,
        milestone_type: milestoneType,
      });
  }
}

export async function getIdempotencyKey(userId: string, actionType: string, targetId: string): Promise<string> {
  const date = new Date().toISOString().split('T')[0];
  return `${userId}_${actionType}_${targetId}_${date}`;
}

export async function checkIdempotency(key: string): Promise<boolean> {
  const { data } = await supabase
    .from('xp_events')
    .select('id')
    .eq('idempotency_key', key)
    .maybeSingle();

  return !!data;
}

export function calculateCommentRelevanceScore(
  commentContent: string,
  authorLevel: number,
  createdAt: string,
  upvotes: number
): number {
  const relevanceScore = commentContent.length > 50 ? 1.0 : 0.5;
  const recencyWeight = calculateRecencyWeight(createdAt);
  const upvoteBoost = Math.log10(upvotes + 1) * 0.5;

  const compositeScore = relevanceScore * (Math.log10(authorLevel + 1) + 1) + recencyWeight + upvoteBoost;

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
