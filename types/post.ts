export interface Post {
  id: string;
  authorName: string;
  handle: string;
  avatarUrl?: string;
  avatar?: string;
  title: string;
  excerpt: string;
  xpAwarded: number;
  streakDays: number;
  level: number;
  tags: string[];
  createdAt: string | Date;
  isMock?: boolean;
}

export interface Profile {
  name: string;
  handle: string;
  avatarUrl?: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  role: 'founder' | 'investor';
  location?: string;
  bio?: string;
}
