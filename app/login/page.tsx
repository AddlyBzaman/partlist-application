"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkLogin } from "@/lib/auth";
import { Lock, User, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cek jika sudah login, redirect ke dashboard
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      router.push('/dashboard/bahan');
    }
  }, [router]);

  const handleLogin = async () => {
    if (!username || !password) {
      alert("Username dan Password harus diisi!");
      return;
    }

    setIsLoading(true);

    try {
      const role = await checkLogin(username, password);

      if (role === "admin" || role === "superadmin") {
        // Redirect ke dashboard bahan setelah login berhasil
        router.push("/dashboard/bahan");
      } else {
        alert("Username atau Password salah!");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Terjadi kesalahan saat login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <div className="w-12 h-12 border-4 border-white rounded-lg"></div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Partlist Application</h1>
            <p className="text-sm text-gray-300">PT. Nikkatsu Electric Works</p>
          </div>

          {/* Form Section */}
          <div className="px-8 py-10">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">Selamat Datang</h2>
            <p className="text-sm text-gray-500 mb-8 text-center">Silakan login untuk melanjutkan</p>

            <div className="space-y-5" onKeyPress={handleKeyPress}>
              {/* Username Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={20} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={20} className="text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Info */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Ingat saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Demo Account:\nAdmin: admin/admin123\nSuperadmin: superadmin/super123')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Demo Account?
                </button>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleLogin}
                disabled={isLoading || !username || !password}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold py-3 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Memproses...</span>
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </div>

            {/* Info Akun Demo */}
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 font-medium mb-1">Akun Demo:</p>
              <p className="text-xs text-blue-700">Admin: admin / admin123</p>
              <p className="text-xs text-blue-700">Superadmin: superadmin / super123</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              © 2024 PT. Nikkatsu Electric Works. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}