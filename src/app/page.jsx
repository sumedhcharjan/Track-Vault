import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { RegisterLink, LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@/components/ui/button";
import { ArrowRight, ShieldCheck, BarChart } from "lucide-react";

export default async function Home() {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 px-6">
      <section className="text-center max-w-3xl">
        <h1 className="text-5xl font-extrabold tracking-tight mb-6">
          Share Files <span className="text-blue-600">Securely</span> &{" "}
          <span className="text-blue-600">Smartly</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Upload, share, and control your files with expiry rules, self-destruct
          features, and real-time analytics.
        </p>
        <div className="flex gap-4 justify-center">
          <LoginLink>
            <Button size="lg" className="rounded-2xl">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </LoginLink>
          <RegisterLink>
            <Button size="lg" variant="outline" className="rounded-2xl">
              Create Account
            </Button>
          </RegisterLink>
        </div>
      </section>

      <section className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-blue-600 mb-4" />
          <h3 className="font-semibold text-xl mb-2">Access Control</h3>
          <p className="text-gray-600 text-sm">
            Set passwords, expiry dates, and one-time links to keep your files secure.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <BarChart className="mx-auto h-10 w-10 text-blue-600 mb-4" />
          <h3 className="font-semibold text-xl mb-2">Analytics</h3>
          <p className="text-gray-600 text-sm">
            Track views, downloads, and devices accessing your files in real time.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 text-center">
          <ArrowRight className="mx-auto h-10 w-10 text-blue-600 mb-4" />
          <h3 className="font-semibold text-xl mb-2">Self-Destruct</h3>
          <p className="text-gray-600 text-sm">
            Files can auto-delete after a set number of views or days.
          </p>
        </div>
      </section>
    </main>
  );
}
