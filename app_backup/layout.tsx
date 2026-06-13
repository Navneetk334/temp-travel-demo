import type { Metadata } from "next";
import { Outfit } from "next/font/google";
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
  metadataBase: new URL("https://temptravels.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://temptravels.com",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${outfit.variable} font-sans antialiased min-h-screen bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
