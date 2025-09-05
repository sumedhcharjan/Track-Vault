import Link from "next/link"

export default function About() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About Track Vault</h1>
      <p className="text-lg text-gray-700 leading-relaxed mb-6">
        <span className="font-semibold">Track Vault</span> is a secure and
        lightweight file sharing platform designed to give users full control
        over how their files are accessed, tracked, and automatically managed.
        Built with{" "}
        <span className="font-semibold">Next.js, Supabase, and Redis</span>, it
        focuses on speed, reliability, and user privacy.
      </p>

      <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
        Key Features
      </h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>
          <span className="font-medium">Analytics (Phase 1):</span> Track file
          views, downloads, and last accessed time in real-time.
        </li>
        <li>
          <span className="font-medium">Access Control (Phase 2):</span> Set
          expiry times, maximum views/downloads, password protection, and
          one-time links for files.
        </li>
        <li>
          <span className="font-medium">Self-Destruct (Phase 3):</span> Files
          can auto-delete after certain views, first access, or a set number of
          days.
        </li>
        <li>
          <span className="font-medium">Polished UX (Phase 5):</span> User
          dashboard with clear analytics, edit access controls, and expiration
          warnings.
        </li>
      </ul>

      <h2 className="text-2xl font-semibold text-gray-900 mt-10 mb-4">
        Why Track Vault?
      </h2>
      <p className="text-lg text-gray-700 leading-relaxed mb-6">
        Unlike traditional file hosting services, Track Vault focuses on{" "}
        <span className="font-semibold">privacy-first sharing</span>. You
        decide how many times a file can be viewed, when it should expire, and
        whether it should self-destruct after being accessed. Combined with
        real-time analytics, it provides a transparent and controlled way to
        share sensitive files.
      </p>

      <div className="mt-8">
        <Link
          href="https://github.com/sumedhcharjan/Track-Vault.git"
          target="_blank"
          className="px-6 py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-800 transition"
        >
          View Project on GitHub
        </Link>
      </div>
    </main>
  )
}
