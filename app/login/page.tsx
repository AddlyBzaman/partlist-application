"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth/login"; // <-- pakai logic baru
import { Lock, User, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("isLoggedIn") === "true") {
      router.push("/dashboard/bahan");
    }
  }, [router]);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Username dan Password harus diisi!");
      return;
    }

    setIsLoading(true);

    const user = await loginUser(username, password);

    if (!user) {
      alert("Username atau Password salah!");
      setIsLoading(false);
      return;
    }

    router.push("/dashboard/bahan");
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 flex items-center justify-center p-4"
      onKeyPress={handleKeyPress}
    >
      {/* UI TETAP SAMA */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        ></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <div className="w-12 h-12 border-4 border-white rounded-lg"></div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Partlist Application</h1>
            <p className="text-sm text-gray-300">PT. Nikkatsu Electric Works</p>
          </div>

          <div className="px-8 py-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
              Selamat Datang
            </h2>
            <p className="text-sm text-gray-500 mb-8 text-center">
              Silakan login untuk melanjutkan
            </p>

            <div className="space-y-5">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 border rounded-lg"
                    placeholder="Masukkan username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full pl-10 pr-12 py-3 border rounded-lg"
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
              >
                {isLoading ? "Memproses..." : "Login"}
              </button>
            </div>
          </div>

          <div className="px-8 py-6 bg-gray-50 text-center text-xs">
            © 2025 PT. Nikkatsu Electric Works
          </div>
        </div>
      </div>
    </div>
  );
}
