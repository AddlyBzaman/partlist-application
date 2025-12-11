"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession, logout } from "@/lib/auth";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import LogoutModal from "@/components/modals/LogoutModal";

type MenuKey = "application" | "referensi" | "partList";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [expandedMenus, setExpandedMenus] = useState<Record<MenuKey, boolean>>({
    application: true,
    referensi: true,
    partList: false,
  });

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession.isLoggedIn) {
      router.push("/login");
    } else {
      setSession(currentSession);
    }
  }, [router]);

  const toggleMenu = (menu: MenuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  const handleLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const confirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    router.push("/login");
  };

  const cancelLogout = () => {
    setIsLogoutModalOpen(false);
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header username={session.username} onLogout={handleLogout} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar expandedMenus={expandedMenus} toggleMenu={toggleMenu} />

        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </div>
  );
}
