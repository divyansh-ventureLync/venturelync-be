import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import HeroPostCard from '@/components/HeroPostCard';
import FeedCard from '@/components/FeedCard';
import ProfileCard from '@/components/ProfileCard';
import Footer from '@/components/Footer';
import { mockPosts } from '@/lib/mockPosts';

export const metadata = {
  title: 'VentureLync for Investors',
  description: 'Discover real builders through verified signals and consistent progress. Filter for depth, not noise.',
};

export default function InvestorsPage() {
  const sampleProfile = {
    name: 'Arjun Mehta',
    handle: 'arjun_mehta',
    level: 15,
    xp: 12000,
    streak: 89,
    role: 'founder' as const,
  };

  return (
    <main className="bg-neutral-50">
      <Header />

      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <HeroPostCard />
            </div>

            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full mb-8 border border-blue-200">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-semibold uppercase tracking-wide">For Investors</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
                Discover execution{' '}
                <span style={{ color: '#00008B' }}>before traction</span>.
              </h1>

              <div className="text-lg text-neutral-600 leading-relaxed mb-8 space-y-4">
                <p>
                  Investors do not need more noise. They need clarity. They need a consistent high signal view of founders without the theatrics of online performance.
                </p>
                <p>
                  VentureLync gives investors a way to see real builders. Not the ones who post for vanity but the ones who show progress with substance.
                </p>
              </div>

              <div className="bg-white border border-neutral-200 rounded-2xl p-6 mb-8 shadow-sm">
                <h2 className="text-lg font-bold text-neutral-900 mb-4">What investors see:</h2>
                <ul className="space-y-2.5 text-neutral-700 text-sm">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-700 font-bold mt-0.5">•</span>
                    <span>Verified signals rather than opinions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-700 font-bold mt-0.5">•</span>
                    <span>Timeline of real work not performance</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-700 font-bold mt-0.5">•</span>
                    <span>Evidence of discipline through streaks</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-700 font-bold mt-0.5">•</span>
                    <span>Early discipline before early traction</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-700 font-bold mt-0.5">•</span>
                    <span>Portfolio progress without chasing updates</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/request-invite"
                  className="inline-flex items-center justify-center gap-2 bg-blue-700 text-white px-8 py-4 rounded-full font-semibold hover:bg-blue-800 transition-colors text-lg"
                >
                  Request early access
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 bg-white text-neutral-900 px-8 py-4 rounded-full font-semibold border-2 border-neutral-900 hover:bg-neutral-50 transition-colors text-lg"
                >
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Example founder profile
            </h2>
            <p className="text-lg text-neutral-600">
              See the depth and signals investors value
            </p>
          </div>

          <div className="max-w-md mb-16">
            <ProfileCard profile={sampleProfile} />
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 mb-4">
              Progress updates from the feed
            </h2>
            <p className="text-lg text-neutral-600">
              Real milestones, real builders
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {mockPosts.slice(0, 6).map((post) => (
              <FeedCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
