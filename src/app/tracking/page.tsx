'use client';

import React, { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import TrackingSection from '@/components/TrackingSection';
import { Loader2 } from 'lucide-react';

export default function TrackingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      <main className="flex-1 py-6 sm:py-10">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
            </div>
          }
        >
          <TrackingSection />
        </Suspense>
      </main>
      <CartDrawer />
      <Footer />
    </div>
  );
}
