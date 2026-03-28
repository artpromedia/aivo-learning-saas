import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

import { getLocale, getMessages } from "next-intl/server";
import { I18nProvider } from "@/i18n/provider";
import { isRtl } from "@/i18n/config";
import { QueryProvider } from "@/providers/QueryProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "AIVO Learning",
  description:
    "AI-powered adaptive learning platform for children with autism spectrum needs.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} dir={isRtl(locale) ? "rtl" : "ltr"} suppressHydrationWarning>
      <body style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif" }}>
        <ThemeProvider>
          <QueryProvider>
            <I18nProvider locale={locale} messages={messages}>
              <AuthProvider>{children}</AuthProvider>
            </I18nProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
