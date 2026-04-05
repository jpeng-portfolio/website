import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "sonner";
import { fetchSiteConfig } from "@/sanity/lib/fetch";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JP Cloud Engineering | Cloud & Infrastructure Engineer",
  description:
    "Cloud and Infrastructure Engineering portfolio built with Next.js, shadcn, and AWS-focused projects.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteConfig = await fetchSiteConfig();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      style={{ scrollBehavior: "smooth" }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Navbar domain={siteConfig.domain} navItems={siteConfig.navItems} />
        <main className="flex-1">{children}</main>
        <Footer title={siteConfig.title} socialLinks={siteConfig.socialLinks} />
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
