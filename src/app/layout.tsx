import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/context/LanguageContext";

// Load premium Google Fonts
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LapStore - Premium Laptop Showcase & Inquiry Catalog",
  description: "Explore elite high-performance workstations and premium gaming laptops from Apple, Razer, and ASUS ROG. Connect directly via WhatsApp for swift personalized consultations.",
  icons: {
    icon: "/assets/favicon.ico",
    shortcut: "/assets/favicon-96x96.png",
    apple: "/assets/apple-touch-icon.png",
  },
  manifest: "/assets/site.webmanifest",
  openGraph: {
    title: "LapStore - Premium Laptop Catalog",
    description: "Browse curated elite portable systems and inquire instantly via WhatsApp.",
    url: "https://lapstore.vercel.app",
    siteName: "LapStore",
    images: [
      {
        url: "/assets/logo.png",
        width: 512,
        height: 512,
        alt: "LapStore Premium Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LapStore - Premium Laptop Catalog",
    description: "Browse curated elite portable systems and inquire instantly via WhatsApp.",
    images: ["/assets/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-[#0f172a] bg-cyber-grid relative">
        <LanguageProvider>
          {/* Ambient light glow circles */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[180px] rounded-full pointer-events-none z-0" />
          <div className="absolute bottom-[20%] right-[-10%] w-[45%] h-[45%] bg-purple-500/5 blur-[180px] rounded-full pointer-events-none z-0" />
          
          {/* Navigation header */}
          <Navbar />
          
          {/* Main page content container */}
          <main className="flex-grow pt-24 z-10 relative">
            {children}
          </main>
          
          {/* Footer */}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
