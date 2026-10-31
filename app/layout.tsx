import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Temp Travel Car Rentals - Corporate Transportation & Cab Services",
    template: "%s | Temp Travel Car Rentals",
  },
  description:
    "TEMP TRAVEL CAR RENTALS PVT LTD provides premium Corporate Employee Transportation, Airport Transfers, Outstation Cabs, and custom tour packages.",
  metadataBase: new URL("https://temptravel.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://temptravel.in",
    siteName: "Temp Travel",
    images: [
      {
        url: "/images/og-default.jpg",
        width: 1200,
        height: 630,
        alt: "Temp Travel Car Rentals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Temp Travel Car Rentals",
    description: "Premium Corporate Cab Services and Tours & Travel packages.",
    images: ["/images/og-default.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" }
    ],
    shortcut: ["/favicon.ico"]
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}

