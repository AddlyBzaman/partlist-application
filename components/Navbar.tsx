"use client";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  const logout = () => {
    document.cookie = "token=; Max-Age=0;";
    document.cookie = "role=; Max-Age=0;";
    router.push("/login");
  };

  return (
    <div className="w-full bg-white shadow p-4 flex justify-between">
      <div className="font-semibold">Aplikasi Partlist</div>

      <button
        onClick={logout}
        className="text-red-500 hover:text-red-700"
      >
        Logout
      </button>
    </div>
  );
}
