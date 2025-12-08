"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4">
      <h1 className="text-xl font-bold mb-6">Dashboard</h1>

      <nav className="flex flex-col gap-3">
        <Link
          className={pathname.includes("/dashboard/bahan") ? "text-blue-400" : ""}
          href="/dashboard/bahan"
        >
          • Data Bahan
        </Link>

        <Link
          className={pathname.includes("/dashboard/part") ? "text-blue-400" : ""}
          href="/dashboard/part"
        >
          • Data Part
        </Link>

        <Link
          className={pathname.includes("/dashboard/user") ? "text-blue-400" : ""}
          href="/dashboard/user"
        >
          • User Management
        </Link>
      </nav>
    </div>
  );
}
