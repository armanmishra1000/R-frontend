import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reddit Lead Gen - Multi-Agent System",
  description: "AI-powered Reddit lead generation with multi-agent automation",
};

/**
 * Root layout component that renders the application's top-level HTML structure and provides authentication context to its children.
 *
 * @param children - The React nodes to render inside the application root; these are wrapped with the app's authentication provider.
 * @returns The root HTML element tree containing a body that hosts the provided children within the authentication context.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}