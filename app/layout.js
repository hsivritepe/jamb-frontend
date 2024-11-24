import { Manrope } from 'next/font/google';
import Header from '@/app/components/layout/Header';
import Footer from '@/app/components/layout/Footer';
import './globals.css';

const manrope = Manrope({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className={`${manrope.className} bg-[#F8F9FB]`}>
                <Header />
                <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
                    {children}
                </div>
                <Footer />
            </body>
        </html>
    );
}
