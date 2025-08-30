// src/app/dashboard/layout.tsx (or .jsx)
export default function DashboardLayout({ children }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {children}
    </div>
  );
}
