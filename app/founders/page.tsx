import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import HeroPostCard from '@/components/HeroPostCard';
import FeedCard from '@/components/FeedCard';
import ProfileCard from '@/components/ProfileCard';
import Footer from '@/components/Footer';
import { mockPosts } from '@/lib/mockPosts';

export const metadata = {
  title: 'VentureLync for Founders',
  description: 'A space where founders record progress not performance. Build your profile naturally through consistent work.',
};

export default function FoundersPage() {
  const sampleProfile = {
    name: 'Asha Rao',
    handle: 'asha_rao',
    level: 12,
    xp: 8500,
    streak: 47,
    role: 'founder' as const,
  };

  return (
    <main className="bg-neutral-50">
      <Header />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full mb-8 border border-blue-200">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold uppercase tracking-wide">For Founders</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                Turn execution into{' '}
                <span style={{ color: '#00008B' }}>credibility</span>.
              </h1>

              <div className="text-lg text-neutral-600 leading-relaxed mb-8 space-y-4">
                <p>
                  The journey of a founder is often quiet yet intense. Most of the work happens when no one is watching. Most of the progress is invisible.
                </p>
                <p>
                  VentureLync gives founders a space where progress is recorded not performed. Where every action contributes to a living trail of proof.
                </p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-8 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">What founders get:</h2>
                <ul className="space-y-2.5 text-neutral-700 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-700 font-bold mt-0.5">•</span>
                    <span>A personal profile that grows with your work</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-700 font-bold mt-0.5">•</span>
                    <span>An XP system that rewards genuine progress</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-700 font-bold mt-0.5">•</span>
                    <span>A streak engine that builds discipline</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-700 font-bold mt-0.5">•</span>
                    <span>Verified signals that replace vanity updates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-700 font-bold mt-0.5">•</span>
                    <span>An investor-ready presence built naturally</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/request-invite"
                  className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-800 transition-colors text-lg"
                >
                  Join the waitlist
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-white text-neutral-900 px-8 py-4 rounded-full font-semibold border-2 border-neutral-900 hover:bg-neutral-50 transition-colors text-lg"
                >
                  Back to home
                </Link>
              </div>
            </div>

            <div className="relative">
              <HeroPostCard />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Sample founder profile
            </h2>
            <p className="text-lg text-neutral-600">
              This is what your profile looks like as you build
            </p>
          </div>

          <div className="max-w-md mb-16">
            <ProfileCard profile={sampleProfile} />
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Recent founder updates
            </h2>
            <p className="text-lg text-neutral-600">
              Real work from real builders
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {mockPosts.filter(p => p.level >= 10).map((post) => (
              <FeedCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
