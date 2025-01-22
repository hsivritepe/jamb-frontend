import { Manrope } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { LayoutProps } from '@/types/layout';
import './globals.css';
import { LocationProvider } from '@/context/LocationContext';

const manrope = Manrope({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    preload: false, // remove error while the resource was preloaded using link preload but not used within a few seconds
});

export const metadata = {
    title: 'JAMB - Home Services',
    description: 'Home Services Platform',
    icons: {
        icon: '/favicon.ico'
    }
}

export default function RootLayout({ children }: LayoutProps) {
    return (
        <html lang="en">
            <body className={`${manrope.className} bg-[#F8F9FB]`}>
                <LocationProvider>
                    <Header />
                    <div className="max-w-7xl mx-auto px-4">
                        {children}
                    </div>
                    <Footer />
                </LocationProvider>
            </body>
        </html>
    );
}