import Link from "next/link";
import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Track Vault. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/sumedhcharjan/Track-Vault.git"
            target="_blank"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition group"
          >
            <Github className="h-5 w-5 transition-transform group-hover:scale-110" />
            <span className="text-sm font-medium">GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
