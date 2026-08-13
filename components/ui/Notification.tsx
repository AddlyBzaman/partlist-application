"use client";

import React, { useEffect } from "react";

interface NotificationProps {
  show: boolean;
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose?: () => void;
}

export default function Notification({
  show,
  message,
  type = "info",
  duration = 4000,
  onClose,
}: NotificationProps) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [show, duration, onClose]);

  if (!show) return null;

  const colorMap: Record<string, string> = {
    success: "bg-green-50 border-green-400 text-green-800",
    error: "bg-red-50 border-red-400 text-red-800",
    info: "bg-blue-50 border-blue-400 text-blue-800",
    warning: "bg-yellow-50 border-yellow-400 text-yellow-800",
  };

  const classes = colorMap[type] || colorMap.info;

  return (
    <div className="pointer-events-none fixed top-6 right-6 z-50">
      <div
        className={`pointer-events-auto max-w-sm w-full rounded-md border px-4 py-3 shadow-md flex items-start gap-3 ${classes}`}
        role="status"
      >
        <div className="flex-shrink-0 mt-0.5">
          {type === "success" && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17l-5-5"
                stroke="#16A34A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {type === "error" && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="#DC2626"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {type === "info" && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 9h.01M11 12h1v4h1"
                stroke="#2563EB"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="9" stroke="#2563EB" strokeWidth="1" />
            </svg>
          )}
          {type === "warning" && (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                stroke="#B45309"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <div className="flex-1 text-sm leading-tight">
          <div className="font-medium">{message}</div>
        </div>

        <button
          onClick={() => onClose && onClose()}
          className="text-sm text-gray-500 hover:text-gray-700 ml-2"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}
