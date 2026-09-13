import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://sales.cristianvaduva.com'),
  title: {
    default: "Cristian Văduva | Luxury Real Estate, Insurance & Capital Advisory",
    template: "%s | Cristian Văduva",
  },
  description: "Private real estate brokerage, insurance asset protection, and mortgage credit structuring across Bucharest, Monaco, and Dubai.",
  alternates: {
    canonical: './',
  },
  openGraph: {
    title: "Cristian Văduva | Luxury Real Estate, Insurance & Capital Advisory",
    description: "Private real estate brokerage, insurance asset protection, and mortgage credit structuring across Bucharest, Monaco, and Dubai.",
    url: "https://sales.cristianvaduva.com",
    siteName: "Cristian Văduva Real Estate & Advisory",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
