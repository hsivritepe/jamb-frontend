"use client";

import React, { ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { PhotosProvider } from "@/context/PhotosContext";
import { LocationProvider } from "@/context/LocationContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Suspense } from "react";
import AppleScriptLoader from "./AppleScriptLoader";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

interface RootLayoutClientProps {
  children: ReactNode;
}

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <PhotosProvider>
        <LocationProvider>
          <AppleScriptLoader />
          <Header />
          <Suspense fallback={<div>Loading page...</div>}>
            <div className="max-w-7xl mx-auto px-2 sm:px-4">
              {children}
            </div>
          </Suspense>
          <Footer />
        </LocationProvider>
      </PhotosProvider>
    </GoogleOAuthProvider>
  );
}