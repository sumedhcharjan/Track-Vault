import Link from "next/link";
import { LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Button } from "./ui/button";

export default async function Navbar() {
  const { isAuthenticated, getUser } = getKindeServerSession();
  const loggedIn = await isAuthenticated();
  const user = loggedIn ? await getUser() : null;

  return (
    <div className="w-full fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
      <nav className="w-full max-w-6xl flex justify-between items-center px-6 py-2 rounded-full border border-border/40 backdrop-blur-lg shadow-lg">
        <Link
          href={loggedIn ? "/dashboard" : "/"}
          className="text-xl font-bold text-foreground hover:text-primary transition-colors"
        >
          Track Vault
        </Link>

        {!loggedIn ? (
          <div className="flex gap-6 items-center">
            <Link
              href="/about"
              className="text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              About
            </Link>
            <LoginLink>
              <Button variant="secondary" className="shadow-sm rounded-full">
                Login
              </Button>
            </LoginLink>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <Link href="/uploadedfiles">
              <Button variant="secondary" className="shadow-sm rounded-full">
                Your Files
              </Button>
            </Link>

            <div className="flex items-center gap-4">
              <Avatar className="h-8 w-8 ring-2 ring-border/50">
                <AvatarImage src={user?.picture ?? ""} />
                <AvatarFallback>{user?.given_name?.[0] ?? "U"}</AvatarFallback>
              </Avatar>
              <LogoutLink>
                <Button 
                  variant="ghost" 
                  className="text-destructive rounded-full hover:text-destructive/90 hover:bg-destructive/10"
                >
                  Logout
                </Button>
              </LogoutLink>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
