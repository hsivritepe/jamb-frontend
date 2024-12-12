import { Manrope } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { LayoutProps } from '@/types/layout';
import './globals.css';

const manrope = Manrope({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
});

export default function RootLayout({ children }: LayoutProps) {
    return (
        <html lang="en">
            <body className={`${manrope.className} bg-[#ffffff]`}>
                <Header />
                <div className="max-w-7xl mx-auto px-4">
                    {children}
                </div>
                <Footer />
            </body>
        </html>
    );
}
