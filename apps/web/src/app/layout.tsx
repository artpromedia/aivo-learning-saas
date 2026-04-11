import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";

export const metadata: Metadata = {
  title: "AIVO - AI-Powered Adaptive Learning",
  description: "AI-Powered Adaptive Learning for Every Child",
  icons: { icon: "/images/favicon-192.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body antialiased bg-white text-slate-800">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
