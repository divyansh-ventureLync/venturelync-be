'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Zap, TrendingUp, Users, ArrowRight, Target, Rocket, Heart, MessageCircle } from 'lucide-react';
import AnimatedBubbles from '@/components/AnimatedBubbles';
import { supabase } from '@/lib/supabase';

const dummyPosts = [
  {
    author: 'Sarah Chen',
    avatar: '👩‍💻',
    level: 4,
    category: 'Build',
    content: 'Shipped v2.0 of our dashboard today. Users can now export data in real time. Small win but it unlocks a huge use case.',
    likes: 47,
    comments: 12,
    time: '2h ago'
  },
  {
    author: 'Marcus Johnson',
    avatar: '🚀',
    level: 3,
    category: 'Traction',
    content: 'Hit $10K MRR this morning. Took 8 months of grinding, countless pivots, and one near death experience. Worth it.',
    likes: 89,
    comments: 24,
    time: '5h ago'
  },
  {
    author: 'Priya Sharma',
    avatar: '💡',
    level: 5,
    category: 'Reflection',
    content: 'Learning: Ship fast, gather feedback, iterate. Repeat. The founders who win are the ones who compound small improvements.',
    likes: 63,
    comments: 18,
    time: '1d ago'
  }
];

export default function Home() {
  const [waitlistCount, setWaitlistCount] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const fetchWaitlistCount = async () => {
      const { count } = await supabase
        .from('invite_requests')
        .select('*', { count: 'exact', head: true });
      setWaitlistCount(count || 0);
    };
    fetchWaitlistCount();

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModeQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    darkModeQuery.addEventListener('change', handleChange);
    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <main className={`min-h-screen transition-colors ${isDark ? 'bg-neutral-900' : 'bg-white'}`}>
      <nav className={`border-b backdrop-blur-sm sticky top-0 z-50 transition-colors ${isDark ? 'border-neutral-800 bg-neutral-900/80' : 'border-neutral-200 bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className={`text-2xl font-bold transition-colors ${isDark ? 'text-white' : 'text-white'}`}>VentureLync</div>
          <div className="flex items-center gap-6">
            <Link
              href="/manifesto"
              className={`font-medium transition-colors uppercase tracking-wide ${isDark ? 'text-neutral-400 hover:text-neutral-100' : 'text-neutral-600 hover:text-neutral-900'}`}
            >
              Manifesto
            </Link>
            <Link
              href="/login"
              className="font-medium transition-colors uppercase tracking-wide text-neutral-600 hover:text-blue-600"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      <section className={`relative min-h-screen flex items-center px-6 lg:px-12 overflow-hidden transition-colors ${isDark ? 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
        <AnimatedBubbles />

        <div className="max-w-7xl mx-auto w-full py-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-white font-bold text-xs uppercase tracking-wider"
              style={{ backgroundColor: '#00008B' }}
            >
              <Sparkles className="w-4 h-4" />
              Private Network
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-8 tracking-tight"
            >
              <span className={isDark ? 'text-neutral-100' : 'text-neutral-900'}>Build in </span>
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                public
              </span>
              <br />
              <span className={isDark ? 'text-neutral-100' : 'text-neutral-900'}>Rise in </span>
              <span className={isDark ? 'text-neutral-500' : 'text-neutral-400'}>private</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className={`text-xl lg:text-2xl leading-relaxed max-w-3xl mx-auto mb-12 ${isDark ? 'text-neutral-400' : 'text-neutral-600'}`}
            >
              Where execution builds reputation. Track progress, earn credibility, get discovered. Zero noise, pure signal.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7, type: 'spring' }}
            >
              <Link
                href="/request-invite"
                className="inline-flex items-center justify-center gap-3 text-white px-10 py-5 rounded-xl font-bold hover:opacity-90 transition-all text-xl group shadow-2xl"
                style={{ backgroundColor: '#00008B' }}
              >
                Request Your Invite
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

          </motion.div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-4">
              <span className="text-2xl">👨‍💻</span>
              <span className="font-bold text-neutral-800">For Founders</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
              Turn execution into <span style={{ color: '#00008B' }}>credibility</span>
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Stop performing. Start building. Let your work speak louder than your words.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { emoji: '⚡', title: 'Track Progress', desc: 'Log builds, traction, team updates. Every action earns XP. Watch consistency compound into reputation.', delay: 0 },
              { emoji: '🔥', title: 'Build Streaks', desc: 'Daily momentum. Milestone bonuses. A system that rewards showing up when nobody\'s watching.', delay: 0.2 },
              { emoji: '📈', title: 'Level Up', desc: 'Rise from Active Learner to Elite Executor. Pure execution signal. No shortcuts. No gaming.', delay: 0.4 }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay, duration: 0.6 }}
                whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
                className={`bg-gradient-to-br ${
                  idx === 0 ? 'from-blue-50 to-blue-100 border-blue-200' :
                  idx === 1 ? 'from-purple-50 to-purple-100 border-purple-200' :
                  'from-pink-50 to-pink-100 border-pink-200'
                } rounded-3xl p-8 border-2 cursor-pointer`}
              >
                <div className="text-5xl mb-4">{item.emoji}</div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-3">{item.title}</h3>
                <p className="text-neutral-700 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12 bg-gradient-to-br from-neutral-900 to-neutral-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
              <span className="text-2xl">💼</span>
              <span className="font-bold">For Investors</span>
            </div>
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              Discover <span className="text-blue-400">execution</span>, not pitches
            </h2>
            <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
              Skip the theater. See real momentum. Back founders through verified progress.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              { emoji: '👀', title: 'See Execution History', desc: 'Review founder timelines. Track builds, traction, reflections. Watch patterns emerge from real data.', delay: 0 },
              { emoji: '🎯', title: 'Signal High Quality', desc: 'Mark exceptional posts. Endorse skills. Mentor builders. Your curation builds your reputation.', delay: 0.2 }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: item.delay, duration: 0.6 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
              >
                <div className="text-5xl mb-4">{item.emoji}</div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-neutral-300 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-6">
              Real builders. Real progress.
            </h2>
            <p className="text-xl text-neutral-600">
              See what the community is shipping today
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {dummyPosts.map((post, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.15, duration: 0.6 }}
                whileHover={{ y: -5, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                className="bg-white rounded-2xl p-6 border-2 border-neutral-200 cursor-pointer"
              >
                <div className="flex items-start gap-3 mb-4">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl"
                  >
                    {post.avatar}
                  </motion.div>
                  <div className="flex-1">
                    <div className="font-bold text-neutral-900">{post.author}</div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-purple-600">Level {post.level}</span>
                      <span className="text-neutral-400">•</span>
                      <span className="text-neutral-500">{post.time}</span>
                    </div>
                  </div>
                </div>

                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                  style={{
                    backgroundColor: post.category === 'Build' ? '#dbeafe' :
                                   post.category === 'Traction' ? '#dcfce7' :
                                   '#fef3c7',
                    color: post.category === 'Build' ? '#1e40af' :
                           post.category === 'Traction' ? '#166534' :
                           '#92400e'
                  }}
                >
                  {post.category}
                </div>

                <p className="text-neutral-700 leading-relaxed mb-4">
                  {post.content}
                </p>

                <div className="flex items-center gap-4 pt-3 border-t border-neutral-200">
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="flex items-center gap-2 text-neutral-600 cursor-pointer"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="text-sm font-semibold">{post.likes}</span>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.2 }}
                    className="flex items-center gap-2 text-neutral-600 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-semibold">{post.comments}</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Link
              href="/request-invite"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg"
            >
              Join the Community
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-24 px-6 lg:px-12 bg-white"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-6xl lg:text-7xl font-bold text-neutral-900 mb-8"
          >
            Execution speaks <span style={{ color: '#00008B' }}>louder</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-2xl text-neutral-600 mb-12 leading-relaxed"
          >
            Join the network where consistency compounds into credibility and real work gets recognized
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, type: 'spring' }}
          >
            <Link
              href="/request-invite"
              className="inline-flex items-center justify-center gap-3 text-white px-12 py-6 rounded-2xl font-bold hover:opacity-90 transition-all text-2xl group shadow-2xl"
              style={{ backgroundColor: '#00008B' }}
            >
              Request Your Invite
              <ArrowRight className="w-7 h-7 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </motion.section>

      <footer className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-t border-neutral-700 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="text-2xl font-bold text-white mb-2">VentureLync</div>
              <p className="text-neutral-400 text-sm">Build without performing. Rise without pretending.</p>
            </div>
            <div className="flex gap-8">
              <Link href="/manifesto" className="text-neutral-400 hover:text-white transition-colors">
                Manifesto
              </Link>
              <Link href="/request-invite" className="text-neutral-400 hover:text-white transition-colors">
                Request Invite
              </Link>
              <Link href="/login" className="text-neutral-400 hover:text-blue-400 transition-colors">
                Login
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-neutral-800 text-center text-neutral-500 text-sm">
            <p>&copy; 2024 VentureLync Private Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
