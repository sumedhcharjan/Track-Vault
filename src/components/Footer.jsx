import Link from "next/link";
import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-gray-50 ">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} FileX. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          <Link
            href="https://github.com/sumedhcharjan/Track-Vault.git"
            target="_blank"
            className="flex items-center gap-2 text-gray-700 hover:text-black transition"
          >
            <Github className="h-5 w-5" />
            <span className="text-sm font-medium">GitHub</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
