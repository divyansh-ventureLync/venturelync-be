import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'A Letter to Builders - VentureLync',
  description: 'A personal letter to founders and investors who value execution over performance.',
};

export default function ManifestoPage() {
  return (
    <main className="min-h-screen bg-neutral-50">
      <nav className="border-b border-neutral-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold" style={{ color: '#00008B' }}>
            VentureLync
          </Link>
          <Link
            href="/"
            className="text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
          >
            Home
          </Link>
        </div>
      </nav>

      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="bg-white border-4 border-neutral-900 p-12 md:p-16 shadow-lg">
            <div className="space-y-6 font-serif">
              <div className="mb-12">
                <p className="text-neutral-700 leading-relaxed">Saswat Mohanty</p>
                <p className="text-neutral-700 leading-relaxed">VentureLync</p>
                <p className="text-neutral-700 leading-relaxed">Bengaluru, IND</p>
                <p className="text-neutral-700 leading-relaxed mt-4">saswat@venturelync.com</p>
              </div>

              <div className="mb-8">
                <p className="text-neutral-700 leading-relaxed">To Founders and Investors</p>
                <p className="text-neutral-700 leading-relaxed">VentureLync Community</p>
              </div>

              <p className="text-neutral-900 leading-relaxed">
                Dear Builders and Mentors,
              </p>

              <p className="text-neutral-900 leading-relaxed">
                I created VentureLync with a simple belief. The venture world works best when noise is low and intent is high. Founders deserve a place where their effort is seen without performance. Investors deserve a place where their time and attention carry the weight they truly hold.
              </p>

              <p className="text-neutral-900 leading-relaxed">
                <strong>If you are a founder</strong>
              </p>

              <p className="text-neutral-900 leading-relaxed">
                I want this platform to feel like a quiet room where your work is respected and your journey compels attention without you having to fight for it. You build with purpose and I want VentureLync to stand behind that intent.
              </p>

              <p className="text-neutral-900 leading-relaxed">
                <strong>If you are an investor</strong>
              </p>

              <p className="text-neutral-900 leading-relaxed">
                I want this platform to renew the purity of your craft. Your guidance your curiosity and your presence are real value. I want every meaningful action you take to be acknowledged and amplified.
              </p>

              <p className="text-neutral-900 leading-relaxed">
                VentureLync is an invite only circle built for clarity not spectacle.
              </p>

              <p className="text-neutral-900 leading-relaxed">
                A space where signal rises<br />
                where the right people meet without noise<br />
                and where progress speaks louder than performance.
              </p>

              <p className="text-neutral-900 leading-relaxed">
                If you are here<br />
                it is because you care about excellence effort and intent.<br />
                I care about the same.
              </p>

              <p className="text-neutral-900 leading-relaxed">
                Thank you for being part of this journey.<br />
                Let us build a better venture world together.
              </p>

              <div className="mt-12 pt-8 border-t border-neutral-300">
                <p className="text-neutral-900 leading-relaxed">
                  Sincerely,
                </p>
                <p className="text-neutral-900 leading-relaxed mt-8 font-bold">
                  Saswat Mohanty
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/request-invite"
                className="inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-lg font-bold hover:opacity-90 transition-all"
                style={{ backgroundColor: '#00008B' }}
              >
                Request Your Invite
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-neutral-900 border-t border-neutral-800 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-2xl font-bold text-white mb-2">VentureLync</div>
          <p className="text-neutral-400 text-sm">Build without performing. Rise without pretending.</p>
          <div className="mt-8 pt-8 border-t border-neutral-800 text-neutral-500 text-sm">
            <p>&copy; 2024 VentureLync Private Network. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
