'use client';

import { Zap, Leaf, Flame } from 'lucide-react';

export default function FounderPostCard() {
  return (
    <div className="relative">
      <div className="absolute -top-4 left-6 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl px-5 py-3 shadow-lg border border-orange-200 flex items-center gap-2 z-10">
        <Zap className="w-5 h-5 text-orange-500" />
        <span className="text-sm font-bold text-orange-700 uppercase tracking-wide">Resilience</span>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-2xl border border-neutral-200 mt-8">
        <div className="flex items-start gap-4 mb-6">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=vikram"
            alt="Profile"
            className="w-14 h-14 rounded-full ring-2 ring-green-100"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-neutral-900 text-lg">@vikram_builds</span>
              <Leaf className="w-5 h-5 text-green-600" />
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-sm text-neutral-600">Building Inner Peace</div>
          </div>
        </div>

        <p className="text-neutral-900 leading-relaxed mb-6 text-base">
          Took a day off to walk the dog. 🔥 Realized clarity requires stepping away from the screen. Logging this as resilience.
        </p>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2">
            <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wide">
              #Resilience
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-xs font-bold uppercase tracking-wide">
              #Reflection
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">
            <Zap className="w-4 h-4 fill-blue-700" />
            <span>+200 XP Earned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
