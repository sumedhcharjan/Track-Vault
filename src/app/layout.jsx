import Footer from "@/components/Footer";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Provider";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Track Vault - Secure File Sharing",
  description: "Share files securely with expiry rules and real-time analytics",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen flex flex-col bg-background font-sans antialiased",
          inter.className
        )}
      >
        <Providers>
            <Toaster/>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}



