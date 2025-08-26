import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
export default async function RootLayout({ children }) {
  const {isAuthenticated , getUser} = getKindeServerSession();
  const user = await getUser();

  return (
    <html lang="en">
      <body>

        {children}


      </body>
    </html>
  );
}
