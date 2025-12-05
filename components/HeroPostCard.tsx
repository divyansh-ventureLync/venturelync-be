'use client';

import { Flame, Crown, Zap, MoreHorizontal, Sparkles, MousePointer } from 'lucide-react';

export default function HeroPostCard() {
  return (
    <div className="relative group transition-all duration-500 hover:scale-105 hover:rotate-1 hover:z-30">
      <div className="absolute -top-6 left-6 bg-white rounded-2xl px-6 py-4 shadow-lg border border-neutral-200 flex items-center gap-3 z-10 animate-bounce-slow group-hover:scale-110 transition-transform duration-300">
        <Flame className="w-6 h-6 text-orange-500" />
        <div>
          <div className="text-sm text-neutral-500 uppercase tracking-wide font-medium">Current Streak</div>
          <div className="text-2xl font-bold text-neutral-900">14 Days</div>
        </div>
      </div>

      <div className="absolute -top-6 right-12 bg-white rounded-2xl px-6 py-4 shadow-lg border border-neutral-200 flex items-center gap-3 z-10 animate-bounce-slow group-hover:scale-110 transition-transform duration-300" style={{ animationDelay: '1s' }}>
        <span className="text-2xl">🚀</span>
        <span className="font-bold text-lg text-blue-600">#shipping</span>
      </div>

      <div className="absolute top-24 -right-8 bg-white rounded-2xl px-6 py-4 shadow-lg border border-neutral-200 flex items-center gap-3 z-10 animate-bounce-slow group-hover:scale-110 transition-transform duration-300" style={{ animationDelay: '2s' }}>
        <span className="text-2xl">💰</span>
        <span className="font-bold text-lg text-green-600">#revenue</span>
      </div>

      <div className="bg-white rounded-3xl p-10 shadow-2xl border border-neutral-200 mt-8 relative group-hover:shadow-3xl transition-shadow duration-500">
        <div className="flex items-start gap-5 mb-8">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=isaswatmohanty"
            alt="Profile"
            className="w-20 h-20 rounded-full ring-2 ring-purple-100"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="font-bold text-neutral-900 text-2xl">@isaswatmohanty</span>
              <Crown className="w-6 h-6 text-purple-600" />
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-base text-neutral-600">Building VentureLync</div>
          </div>
        </div>

        <p className="text-neutral-900 leading-relaxed mb-8 text-lg">
          Talked to 3 early users today. One asked if this is a crypto scam. One asked for a discount on the free plan. One said 'it's neat'. I'm declaring Product Market Fit. 🚀
        </p>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-3">
            <span className="px-5 py-3 bg-purple-100 text-purple-700 rounded-full text-sm font-bold uppercase tracking-wide transition-transform duration-300 group-hover:scale-105">
              #Learning
            </span>
            <span className="px-5 py-3 bg-orange-100 text-orange-700 rounded-full text-sm font-bold uppercase tracking-wide transition-transform duration-300 group-hover:scale-105">
              #Users
            </span>
          </div>
          <div className="flex items-center gap-2 px-5 py-3 bg-blue-100 text-blue-700 rounded-lg font-semibold text-base transition-transform duration-300 group-hover:scale-105">
            <Zap className="w-5 h-5 fill-blue-700" />
            <span>+50 XP Earned</span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-4 rounded-full shadow-xl flex items-center gap-3 animate-pulse-slow group-hover:scale-110 transition-transform duration-300">
        <Crown className="w-6 h-6 fill-white" />
        <span className="font-bold text-lg">Level 4 Builder</span>
      </div>

      <div className="absolute -right-12 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-3 bg-white rounded-full shadow-lg border border-neutral-200 p-3">
        <button className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors">
          <MoreHorizontal className="w-5 h-5 text-neutral-600" />
        </button>
        <button className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors">
          <Sparkles className="w-5 h-5 text-neutral-600" />
        </button>
        <button className="w-10 h-10 rounded-full hover:bg-neutral-100 flex items-center justify-center transition-colors">
          <MousePointer className="w-5 h-5 text-neutral-600" />
        </button>
      </div>
    </div>
  );
}
