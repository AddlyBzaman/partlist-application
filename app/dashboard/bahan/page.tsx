"use client";

import React, { useState, useEffect } from "react";
import { bahanService, bahanSementaraService, Bahan } from "@/lib/supabase";
import {
  Save,
  RotateCcw,
  Search,
  Loader2,
  Download,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";
import SearchModal from "@/components/modals/SearchModal";
import DeleteConfirmModal from "@/components/modals/DeleteConfirmModal";

export default function BahanPage() {
  const [sessionId, setSessionId] = useState<string>("");
  const [formData, setFormData] = useState({
    code_lama: "",
    nama_bahan: "",
    spesifikasi_bahan: "",
    ukuran_unit: "",
    stok_awal: "",
    nama_loket: "",
    keterangan1: "",
    keterangan2: "",
    keterangan3: "",
    keterangan4: "",
    keterangan5: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState<Bahan[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<Bahan[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isBrowseModalOpen, setIsBrowseModalOpen] = useState(false);
  const [browseSearchQuery, setBrowseSearchQuery] = useState("");
  const [browseSearchResults, setBrowseSearchResults] = useState<Bahan[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    id: number | null;
    itemName: string;
  }>({
    show: false,
    id: null,
    itemName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Get or generate session ID from localStorage
    const storedSessionId = localStorage.getItem("bahanSessionId");
    const newSessionId =
      storedSessionId ||
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    if (!storedSessionId) {
      localStorage.setItem("bahanSessionId", newSessionId);
    }

    setSessionId(newSessionId);
    loadData(newSessionId);
  }, []);

  const loadData = async (sessionIdParam?: string) => {
    try {
      const id = sessionIdParam || sessionId;
      const data = await bahanSementaraService.getAllBySession(id);
      if (data && data.length > 0) {
        setDataList(data);
        // Save to localStorage as backup
        localStorage.setItem(`bahanData_${id}`, JSON.stringify(data));
      } else {
        // Try to load from localStorage if Supabase is empty
        const cachedData = localStorage.getItem(`bahanData_${id}`);
        if (cachedData) {
          setDataList(JSON.parse(cachedData));
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      // Fallback to localStorage on error
      const id = sessionIdParam || sessionId;
      const cachedData = localStorage.getItem(`bahanData_${id}`);
      if (cachedData) {
        setDataList(JSON.parse(cachedData));
      }
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

  const handleCodeSearch = async (value: string) => {
    setFormData((prev) => ({ ...prev, code_lama: value }));

    if (value.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await bahanService.search(value);
      setSearchResults(results || []);
      setShowDropdown(results && results.length > 0);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectBahan = (bahan: Bahan) => {
    setFormData((prev) => ({
      ...prev,
      code_lama: bahan.code_lama,
      nama_bahan: bahan.nama_bahan,
      spesifikasi_bahan: bahan.spesifikasi_bahan,
    }));
    setShowDropdown(false);
  };

  const executeSearch = async (keyword: string) => {
    setIsSearchModalOpen(false);

    if (keyword) {
      try {
        const results = await bahanService.search(keyword);
        setDataList(results || []);
      } catch (error) {
        console.error("Error searching:", error);
        alert("Gagal melakukan pencarian");
      }
    }
  };

  const handleBrowse = () => {
    setIsBrowseModalOpen(true);
    setBrowseSearchQuery("");
    setBrowseSearchResults(dataList);
  };

  const handleBrowseSearch = (keyword: string) => {
    setBrowseSearchQuery(keyword);

    if (!keyword) {
      setBrowseSearchResults(dataList);
      return;
    }

    const filtered = dataList.filter(
      (item) =>
        item.code_lama.toLowerCase().includes(keyword.toLowerCase()) ||
        item.nama_bahan.toLowerCase().includes(keyword.toLowerCase()) ||
        item.spesifikasi_bahan?.toLowerCase().includes(keyword.toLowerCase())
    );

    setBrowseSearchResults(filtered);
  };

  const handleSelectFromBrowse = (item: Bahan) => {
    setFormData((prev) => ({
      ...prev,
      code_lama: item.code_lama,
      nama_bahan: item.nama_bahan,
      spesifikasi_bahan: item.spesifikasi_bahan,
    }));
    setIsBrowseModalOpen(false);
  };

  const exportToExcel = () => {
    if (dataList.length === 0) {
      alert("Tidak ada data untuk diekspor!");
      return;
    }

    const exportData = dataList.map((item) => ({
      "Kode Bahan": item.code_lama,
      "Nama Bahan": item.nama_bahan,
      Spesifikasi: item.spesifikasi_bahan,
      "Ukuran/Unit": item.ukuran_unit,
      "Stok Awal": item.stok_awal,
      "Nama Loket": item.nama_loket,
      "Keterangan 1": item.keterangan1 || "",
      "Keterangan 2": item.keterangan2 || "",
      "Keterangan 3": item.keterangan3 || "",
      "Keterangan 4": item.keterangan4 || "",
      "Keterangan 5": item.keterangan5 || "",
      "Dibuat Oleh": item.created_by || "",
      "Dibuat Pada": item.created_at
        ? new Date(item.created_at).toLocaleString("id-ID")
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Bahan");

    // Set column widths
    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
    ];

    const fileName = `Data_Bahan_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handleDeleteRow = async (id: number | undefined) => {
    if (!id) {
      alert("ID tidak valid!");
      return;
    }

    const item = dataList.find((i) => i.id === id);
    setDeleteConfirm({
      show: true,
      id,
      itemName: item?.nama_bahan || "Data",
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;

    setIsDeleting(true);
    try {
      await bahanSementaraService.deleteById(deleteConfirm.id);

      // Update dataList
      const updatedData = dataList.filter(
        (item) => item.id !== deleteConfirm.id
      );
      setDataList(updatedData);

      // Update localStorage
      localStorage.setItem(
        `bahanData_${sessionId}`,
        JSON.stringify(updatedData)
      );

      setDeleteConfirm({ show: false, id: null, itemName: "" });
      alert("Data berhasil dihapus!");
    } catch (error: any) {
      console.error("Error deleting data:", error);
      alert(`Gagal menghapus data: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ show: false, id: null, itemName: "" });
  };

  const handleSave = async () => {
    if (!formData.nama_bahan) {
      alert("Nama Bahan wajib diisi!");
      return;
    }

    setIsLoading(true);

    try {
      const savedData = await bahanSementaraService.create(
        formData as Bahan,
        "admin",
        sessionId
      );

      // Update localStorage with new data
      const currentData = dataList;
      const updatedData = [...currentData, savedData[0]];
      localStorage.setItem(
        `bahanData_${sessionId}`,
        JSON.stringify(updatedData)
      );
      setDataList(updatedData);

      alert("Data berhasil disimpan!");
      handleReset();
    } catch (error: any) {
      console.error("Error saving data:", error);
      alert(`Gagal menyimpan data: ${error.message}`);
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
      stok_awal: "",
      nama_loket: "",
      keterangan1: "",
      keterangan2: "",
      keterangan3: "",
      keterangan4: "",
      keterangan5: "",
    });
    setSearchResults([]);
    setShowDropdown(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Header */}
      <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
        <span className="inline-block text-sm font-medium bg-white px-4 py-1 rounded-t border border-b-0 border-gray-300 shadow-sm">
          Bahan ({dataList.length} data)
        </span>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-5 overflow-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-6xl">
          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Code Lama dengan Autocomplete */}
              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  1. Code Lama / Code Baru
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="code_lama"
                    value={formData.code_lama}
                    onChange={(e) => handleCodeSearch(e.target.value)}
                    onFocus={() =>
                      formData.code_lama.length >= 2 && setShowDropdown(true)
                    }
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    placeholder="Ketik untuk mencari..."
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  />
                  {isSearching && (
                    <div className="absolute right-2 top-2">
                      <Loader2
                        size={16}
                        className="animate-spin text-gray-400"
                      />
                    </div>
                  )}

                  {/* Dropdown Search Results */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleSelectBahan(item)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-b-0 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-800">
                            {item.code_lama}
                          </div>
                          <div className="text-xs text-gray-600">
                            {item.nama_bahan}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {item.spesifikasi_bahan}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  2. Nama Bahan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_bahan"
                  value={formData.nama_bahan}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  3. Spesifikasi Bahan
                </label>
                <input
                  type="text"
                  name="spesifikasi_bahan"
                  value={formData.spesifikasi_bahan}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  4. Ukuran / Unit Bahan
                </label>
                <input
                  type="text"
                  name="ukuran_unit"
                  value={formData.ukuran_unit}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  5. Stok Awal / Jenis Bahan
                </label>
                <select
                  name="stok_awal"
                  value={formData.stok_awal}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                >
                  <option value="">-- Pilih --</option>
                  <option value="local">Local</option>
                  <option value="import">Import</option>
                </select>
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  6. Nama - Loket Bahan
                </label>
                <input
                  type="text"
                  name="nama_loket"
                  value={formData.nama_loket}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-[160px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">7. Keterangan-1</label>
                <input
                  type="text"
                  name="keterangan1"
                  value={formData.keterangan1}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[160px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">8. Keterangan-2</label>
                <input
                  type="text"
                  name="keterangan2"
                  value={formData.keterangan2}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[160px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">9. Keterangan-3</label>
                <input
                  type="text"
                  name="keterangan3"
                  value={formData.keterangan3}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[160px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  10. Keterangan-4
                </label>
                <input
                  type="text"
                  name="keterangan4"
                  value={formData.keterangan4}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[160px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  11. Keterangan-5
                </label>
                <input
                  type="text"
                  name="keterangan5"
                  value={formData.keterangan5}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
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
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Code
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Nama Bahan
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Spesifikasi
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Ukuran
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Stok Awal
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Nama Loket
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Ket. 1
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Ket. 2
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Ket. 3
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Ket. 4
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Ket. 5
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Dibuat Oleh
                    </th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Tanggal
                    </th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dataList.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2">{item.code_lama || "-"}</td>
                      <td className="px-3 py-2">{item.nama_bahan || "-"}</td>
                      <td className="px-3 py-2">
                        {item.spesifikasi_bahan || "-"}
                      </td>
                      <td className="px-3 py-2">{item.ukuran_unit || "-"}</td>
                      <td className="px-3 py-2">{item.stok_awal || "-"}</td>
                      <td className="px-3 py-2">{item.nama_loket || "-"}</td>
                      <td className="px-3 py-2">{item.keterangan1 || "-"}</td>
                      <td className="px-3 py-2">{item.keterangan2 || "-"}</td>
                      <td className="px-3 py-2">{item.keterangan3 || "-"}</td>
                      <td className="px-3 py-2">{item.keterangan4 || "-"}</td>
                      <td className="px-3 py-2">{item.keterangan5 || "-"}</td>
                      <td className="px-3 py-2">{item.created_by || "-"}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => handleDeleteRow(item.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded text-xs font-medium transition-colors"
                          title="Hapus data"
                        >
                          <Trash2 size={14} />
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
      <div className="bg-gray-100 border-t border-gray-300 px-5 py-3 flex justify-end gap-3 shadow-inner">
        <button
          onClick={handleBrowse}
          className="px-5 py-2 bg-gray-200 hover:bg-gray-300 border border-gray-400 rounded text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow"
        >
          <Search size={16} />
          Browse
        </button>
        <button
          onClick={exportToExcel}
          className="px-5 py-2 bg-green-500 hover:bg-green-600 border border-green-600 text-white rounded text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow"
        >
          <Download size={16} />
          Export Excel
        </button>
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

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSubmit={executeSearch}
      />

      {/* Browse Modal - Search from Temporary Table */}
      {isBrowseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Browse Data Bahan dari Tabel Sementara
              </h3>
              <button
                onClick={() => setIsBrowseModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <input
                type="text"
                placeholder="Cari berdasarkan kode, nama, atau spesifikasi..."
                value={browseSearchQuery}
                onChange={(e) => handleBrowseSearch(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {browseSearchResults.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  <div className="text-center">
                    <Search size={48} className="mx-auto mb-2 text-gray-300" />
                    <p>Tidak ada data yang cocok</p>
                    {browseSearchQuery && (
                      <p className="text-xs mt-2">Coba ubah pencarian Anda</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {browseSearchResults.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleSelectFromBrowse(item)}
                      className="w-full text-left px-6 py-4 hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                            {item.code_lama} - {item.nama_bahan}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {item.spesifikasi_bahan}
                          </div>
                          <div className="flex gap-4 mt-2 text-xs text-gray-500">
                            <span>Ukuran: {item.ukuran_unit}</span>
                            <span>Jenis: {item.stok_awal}</span>
                          </div>
                        </div>
                        <div className="ml-4 text-blue-500 group-hover:text-blue-600">
                          →
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsBrowseModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Hapus Data
              </h3>
            </div>

            {/* Content */}
            <div className="px-6 py-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 size={20} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Apakah Anda yakin ingin menghapus data berikut?
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-2 p-3 bg-gray-50 rounded border border-gray-200">
                    {deleteConfirm.itemName}
                  </p>
                  <p className="text-xs text-gray-500 mt-3">
                    Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Hapus Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
