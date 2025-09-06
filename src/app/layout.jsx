import Footer from "@/components/Footer";
import "../styles/globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "@/components/Provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <Providers className="flex-1">{children}</Providers>
        <Footer />
      </body>
    </html>
  );
}



