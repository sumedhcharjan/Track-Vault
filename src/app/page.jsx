import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, BarChart, Zap } from "lucide-react";
import { FlickeringGrid } from "@/components/ui/flickering-grid";

export default async function Home() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden bg-background pt-16">
      <div className="absolute inset-0 z-0">
        <FlickeringGrid
          squareSize={6}
          gridGap={5}
          className="w-full h-full opacity-70"
          color="#1a17b3"
          maxOpacity={0.2}
        />
      </div>

      <div className="relative z-10 px-6 py-24 w-full">
        <section className="text-center max-w-4xl mx-auto mb-24">
          <h1 className="text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Share Files with Power & <span className="text-primary">Security</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Upload, share, and control your files with enterprise-grade security features
            and real-time analytics.
          </p>
          <div className="flex gap-6 justify-center">
            <LoginLink>
              <Button size="lg" className="h-12 px-8 font-medium">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </LoginLink>
            <RegisterLink>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 font-medium border-2"
              >
                Create Account
              </Button>
            </RegisterLink>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-6 backdrop-blur-sm bg-card/50 border-2">
            <ShieldCheck className="h-12 w-12 mb-5 text-primary" />
            <h3 className="text-2xl font-semibold mb-3">Access Control</h3>
            <p className="text-muted-foreground">
              Set passwords, expiry dates, and one-time links to keep your files secure.
            </p>
          </Card>

          <Card className="p-6 backdrop-blur-sm bg-card/50 border-2">
            <BarChart className="h-12 w-12 mb-5 text-primary" />
            <h3 className="text-2xl font-semibold mb-3">Analytics</h3>
            <p className="text-muted-foreground">
              Track views, downloads, and devices accessing your files in real time.
            </p>
          </Card>

          <Card className="p-6 backdrop-blur-sm bg-card/50 border-2">
            <Zap className="h-12 w-12 mb-5 text-primary" />
            <h3 className="text-2xl font-semibold mb-3">Self-Destruct</h3>
            <p className="text-muted-foreground">
              Files can auto-delete after a set number of views or days.
            </p>
          </Card>
        </section>
      </div>
    </main>
  );
}
