import { Manrope } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { LayoutProps } from '@/types/layout';
import './globals.css';
import { LocationProvider } from '@/context/LocationContext'; // Import the LocationProvider for location state management

const manrope = Manrope({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

export default function RootLayout({ children }: LayoutProps) {
    return (
        <html lang="en">
            {/* Wrap the application in the LocationProvider to make location data available in the component tree */}
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