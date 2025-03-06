"use client";

import Script from "next/script";

export default function AppleScriptLoader() {
  return (
    <Script
      src="https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js"
      strategy="beforeInteractive"
    />
  );
}