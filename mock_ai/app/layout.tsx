import type { Metadata } from "next";
import "./globals.css";
import { Poppins, Inter, Roboto } from "next/font/google";
import { cn } from "@/lib/utils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "MockAI",
  description: "Level up your interviewing skills.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="/icon.jpeg"
          type="image/jpeg"
          sizes="32x32"
        />
      </head>

      <body
        id="main"
        className={cn(
          "antialiased",
          inter.variable,
          poppins.variable
        )}
      >
        {" "}
        <div className="min-h-screen flex flex-col  bg-[#0a0b2e] text-white">
          <Header />
          <main className="flex-grow">{children}</main>
          <Toaster />
          <Footer />
        </div>
      </body>
    </html>
  );
}
