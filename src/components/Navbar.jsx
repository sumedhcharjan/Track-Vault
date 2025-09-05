import Link from "next/link"
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { Button } from "./ui/button"

export default async function Navbar() {
  const { isAuthenticated, getUser } = getKindeServerSession()
  const loggedIn = await isAuthenticated()
  const user = loggedIn ? await getUser() : null

  return (
    <nav className="flex justify-between items-center px-8 py-4 border-b bg-white shadow-sm">
      <Link
        href={loggedIn ? "/dashboard" : "/"}
        className="text-2xl font-extrabold text-gray-900 hover:text-blue-600 transition-colors"
      >
        Track Vault
      </Link>

      {!loggedIn ? (
        <div className="flex gap-6 items-center">
          <Link
            href="/about"
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            About
          </Link>
          <LoginLink className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
            Login
          </LoginLink>
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <Link href="/uploadedfiles">
            <Button className="rounded-lg px-4 py-2">Your Files</Button>
          </Link>

          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.picture ?? ""} />
              <AvatarFallback>{user?.given_name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <LogoutLink className="text-red-600 font-medium hover:text-red-700 transition-colors">
              Logout
            </LogoutLink>
          </div>
        </div>
      )}
    </nav>
  )
}
