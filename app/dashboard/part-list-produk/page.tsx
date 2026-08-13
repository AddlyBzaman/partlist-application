"use client";

import React, { useState, useEffect } from "react";
import Toast from "@/components/ui/Toast";
import { getSession } from "@/lib/auth/login";
import {
  Save,
  RotateCcw,
  Search,
  Download,
  Trash2,
  Plus,
  Minus,
  Loader2,
} from "lucide-react";
import { LocalStorageService } from "@/lib/storage/localStorage";
import {
  SkeletonLoading,
  TableSkeleton,
} from "@/components/ui/SkeletonLoading";
import * as XLSX from "xlsx";

// Fungsi untuk download Excel
const downloadExcel = (data: any[], filename: string) => {
  // Create worksheet data
  const headers = [
    "No",
    "Code",
    "Nama Bahan",
    "Spesifikasi",
    "Keterangan",
    "Pakai/PC",
    "Unit",
    "Rp.",
    "US$",
    "JPY",
    "BM %",
    "Freight",
    "USD",
    "Pembelian Terakhir",
    "Keterangan",
  ];

  const worksheetData = [
    headers,
    ...data.map((item) => [
      item.no,
      item.code || "",
      item.nama_bahan || "",
      item.spesifikasi || "",
      item.keterangan || "",
      item.pakai_pc || "",
      item.unit || "",
      item.rp || "",
      item.usd || "",
      item.jpy || "",
      item.bm_percent || "",
      item.freight || "",
      item.usd2 || "",
      item.pembelian_terakhir || "",
      item.keterangan2 || "",
    ]),
  ];

  // Create worksheet
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Create workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Daftar Bahan");

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  // Create blob
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Download
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.xlsx`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

interface BahanItem {
  id: number;
  no: number;
  code: string;
  nama_bahan: string;
  spesifikasi: string;
  keterangan: string;
  pakai_pc: string;
  unit: string;
  rp: string;
  usd: string;
  jpy: string;
  bm_percent: string;
  freight: string;
  usd2: string;
  pembelian_terakhir: string;
  keterangan2: string;
}

interface BahanSearchResult {
  id: number;
  kode_lama: string;
  kode_baru?: string;
  nama_bahan?: string;
  spesifikasi?: string;
  unit?: string;
  pakaiperpcs?: string;
  namabahan?: string;
  code?: string;
  code_baru?: string;
}

export default function PartListProdukPage() {
  const [username, setUsername] = useState<string>("");
  const [noprod, setNoprod] = useState<string>("");
  const [produkName, setProdukName] = useState<string>("");
  const [satuan, setSatuan] = useState<string>("PCS");
  const [bahanItems, setBahanItems] = useState<BahanItem[]>([
    {
      id: 1,
      no: 1,
      code: "",
      nama_bahan: "",
      spesifikasi: "",
      keterangan: "",
      pakai_pc: "",
      unit: "",
      rp: "",
      usd: "",
      jpy: "",
      bm_percent: "",
      freight: "",
      usd2: "",
      pembelian_terakhir: "",
      keterangan2: "",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [showDraftRestore, setShowDraftRestore] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  // Notification state for consistent toasts
  const [notif, setNotif] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ show: false, message: "", type: "info" });
  const showNotif = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
  ) => setNotif({ show: true, message, type });

  useEffect(() => {
    const sess = getSession();
    setUsername((sess as any)?.username || "");

    // Check for existing draft (async)
    checkForDraft();
  }, []);

  // Check for existing draft
  const checkForDraft = () => {
    const sess = getSession();
    const userId = (sess as any)?.username;

    if (userId) {
      const draft = LocalStorageService.loadDraft(userId);
      if (draft) {
        setHasDraft(true);
        setShowDraftRestore(true);
      }
    }
  };

  // Auto-save draft when form data changes
  useEffect(() => {
    const draftData = {
      noprod,
      produkName,
      satuan,
      bahanItems,
      lastSaved: new Date().toISOString(),
    };

    // Only save if there's actual data
    if (
      noprod ||
      produkName ||
      bahanItems.some((item) => item.nama_bahan || item.code)
    ) {
      LocalStorageService.autoSave(draftData, username);
      setHasDraft(true);
    }
  }, [noprod, produkName, satuan, bahanItems, username]);

  // Load recent data from database - REMOVED
  // const loadRecentData = async () => {
  //   try {
  //     const response = await fetch('/api/part-list-produk/recent', {
  //       headers: {
  //         'x-limit': '5'
  //       }
  //     });
  //     if (response.ok) {
  //       const data = await response.json();
  //       setSavedData(data);
  //     }
  //   } catch (error) {
  //     console.error('Error loading recent data:', error);
  //   }
  // };

  // Restore draft from localStorage
  const restoreDraft = () => {
    const draft = LocalStorageService.loadDraft(username);
    if (draft) {
      setNoprod(draft.noprod);
      setProdukName(draft.produkName);
      setSatuan(draft.satuan);
      setBahanItems(draft.bahanItems);
      setShowDraftRestore(false);
      setHasDraft(false);
    }
  };

  // Clear draft
  const clearDraft = () => {
    LocalStorageService.clearDraft(username);
    setHasDraft(false);
    setShowDraftRestore(false);
  };

  // Clear draft after successful save
  const clearDraftAfterSave = () => {
    LocalStorageService.clearDraft(username);
    setHasDraft(false);
  };

  // Listen for real-time updates from other users - REMOVED
  // useEffect(() => {
  //   const handlePartListSaved = (event: CustomEvent) => {
  //     const data = event.detail;
  //     if (data.user_id !== username) {
  //       loadRecentData();
  //       setShowSuccessMessage(true);
  //       setTimeout(() => setShowSuccessMessage(false), 5000);
  //     }
  //   };
  //   window.addEventListener('partListSaved', handlePartListSaved as EventListener);
  //   return () => {
  //     window.removeEventListener('partListSaved', handlePartListSaved as EventListener);
  //   };
  // }, [username]);

  const handleProdukNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProdukName(e.target.value);
  };

  const handleNoprodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNoprod(value);

    // Search when typing
    if (value.length >= 3) {
      searchPartlist(value);
    } else {
      setShowDropdown(false);
      setSearchResults([]);
    }
  };

  const searchPartlist = async (keyword: string) => {
    setIsSearching(true);
    try {
      const response = await fetch("/api/produk/search", {
        method: "GET",
        headers: {
          "x-keyword": keyword,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowDropdown(data.length > 0);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error("Error searching partlist:", error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPartlistItem = (item: any) => {
    setNoprod(item.NOPROD || "");
    setProdukName(item.PRODUK || "");
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleSatuanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSatuan(e.target.value);
  };

  const handleBahanItemBlur = (id: number, field: string, value: string) => {
    // Only process pakai_pc field on blur
    if (field === "pakai_pc" && value) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        const dividedValue = numValue / 1000;
        let processedValue;

        // Always format with 3 decimal places for consistency
        processedValue = dividedValue.toFixed(3).replace(".", ",");

        // Update with processed value
        setBahanItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  [field]: processedValue,
                }
              : item,
          ),
        );
      }
    }
  };

  const handleBahanItemChange = (id: number, field: string, value: string) => {
    setBahanItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );

    // Auto-fill when typing in code field and exact match found
    if (field === "code" && value.length >= 3) {
      searchAndAutoFill(id, value);
    } else if (field === "code" && value.length === 0) {
      // Clear all related fields when code is cleared
      setBahanItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                code: value,
                nama_bahan: "",
                spesifikasi: "",
                keterangan: "",
                unit: "",
                pakai_pc: "",
              }
            : item,
        ),
      );
    }
  };

  // Search and auto-fill if exact match found
  const searchAndAutoFill = async (itemId: number, keyword: string) => {
    console.log("Auto-filling for keyword:", keyword);

    try {
      const response = await fetch("/api/part-list-produk/search", {
        method: "GET",
        headers: {
          "x-keyword": keyword,
        },
      });

      if (response.ok) {
        const results = await response.json();
        console.log("Search results:", results);

        // Find exact match
        const exactMatch = results.find(
          (bahan: BahanSearchResult) =>
            bahan.kode_lama === keyword ||
            bahan.kode_lama?.toLowerCase() === keyword.toLowerCase(),
        );

        if (exactMatch) {
          console.log("Exact match found:", exactMatch);
          setBahanItems((prev) =>
            prev.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    code: exactMatch.kode_lama || exactMatch.code || "",
                    nama_bahan:
                      exactMatch.nama_bahan || exactMatch.namabahan || "",
                    spesifikasi: exactMatch.spesifikasi || "",
                    unit: exactMatch.unit || "",
                    pakai_pc: exactMatch.pakaiperpcs || "",
                  }
                : item,
            ),
          );
        }
      }
    } catch (error) {
      console.error("Error auto-filling:", error);
    }
  };

  const addBahanItem = () => {
    const newId = Math.max(...bahanItems.map((item) => item.id)) + 1;
    const newNo = Math.max(...bahanItems.map((item) => item.no)) + 1;
    setBahanItems((prev) => [
      ...prev,
      {
        id: newId,
        no: newNo,
        code: "",
        nama_bahan: "",
        spesifikasi: "",
        keterangan: "",
        pakai_pc: "",
        unit: "",
        rp: "",
        usd: "",
        jpy: "",
        bm_percent: "",
        freight: "",
        usd2: "",
        pembelian_terakhir: "",
        keterangan2: "",
      },
    ]);
  };

  const removeBahanItem = (id: number) => {
    if (bahanItems.length > 1) {
      setBahanItems((prev) => {
        const filtered = prev.filter((item) => item.id !== id);
        // Renumber the remaining items
        return filtered.map((item, index) => ({
          ...item,
          no: index + 1,
        }));
      });
    }
  };

  const handleSave = async () => {
    if (!noprod.trim() || !produkName.trim() || !satuan.trim()) {
      showNotif("NOPROD, PRODUK, dan SATUAN wajib diisi!", "error");
      return;
    }

    const hasValidBahan = bahanItems.some(
      (item) => item.nama_bahan.trim() !== "",
    );

    if (!hasValidBahan) {
      showNotif("Minimal harus ada satu bahan yang diisi!", "error");
      return;
    }

    setIsLoading(true);
    try {
      // Save to API
      const response = await fetch("/api/part-list-produk/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noprod: noprod,
          produk_name: produkName,
          satuan: satuan,
          bahan_items: bahanItems.filter(
            (item) => item.nama_bahan.trim() !== "",
          ),
          user_id: username,
        }),
      });

      if (response.ok) {
        const resJson = await response.json();
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);

        // Clear draft after successful save
        clearDraftAfterSave();

        // Reset form without redirect
        handleReset();

        // Dispatch a custom event so other open pages (laporan) can refresh
        try {
          window.dispatchEvent(
            new CustomEvent("partListSaved", { detail: resJson?.data }),
          );
        } catch (e) {
          // ignore in non-browser environments
        }
      } else {
        showNotif("Gagal menyimpan data!", "error");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      showNotif("Gagal menyimpan data!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setNoprod("");
    setProdukName("");
    setSatuan("PCS");
    setBahanItems([
      {
        id: 1,
        no: 1,
        code: "",
        nama_bahan: "",
        spesifikasi: "",
        keterangan: "",
        pakai_pc: "",
        unit: "",
        rp: "",
        usd: "",
        jpy: "",
        bm_percent: "",
        freight: "",
        usd2: "",
        pembelian_terakhir: "",
        keterangan2: "",
      },
    ]);
    setShowDropdown(false);
    setSearchResults([]);
  };

  return (
    <div className="h-full flex flex-col">
      <Toast
        show={notif.show}
        message={notif.message}
        type={notif.type}
        onClose={() => setNotif({ show: false, message: "", type: "info" })}
      />

      {/* Tab Header */}
      <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="inline-block text-sm font-medium bg-white px-4 py-1 rounded-t border border-b-0 border-gray-300 shadow-sm">
              Part List per Produk
            </span>
            {hasDraft && (
              <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                Draft tersimpan
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-5 overflow-auto">
        {/* Draft Restore Notification */}
        {showDraftRestore && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 mx-5">
            <div className="flex justify-between items-center">
              <div>
                <span className="font-medium">Draft tersimpan!</span>
                <span className="ml-2">
                  Apakah ingin melanjutkan data yang tersimpan?
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={restoreDraft}
                  className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                >
                  Lanjutkan
                </button>
                <button
                  onClick={clearDraft}
                  className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                >
                  Buang
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 mx-5">
            <span className="font-medium">Berhasil!</span> Data Part List Produk
            berhasil disimpan.
          </div>
        )}
        {/* Produk Name */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Informasi Produk</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="grid grid-cols-[150px_1fr] gap-3 items-center relative">
              <label className="text-sm text-gray-700">
                NOPROD <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={noprod}
                  onChange={handleNoprodChange}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Cari NOPROD dari tabel partlist..."
                />

                {/* Dropdown Search Results */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
                    {searchResults.map((item, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSelectPartlistItem(item)}
                      >
                        <div className="text-sm font-medium">
                          {item.NOPROD || "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.PRODUK || "-"} | {item.RATED || "-"} |{" "}
                          {item.NO_PART || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Loading indicator */}
                {isSearching && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded mt-1 shadow-lg z-10 px-3 py-2">
                    <div className="text-sm text-gray-500">Mencari...</div>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-3 items-center">
              <label className="text-sm text-gray-700">
                PRODUK <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={produkName}
                onChange={handleProdukNameChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Masukkan nama produk"
              />
            </div>
            <div className="grid grid-cols-[150px_1fr] gap-3 items-center">
              <label className="text-sm text-gray-700">
                SATUAN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={satuan}
                onChange={handleSatuanChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Masukkan satuan"
              />
            </div>
          </div>
        </div>

        {/* Bahan Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Daftar Bahan</h3>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  downloadExcel(
                    bahanItems,
                    `Daftar_Bahan_${produkName || "Produk"}_${new Date().toISOString().split("T")[0]}`,
                  )
                }
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium flex items-center gap-2"
                title="Download Excel"
              >
                <Download size={16} />
                Download Excel
              </button>
              <button
                onClick={addBahanItem}
                className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium flex items-center gap-2"
              >
                <Plus size={16} />
                Tambah Bahan
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 w-12">
                    No
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[120px]">
                    Code
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[200px]">
                    Nama Bahan
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[200px]">
                    Spesifikasi
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[150px]">
                    Keterangan
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[100px]">
                    Pakai/PC
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[80px]">
                    Unit
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[100px]">
                    Rp.
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[100px]">
                    US$
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[100px]">
                    JPY
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[80px]">
                    BM %
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[100px]">
                    Freight
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[100px]">
                    USD
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[120px]">
                    Pembelian Terakhir
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[150px]">
                    Keterangan
                  </th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700 w-20">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {bahanItems.map((item) => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.no}
                        readOnly
                        className="w-full border border-gray-200 rounded px-2 py-1 text-sm bg-gray-50 text-center"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.code}
                        onChange={(e) =>
                          handleBahanItemChange(item.id, "code", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Ketik kode bahan..."
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.nama_bahan}
                        onChange={(e) =>
                          handleBahanItemChange(
                            item.id,
                            "nama_bahan",
                            e.target.value,
                          )
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Nama bahan"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.spesifikasi}
                        onChange={(e) =>
                          handleBahanItemChange(
                            item.id,
                            "spesifikasi",
                            e.target.value,
                          )
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Spesifikasi"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.keterangan}
                        onChange={(e) =>
                          handleBahanItemChange(
                            item.id,
                            "keterangan",
                            e.target.value,
                          )
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Keterangan"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.pakai_pc}
                        onChange={(e) =>
                          handleBahanItemChange(
                            item.id,
                            "pakai_pc",
                            e.target.value,
                          )
                        }
                        onBlur={(e) =>
                          handleBahanItemBlur(
                            item.id,
                            "pakai_pc",
                            e.target.value,
                          )
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Jumlah"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) =>
                          handleBahanItemChange(item.id, "unit", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Unit"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.rp}
                        onChange={(e) =>
                          handleBahanItemChange(item.id, "rp", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Rp."
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.usd}
                        onChange={(e) =>
                          handleBahanItemChange(item.id, "usd", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="US$"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.jpy}
                        onChange={(e) =>
                          handleBahanItemChange(item.id, "jpy", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="JPY"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.bm_percent}
                        onChange={(e) =>
                          handleBahanItemChange(
                            item.id,
                            "bm_percent",
                            e.target.value,
                          )
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="BM %"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.freight}
                        onChange={(e) =>
                          handleBahanItemChange(
                            item.id,
                            "freight",
                            e.target.value,
                          )
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Freight"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.usd2}
                        onChange={(e) =>
                          handleBahanItemChange(item.id, "usd2", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="USD"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.pembelian_terakhir}
                        onChange={(e) =>
                          handleBahanItemChange(
                            item.id,
                            "pembelian_terakhir",
                            e.target.value,
                          )
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Pembelian Terakhir"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.keterangan2}
                        onChange={(e) =>
                          handleBahanItemChange(
                            item.id,
                            "keterangan2",
                            e.target.value,
                          )
                        }
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Keterangan"
                      />
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => removeBahanItem(item.id)}
                        disabled={bahanItems.length === 1}
                        className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Hapus"
                      >
                        <Minus size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="bg-gray-100 border-t border-gray-300 px-5 py-3 flex justify-end gap-3">
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
