import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KaraVeda - AI-Powered CA Assistant",
  description: "AI-Powered Chartered Accountant Assistant for Indian GST & Income Tax",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
