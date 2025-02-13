import { Manrope } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { LayoutProps } from '@/types/layout';
import './globals.css';
import { LocationProvider } from '@/context/LocationContext';
import { Suspense } from 'react';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  preload: false, // remove preload error
});

export const metadata = {
  title: 'JAMB - Home Services',
  description: 'Improvement and Maintenance',
  icons: {
    icon: '/favicon.ico',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en">
      <body className={`${manrope.className} bg-[#F8F9FB]`}>
        <LocationProvider>
          <Header />
          <Suspense fallback={<div>Loading page...</div>}>
            <div className="max-w-7xl mx-auto px-4">{children}</div>
          </Suspense>
          <Footer />
        </LocationProvider>
      </body>
    </html>
  );
}