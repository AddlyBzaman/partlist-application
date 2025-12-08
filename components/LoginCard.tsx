"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkLogin } from "@/lib/auth";

export default function LoginCard() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const role = await checkLogin(username, password);

    if (role === "admin") {
      router.push("/dashboard/admin");
    } else if (role === "superadmin") {
      router.push("/dashboard/superadmin");
    } else {
      alert("Username atau Password salah!");
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-96">
      <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

      <div className="mb-4">
        <label className="block mb-1">Username</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="mb-6">
        <label className="block mb-1">Password</label>
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Login
      </button>
    </div>
  );
}
