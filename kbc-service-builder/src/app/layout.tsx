import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import { ServicesProvider } from "@/context/ServicesContext";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KBC Service Builder",
  description: "Tell us about your life, and we assemble a service around it.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#003665",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={figtree.variable}>
      <body className="font-sans">
        <ServicesProvider>{children}</ServicesProvider>
      </body>
    </html>
  );
}
