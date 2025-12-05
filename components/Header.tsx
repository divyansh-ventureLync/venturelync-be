import Link from 'next/link';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="text-2xl font-bold text-white">VentureLync</span>
            <span className="text-xs text-neutral-500 uppercase tracking-wider">EST. 2025</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors uppercase tracking-wide">
              Home
            </Link>
            <Link href="/founders" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors uppercase tracking-wide">
              Founders
            </Link>
            <Link href="/investors" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors uppercase tracking-wide">
              Investors
            </Link>
            <Link href="/manifesto" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors uppercase tracking-wide">
              Manifesto
            </Link>
            <Link
              href="/request-invite"
              className="text-white px-6 py-2.5 rounded-full font-semibold hover:opacity-90 transition-all uppercase tracking-wide text-sm"
              style={{ backgroundColor: '#00008B' }}
            >
              Request Invite
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
