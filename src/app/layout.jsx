import Footer from "@/components/Footer";
import "../styles/globals.css"
import Navbar from "@/components/Navbar"
import { Providers } from "@/components/provider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />

          <Providers>{children}</Providers>

          <Footer />
      </body>
    </html>
  );
}


