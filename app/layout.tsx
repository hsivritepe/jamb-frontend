import { Manrope } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { LayoutProps } from "@/types/layout";
import "./globals.css";
import { LocationProvider } from "@/context/LocationContext";
import { Suspense } from "react";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: false, // avoid preload warning
});

export const metadata = {
  metadataBase: new URL("https://thejamb.com"),
  title: "JAMB – Home Services",
  description: "We help with improvements & maintenance",
  icons: {
    icon: "/favicon.ico",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "JAMB – Home Services",
    description: "We help with improvements & maintenance",
    url: "https://thejamb.com/",
    images: [
      {
        url: "/images/about-emergency.jpg",
      },
    ],
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