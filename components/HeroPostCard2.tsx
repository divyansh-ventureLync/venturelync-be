'use client';

import { Brain, Crown, Zap, TrendingUp } from 'lucide-react';

export default function HeroPostCard2() {
  return (
    <div className="relative group transition-all duration-500 hover:scale-105 hover:-rotate-1 hover:z-30">
      <div className="absolute -top-6 right-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl px-5 py-3 shadow-lg border border-purple-200 flex items-center gap-3 z-10 animate-bounce-slow group-hover:scale-110 transition-transform duration-300">
        <TrendingUp className="w-5 h-5 text-purple-500" />
        <div>
          <div className="text-xs text-purple-700 uppercase tracking-wide font-bold">Weekly Growth</div>
          <div className="text-xl font-bold text-purple-900">+350 XP</div>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-neutral-200 mt-8 relative group-hover:shadow-3xl transition-shadow duration-500">
        <div className="flex items-start gap-4 mb-6">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=sarah_product"
            alt="Profile"
            className="w-14 h-14 rounded-full ring-2 ring-blue-100"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-neutral-900 text-lg">@sarah_codes</span>
              <Brain className="w-5 h-5 text-blue-600" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-sm text-neutral-600">Building MealPrepAI</div>
          </div>
        </div>

        <p className="text-neutral-900 leading-relaxed mb-6 text-base">
          Just refactored 2000 lines of spaghetti code into clean, testable modules. Nobody will notice but me. Feels like winning an invisible championship. 🏆
        </p>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide">
              #Engineering
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
              #Progress
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold text-sm">
            <Zap className="w-4 h-4 fill-purple-700" />
            <span>+75 XP Earned</span>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -right-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 animate-pulse-slow group-hover:scale-110 transition-transform duration-300">
        <Brain className="w-5 h-5 fill-white" />
        <span className="font-bold text-base">Level 6 Builder</span>
      </div>
    </div>
  );
}
