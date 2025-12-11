"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { produkService, Produk } from "@/lib/supabase";
import { RefreshCw, FileText, Save, RotateCcw, Loader2 } from "lucide-react";

export default function ProdukPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);

  const [formData, setFormData] = useState({
    namaproduk: "",
    rated: "",
    produk1: "",
    produk2: "",
    produk3: "",
    stokproduk: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState<Produk[]>([]);

  // Auth Protection
  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession.isLoggedIn) {
      router.push("/login");
    } else {
      setSession(currentSession);
      loadData();
    }
  }, [router]);

  // Load data dari Supabase
  const loadData = async () => {
    try {
      const data = await produkService.getAll();
      setDataList(data || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // Validasi
    if (!formData.namaproduk) {
      alert("Nama Produk wajib diisi!");
      return;
    }

    setIsLoading(true);

    try {
      await produkService.create(
        formData as Produk,
        session?.username || "Unknown"
      );

      alert("Data berhasil disimpan!");
      handleReset();
      loadData();
    } catch (error: any) {
      console.error("Error saving data:", error);
      alert(`Gagal menyimpan data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      namaproduk: "",
      rated: "",
      produk1: "",
      produk2: "",
      produk3: "",
      stokproduk: "",
    });
  };

  // Show loading jika belum ada session
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
    <div className="h-full flex flex-col">
      {/* Tab Header */}
      <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
        <span className="inline-block text-sm font-medium bg-white px-4 py-1 rounded-t border border-b-0 border-gray-300 shadow-sm">
          Produk ({dataList.length} data)
        </span>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-5 overflow-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-6xl">
          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  1. Nama / Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="namaproduk"
                  value={formData.namaproduk}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">2. Rated</label>
                <input
                  type="text"
                  name="rated"
                  value={formData.rated}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">3. Produk 1</label>
                <input
                  type="text"
                  name="produk1"
                  value={formData.produk1}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">4. Produk 2</label>
                <input
                  type="text"
                  name="produk2"
                  value={formData.produk2}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">5. Produk 3</label>
                <input
                  type="text"
                  name="produk3"
                  value={formData.produk3}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  6. Stok Produk / No Part
                </label>
                <select
                  name="stokproduk"
                  value={formData.stokproduk}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                >
                  <option value="">-- Pilih --</option>
                  <option value="tersedia">Tersedia</option>
                  <option value="kosong">Kosong</option>
                  <option value="preorder">Pre-Order</option>
                </select>
              </div>

              {/* Right Column */}
              <div className="space-y-4"></div>
            </div>
          </div>

          {/* Tabel Data */}
          {dataList.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3">
                Data Produk Terdaftar
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Nama Produk</th>
                      <th className="px-3 py-2 text-left">Rated</th>
                      <th className="px-3 py-2 text-left">Produk 1</th>
                      <th className="px-3 py-2 text-left">Produk 2</th>
                      <th className="px-3 py-2 text-left">Produk 3</th>
                      <th className="px-3 py-2 text-left">Stok</th>
                      <th className="px-3 py-2 text-left">Dibuat Oleh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataList.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2">{item.namaproduk}</td>
                        <td className="px-3 py-2">{item.rated}</td>
                        <td className="px-3 py-2">{item.produk1}</td>
                        <td className="px-3 py-2">{item.produk2}</td>
                        <td className="px-3 py-2">{item.produk3}</td>
                        <td className="px-3 py-2">{item.stokproduk}</td>
                        <td className="px-3 py-2">{item.createdby}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="bg-gray-100 border-t border-gray-300 px-5 py-3 flex justify-end gap-3 shadow-inner">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 border border-blue-600 text-white rounded text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save size={16} />
                Save
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 border border-red-600 text-white rounded text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow"
          >
            <RotateCcw size={16} />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
