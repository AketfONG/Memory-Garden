import React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./contexts/LanguageContext";

export const metadata: Metadata = {
  title: "Memory Garden - Nurture Your Memories Like a Garden",
  description: "Plant, grow, and cherish your precious moments in a digital sanctuary. Let your memories bloom and flourish in a space designed with love and care.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white">
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="antialiased bg-white">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
