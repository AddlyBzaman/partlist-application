"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronRight,
  ChevronDown,
  Home,
  RefreshCw,
  FileText,
  MapPin,
  Settings,
} from "lucide-react";

type MenuKey = "application" | "referensi" | "partList";

interface SidebarProps {
  expandedMenus: Record<MenuKey, boolean>;
  toggleMenu: (menu: MenuKey) => void;
}

export default function Sidebar({ expandedMenus, toggleMenu }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="w-48 bg-white border-r border-gray-300 overflow-y-auto shadow-sm">
      <nav className="py-2">
        <div className="mb-1">
          <button
            onClick={() => toggleMenu("application")}
            className="flex items-center gap-1.5 w-full px-3 py-1.5 hover:bg-gray-100 text-left transition-colors"
          >
            {expandedMenus.application ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
            <Home size={14} className="flex-shrink-0" />
            <span className="text-xs font-semibold">APPLICATION</span>
          </button>

          {expandedMenus.application && (
            <div className="mt-1">
              <button
                onClick={() => toggleMenu("referensi")}
                className="flex items-center gap-1.5 w-full pl-6 pr-3 py-1.5 hover:bg-gray-100 text-left transition-colors"
              >
                {expandedMenus.referensi ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
                <RefreshCw size={13} className="flex-shrink-0" />
                <span className="text-xs">Referensi</span>
              </button>

              {expandedMenus.referensi && (
                <div className="mt-1">
                  <button
                    onClick={() => router.push("/dashboard/bahan")}
                    className={`flex items-center gap-1.5 w-full pl-12 pr-3 py-1.5 text-left transition-colors ${
                      isActive("/dashboard/bahan")
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <FileText size={13} className="flex-shrink-0" />
                    <span className="text-xs font-medium">Bahan</span>
                  </button>

                  <button
                    onClick={() => router.push("/dashboard/produk")}
                    className={`flex items-center gap-1.5 w-full pl-12 pr-3 py-1.5 text-left transition-colors ${
                      isActive("/dashboard/produk")
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <FileText size={13} className="flex-shrink-0" />
                    <span className="text-xs">Produk</span>
                  </button>

                  <button
                    onClick={() => router.push("/dashboard/list-bahan")}
                    className={`flex items-center gap-1.5 w-full pl-12 pr-3 py-1.5 text-left transition-colors ${
                      isActive("/dashboard/list-bahan")
                        ? "bg-blue-500 text-white"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <FileText size={13} className="flex-shrink-0" />
                    <span className="text-xs">List Bahan</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => toggleMenu("partList")}
                className="flex items-center gap-1.5 w-full pl-6 pr-3 py-1.5 hover:bg-gray-100 text-left transition-colors"
              >
                {expandedMenus.partList ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
                <FileText size={13} className="flex-shrink-0" />
                <span className="text-xs">Part List</span>
              </button>

              {expandedMenus.partList && (
                <div className="mt-1">
                  <button className="w-full pl-12 pr-3 py-1.5 hover:bg-gray-100 text-left transition-colors text-xs">
                    Part List per Produk
                  </button>
                  <button className="w-full pl-12 pr-3 py-1.5 hover:bg-gray-100 text-left transition-colors text-xs">
                    Part List per Bahan
                  </button>
                </div>
              )}

              <button className="flex items-center gap-1.5 w-full pl-6 pr-3 py-1.5 hover:bg-gray-100 text-left transition-colors">
                <ChevronRight size={14} />
                <MapPin size={13} className="flex-shrink-0" />
                <span className="text-xs">Lokasi</span>
              </button>

              <button className="flex items-center gap-1.5 w-full pl-6 pr-3 py-1.5 hover:bg-gray-100 text-left transition-colors">
                <ChevronRight size={14} />
                <Settings size={13} className="flex-shrink-0" />
                <span className="text-xs">Setup</span>
              </button>
            </div>
          )}
        </div>
      </nav>
    </aside>
  );
}
