"use client";

import React, { useState, useEffect } from "react";
import { getSession } from "@/lib/auth/login";
import { Save, RotateCcw, Search, Download, Trash2, Plus, Minus, Loader2, Wifi, WifiOff } from "lucide-react";
import { useRealtime } from "@/hooks/useRealtime";
import { LocalStorageService } from "@/lib/storage/localStorage";

interface BahanItem {
  id: number;
  no: number;
  code: string;
  nama_bahan: string;
  spesifikasi: string;
  keterangan: string;
  pakai_pc: string;
  unit: string;
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
  const { isConnected } = useRealtime();
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
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [savedData, setSavedData] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState<{ [key: number]: boolean }>({});
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [showDraftRestore, setShowDraftRestore] = useState(false);

  useEffect(() => {
    const sess = getSession();
    setUsername((sess as any)?.username || "");
    
    // Load recent data from database
    loadRecentData();
    
    // Check for existing draft (async)
    checkForDraft();
  }, []);

  // Check for existing draft
  const checkForDraft = async () => {
    const sess = getSession();
    const userId = (sess as any)?.username;
    
    if (userId) {
      const draft = await LocalStorageService.loadDraft(userId);
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
      lastSaved: new Date().toISOString()
    };
    
    // Only save if there's actual data
    if (noprod || produkName || bahanItems.some(item => item.nama_bahan || item.code)) {
      LocalStorageService.autoSave(draftData, username);
      setHasDraft(true);
    }
  }, [noprod, produkName, satuan, bahanItems, username]);

  // Load recent data from database
  const loadRecentData = async () => {
    try {
      const response = await fetch('/api/part-list-produk/recent?limit=5');
      if (response.ok) {
        const data = await response.json();
        setSavedData(data);
      }
    } catch (error) {
      console.error('Error loading recent data:', error);
    }
  };

  // Restore draft from localStorage
  const restoreDraft = async () => {
    const draft = await LocalStorageService.loadDraft(username);
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
  const clearDraft = async () => {
    await LocalStorageService.clearDraft(username);
    setHasDraft(false);
    setShowDraftRestore(false);
  };

  // Clear draft after successful save
  const clearDraftAfterSave = async () => {
    await LocalStorageService.clearDraft(username);
    setHasDraft(false);
  };

  // Listen for real-time updates from other users
  useEffect(() => {
    const handlePartListSaved = (event: CustomEvent) => {
      const data = event.detail;
      // Don't update if this user saved it (to avoid duplicate)
      if (data.user_id !== username) {
        // Refresh data from database to get latest
        loadRecentData();
        
        // Show notification that another user saved data
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
      }
    };

    window.addEventListener('partListSaved', handlePartListSaved as EventListener);
    
    return () => {
      window.removeEventListener('partListSaved', handlePartListSaved as EventListener);
    };
  }, [username]);

  const handleProdukNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProdukName(e.target.value);
  };

  const handleNoprodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNoprod(e.target.value);
  };

  const handleSatuanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSatuan(e.target.value);
  };

  const handleBahanItemChange = (id: number, field: keyof BahanItem, value: string) => {
    setBahanItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );

    // Trigger search only when typing in code field
    if (field === 'code') {
      if (value.length >= 2) {
        searchBahan(id, value);
      } else if (value.length === 0) {
        // Clear all related fields when code is cleared
        setBahanItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  code: value,
                  nama_bahan: '',
                  spesifikasi: '',
                  keterangan: '',
                  unit: '',
                  pakai_pc: '',
                }
              : item
          )
        );
      }
    }
  };

  const searchBahan = async (itemId: number, keyword: string) => {
    setIsSearching(prev => ({ ...prev, [itemId]: true }));
    try {
      const response = await fetch(`/api/part-list-produk/search?keyword=${encodeURIComponent(keyword)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          // Auto-fill with the first result
          handleSelectBahan(itemId, data[0]);
        }
      }
    } catch (error) {
      console.error('Error searching bahan:', error);
    } finally {
      setIsSearching(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleSelectBahan = (itemId: number, bahan: BahanSearchResult) => {
    setBahanItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              code: bahan.kode_lama || bahan.code || '',
              nama_bahan: bahan.nama_bahan || bahan.namabahan || '',
              spesifikasi: bahan.spesifikasi || '',
              unit: bahan.unit || '',
              pakai_pc: bahan.pakaiperpcs || '',
            }
          : item
      )
    );
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
      alert("NOPROD, PRODUK, dan SATUAN wajib diisi!");
      return;
    }

    const hasValidBahan = bahanItems.some(
      (item) => item.nama_bahan.trim() !== ""
    );

    if (!hasValidBahan) {
      alert("Minimal harus ada satu bahan yang diisi!");
      return;
    }

    setIsLoading(true);
    try {
      // Save to API
      const response = await fetch('/api/part-list-produk/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noprod: noprod,
          produk_name: produkName,
          satuan: satuan,
          bahan_items: bahanItems.filter(item => item.nama_bahan.trim() !== ""),
          user_id: username,
        }),
      });

      if (response.ok) {
        // Add to saved data cache
        const newSavedData = {
          produkId: (await response.json()).data.produkId,
          noprod: noprod,
          produk_name: produkName,
          satuan: satuan,
          bahan_items: bahanItems.filter(item => item.nama_bahan.trim() !== ""),
          user_id: username,
          created_at: new Date().toISOString()
        };
        setSavedData(prev => [...prev, newSavedData]);
        
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
        
        // Clear draft after successful save
        clearDraftAfterSave();
        
        // Reset form without redirect
        handleReset();
      } else {
        alert("Gagal menyimpan data!");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Gagal menyimpan data!");
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
      },
    ]);
    setIsSearching({});
  };

  return (
    <div className="h-full flex flex-col">
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
          <div className="flex items-center gap-2 text-xs">
            {isConnected ? (
              <>
                <Wifi size={14} className="text-green-500" />
                <span className="text-green-600">Real-time Active</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-red-500" />
                <span className="text-red-600">Offline</span>
              </>
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
              <span className="ml-2">Apakah ingin melanjutkan data yang tersimpan?</span>
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
            <span className="font-medium">Berhasil!</span> Data Part List Produk berhasil disimpan.
          </div>
        )}

        {/* Real-time Notification */}
        {savedData.length > 0 && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 mx-5">
            <span className="font-medium">Real-time Update:</span> {savedData[savedData.length - 1]?.user_id} baru saja menyimpan data "{savedData[savedData.length - 1]?.produk_name}"
          </div>
        )}
        {/* Produk Name */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Informasi Produk</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="grid grid-cols-[150px_1fr] gap-3 items-center">
              <label className="text-sm text-gray-700">
                NOPROD <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={noprod}
                onChange={handleNoprodChange}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="Masukkan NOPROD"
              />
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
            <button
              onClick={addBahanItem}
              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium flex items-center gap-2"
            >
              <Plus size={16} />
              Tambah Bahan
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 w-12">No</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[120px]">Code</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[200px]">Nama Bahan</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[200px]">Spesifikasi</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[150px]">Keterangan</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[100px]">Pakai/PC</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 min-w-[80px]">Unit</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700 w-20">Aksi</th>
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
                    <td className="px-3 py-2 relative">
                      <div className="relative">
                        <input
                          type="text"
                          value={item.code}
                          onChange={(e) => handleBahanItemChange(item.id, "code", e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                          placeholder="Ketik kode bahan..."
                        />
                        {isSearching[item.id] && (
                          <div className="absolute right-2 top-2">
                            <Loader2 size={14} className="animate-spin text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.nama_bahan}
                        onChange={(e) => handleBahanItemChange(item.id, "nama_bahan", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Nama bahan"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.spesifikasi}
                        onChange={(e) => handleBahanItemChange(item.id, "spesifikasi", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Spesifikasi"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.keterangan}
                        onChange={(e) => handleBahanItemChange(item.id, "keterangan", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Keterangan"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.pakai_pc}
                        onChange={(e) => handleBahanItemChange(item.id, "pakai_pc", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Jumlah"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleBahanItemChange(item.id, "unit", e.target.value)}
                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Unit"
                        readOnly
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
