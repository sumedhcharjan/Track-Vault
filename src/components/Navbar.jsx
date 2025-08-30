
import Link from "next/link"
import { useKindeAuth, LoginLink, LogoutLink  } from "@kinde-oss/kinde-auth-nextjs/components"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/dist/server/api-utils";
import { Button } from "./ui/Button";

export default async function Navbar() {
 const {isAuthenticated , getUser} = getKindeServerSession();
  const loggedIn = await isAuthenticated();  
  const user = loggedIn ? await getUser() : null;

    return (
    <nav className="flex justify-between items-center px-6 py-4 border-b">
      <Link href={loggedIn ? "/dashboard" : "/"} className="text-xl font-bold">FileX</Link>
      
      {!loggedIn ? (
        // Public navbar
        <div className="flex gap-4">
          <Link href="/about">About</Link>
          <LoginLink className="font-medium text-blue-600">Login</LoginLink>
        </div>
      ) : (
        // Private navbar
        <div className="flex items-center gap-6">
          <Link href="/uploadedfiles"><Button>Your Files</Button></Link>

          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user?.picture ?? ""} />
              <AvatarFallback>{user?.given_name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <LogoutLink  postLogoutRedirectURL="http://localhost:3000/" className="text-red-600">Logout</LogoutLink>
          </div>
        </div>
      )}
    </nav>
  )
}
