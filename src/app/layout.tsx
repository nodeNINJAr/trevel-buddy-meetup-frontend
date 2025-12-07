import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";



export const metadata: Metadata = {
  title: "TravelBuddy - Find Your Perfect Travel Companion",
  description: "Connect with travelers worldwide and turn solo journeys into shared adventures",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
            <Script
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
              strategy="afterInteractive"
              data-target-origin="*"
              data-message-type="ROUTE_CHANGE"
              data-include-search-params="true"
              data-only-in-iframe="true"
              data-debug="true"
              data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
            />
          <AuthProvider>
            {/* navbar */}
            {children}
           <Toaster />
          </AuthProvider>
          
      </body>
    </html>
  );
}