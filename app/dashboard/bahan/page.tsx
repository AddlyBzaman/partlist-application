"use client";

import React, { useState, useEffect } from "react";
import Notification from "@/components/ui/Notification";
import { getSession } from "@/lib/auth/login";
import { bahanService } from "@/lib/services/bahanService";
import { Save, RotateCcw, Search, Download, Trash2 } from "lucide-react";

export default function BahanPage() {
  const [username, setUsername] = useState<string>("");
  const [formData, setFormData] = useState({
    code_lama: "",
    nama_bahan: "",
    spesifikasi_bahan: "",
    ukuran_unit: "",
    rumus: "",
    code_baru: "",
    produk: "",
    pakaiperpcs: "",
    namawip: "",
    departemen: "",
    bagian: "",
    namabahan: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState<any[]>([]);
  const [notif, setNotif] = useState<{ show: boolean; message: string; type: "success" | "error" | "info" | "warning" }>({ show: false, message: "", type: "info" });

  const showNotif = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    setNotif({ show: true, message, type });
  };

  useEffect(() => {
    const sess = getSession();
    setUsername((sess as any)?.username || "");
    
    // Load existing data
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await bahanService.getAll();
      setDataList(data);
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
    if (!formData.nama_bahan) {
      showNotif("Nama Bahan wajib diisi!", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Save using bahanService
      await bahanService.create(formData, username || "admin");
      
      // Reload data
      const updatedData = await bahanService.getAll();
      setDataList(updatedData);
      
      showNotif("Data berhasil disimpan!", "success");
      handleReset();
    } catch (error) {
      console.error("Error saving data:", error);
      showNotif("Gagal menyimpan data!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      code_lama: "",
      nama_bahan: "",
      spesifikasi_bahan: "",
      ukuran_unit: "",
      rumus: "",
      code_baru: "",
      produk: "",
      pakaiperpcs: "",
      namawip: "",
      departemen: "",
      bagian: "",
      namabahan: "",
    });
  };

  const handleDelete = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      try {
        await bahanService.deleteById(id);
        const updatedData = await bahanService.getAll();
        setDataList(updatedData);
        showNotif("Data berhasil dihapus!", "success");
      } catch (error) {
        console.error("Error deleting data:", error);
        showNotif("Gagal menghapus data!", "error");
      }
    }
  };

  const exportToExcel = () => {
    if (dataList.length === 0) {
      showNotif("Tidak ada data untuk diekspor!", "info");
      return;
    }
    showNotif("Export Excel functionality akan ditambahkan nanti", "info");
  };

  // Render notification toast
  

  return (
    <div className="h-full flex flex-col">
      <Notification
        show={notif.show}
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ show: false, message: "", type: "info" })}
      />
      {/* Tab Header */}
      <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
        <span className="inline-block text-sm font-medium bg-white px-4 py-1 rounded-t border border-b-0 border-gray-300 shadow-sm">
          Bahan ({dataList.length} data)
        </span>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-5 overflow-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl">
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  1. Kode Bahan
                </label>
                <input
                  type="text"
                  name="code_lama"
                  value={formData.code_lama}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  2. Nama Bahan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_bahan"
                  value={formData.nama_bahan}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  3. Spesifikasi
                </label>
                <input
                  type="text"
                  name="spesifikasi_bahan"
                  value={formData.spesifikasi_bahan}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  4. Unit
                </label>
                <input
                  type="text"
                  name="ukuran_unit"
                  value={formData.ukuran_unit}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  5. Rumus
                </label>
                <input
                  type="text"
                  name="rumus"
                  value={formData.rumus}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  6. Kode Baru
                </label>
                <input
                  type="text"
                  name="code_baru"
                  value={formData.code_baru}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">7. Produk</label>
                <input
                  type="text"
                  name="produk"
                  value={formData.produk}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">8. Pakai/PCS</label>
                <input
                  type="text"
                  name="pakaiperpcs"
                  value={formData.pakaiperpcs}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">9. Nama WIP</label>
                <input
                  type="text"
                  name="namawip"
                  value={formData.namawip}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">10. Departemen</label>
                <input
                  type="text"
                  name="departemen"
                  value={formData.departemen}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">11. Bagian</label>
                <input
                  type="text"
                  name="bagian"
                  value={formData.bagian}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">12. Nama Bahan</label>
                <input
                  type="text"
                  name="namabahan"
                  value={formData.namabahan}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tabel Data */}
        {dataList.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold mb-3">Data Bahan Terdaftar</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Kode</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Nama Bahan</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Spesifikasi</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">Unit</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700">User</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2">{item.CODE || "-"}</td>
                      <td className="px-3 py-2">{item.LNAMA || "-"}</td>
                      <td className="px-3 py-2">{item.SPEK || "-"}</td>
                      <td className="px-3 py-2">{item.UNIT || "-"}</td>
                      <td className="px-3 py-2">{item.user_id || "-"}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded text-xs font-medium"
                        >
                          <Trash2 size={12} />
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="bg-gray-100 border-t border-gray-300 px-5 py-3 flex justify-end gap-3">
        <button
          onClick={exportToExcel}
          className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium flex items-center gap-2"
        >
          <Download size={16} />
          Export Excel
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={16} />
          {isLoading ? "Menyimpan..." : "Save"}
        </button>
        <button
          onClick={handleReset}
          className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium flex items-center gap-2"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>
    </div>
  );
}
