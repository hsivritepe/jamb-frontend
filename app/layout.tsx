import { Manrope } from "next/font/google";
import "./globals.css";
import RootLayoutClient from "./RootLayoutClient";
import { LayoutProps } from "@/types/layout";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  preload: false,
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
        {/* We keep <html> and <body> on the server side */}
        {/* Then we render the client layout with all providers */}
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}