'use client';

import React from 'react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  username: string;
  onLogout: () => void;
}

export default function Header({ username, onLogout }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-4 py-2.5 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-red-600 rounded flex items-center justify-center shadow-md">
          <div className="w-5 h-5 border-2 border-white"></div>
        </div>
        <div>
          <h1 className="text-base font-semibold leading-tight">Partlist Application</h1>
          <p className="text-xs text-gray-300 leading-tight">PT. Nikkatsu Electric Works</p>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <div className="text-right mr-2">
          <p className="text-xs text-gray-300">Welcome,</p>
          <p className="text-sm font-semibold">{username}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-sm font-medium transition-colors shadow"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
}