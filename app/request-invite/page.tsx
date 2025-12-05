'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import Header from '@/components/Header';
import FormInput from '@/components/FormInput';
import Footer from '@/components/Footer';

export default function RequestInvitePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: 'founder',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    if (!formData.name || !formData.email) {
      setError('Name and email are required');
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userType: formData.role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit form');
      }

      setIsSuccess(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        role: 'founder',
      });
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <main>
        <Header />
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-neutral-50 to-white py-20">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <div className="bg-white border border-neutral-200 rounded-lg p-12 shadow-lg">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-4">
                Welcome to VentureLync!
              </h1>
              <p className="text-lg text-neutral-700 mb-6">
                Thank you for your interest. We have received your application and sent a welcome email to your inbox.
              </p>
              <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6 mb-8 text-left">
                <p className="text-sm font-semibold text-blue-900 mb-2">What happens next?</p>
                <p className="text-sm text-blue-800">
                  Our team will review your application within 48 hours. Once approved, you'll receive your unique invite code via email, which will be valid for 7 days.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-lg font-semibold hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#00008B' }}
                >
                  Back to Home
                </Link>
                <Link
                  href="/manifesto"
                  className="inline-flex items-center justify-center gap-2 bg-white text-neutral-900 px-8 py-4 rounded-lg font-semibold border-2 border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  Read the Manifesto
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      <section className="min-h-screen bg-gradient-to-b from-neutral-50 to-white py-20">
        <div className="max-w-2xl mx-auto px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-neutral-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="bg-white border border-neutral-200 rounded-lg p-8 md:p-12 shadow-lg">
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-4">
              Request an invite
            </h1>
            <p className="text-lg text-neutral-600 mb-8">
              Join the VentureLync community. We're accepting founders and investors who value depth over noise.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <FormInput
                label="Name"
                name="name"
                type="text"
                required
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
              />

              <FormInput
                label="Email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
              />

              <FormInput
                label="Company"
                name="company"
                type="text"
                placeholder="Your company"
                value={formData.company}
                onChange={handleChange}
              />

              <div className="space-y-2">
                <label htmlFor="role" className="block text-sm font-medium text-neutral-700">
                  I am a
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="role"
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                >
                  <option value="founder">Founder</option>
                  <option value="investor">Investor</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-neutral-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Request invite'}
              </button>
            </form>

            <p className="text-sm text-neutral-500 mt-6 text-center">
              We respect your privacy. Your information will never be shared.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
