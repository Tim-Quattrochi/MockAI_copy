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

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--font-roboto",
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
          "antialiased", // Include your antialiased class
          inter.variable, // Apply Inter font variable for headings
          poppins.variable, // Apply Poppins font variable for subheadings and CTAs
          roboto.variable, // Apply Roboto font variable for body text
          "bg-[#0a0b2e]", // Your custom background color
          "text-white" // Your text color
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
