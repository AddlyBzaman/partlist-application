"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { produkService, produkSnr18KaiService, produkBahanService, bahanService, snr18KaiService, Produk, ProdukSnr18Kai, ProdukBahan, SNR18KAI, Bahan } from "@/lib/supabase";
import { RefreshCw, FileText, Save, RotateCcw, Loader2, Search } from "lucide-react";

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

  const [suggestions, setSuggestions] = useState<SNR18KAI[]>([]);
  const [bahanSuggestions, setBahanSuggestions] = useState<Bahan[]>([]);
  const [produkSuggestions, setProdukSuggestions] = useState<Produk[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showBahanSuggestions, setShowBahanSuggestions] = useState(false);
  const [showProdukSuggestions, setShowProdukSuggestions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<SNR18KAI | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Produk[]>([]);
  const [selectedProduk, setSelectedProduk] = useState<Produk | null>(null);
  const [assignedSnr18Kais, setAssignedSnr18Kais] = useState<ProdukSnr18Kai[]>([]);
  const [assignedBahans, setAssignedBahans] = useState<ProdukBahan[]>([]);

  // Auth Protection
  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession.isLoggedIn) {
      router.push("/login");
    } else {
      setSession(currentSession);
    }
  }, [router]);

  // Search produk function
  const handleSearch = async (keyword: string) => {
    if (keyword.length > 2) {
      try {
        console.log("Searching for:", keyword);
        
        // Search di tabel produk
        const produkResults = await produkService.search(keyword);
        console.log("Produk search results:", produkResults);
        
        // Search di SNR18-KAI dan convert ke format produk
        const snr18Results = await snr18KaiService.search(keyword);
        console.log("SNR18-KAI search results:", snr18Results);
        
        // Convert SNR18-KAI ke format produk untuk display
        const convertedSnr18 = snr18Results.map((item) => ({
          id: item.id,
          namaproduk: item.namaBahan,
          rated: '',
          produk1: '',
          produk2: '',
          produk3: '',
          stokproduk: '',
          createdby: item.created_at,
          createdat: item.created_at,
          updatedat: item.updated_at,
          produkSnr18Kais: [],
          produkBahans: [],
        }));
        
        // Combine results
        const allResults = [...produkResults, ...convertedSnr18];
        console.log("Combined results:", allResults);
        setSearchResults(allResults);
      } catch (error) {
        console.error("Error searching produk:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleInputChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Search produk ketika mengetik di nama produk
    if (name === 'namaproduk') {
      await handleSearch(value);
      
      // Auto-complete untuk nama produk (search existing produk)
      if (value.length > 2) {
        try {
          // Search existing products
          const produkResults = await produkService.search(value);
          setProdukSuggestions(produkResults);
          setShowProdukSuggestions(true);

          // Hide other suggestions
          setShowSuggestions(false);
          setShowBahanSuggestions(false);
        } catch (error) {
          console.error('Error searching produk:', error);
        }
      } else if (value.length <= 2) {
        setShowProdukSuggestions(false);
        setProdukSuggestions([]);
      }
    }
  };

  const handleAssignSnr18Kai = (snr18Kai: SNR18KAI) => {
    // Check if already assigned
    const alreadyAssigned = assignedSnr18Kais.some(
      (item) => item.snr18KaiId === snr18Kai.id
    );

    if (!alreadyAssigned) {
      const newRelation: ProdukSnr18Kai = {
        produkId: 0, // Will be set when saving
        snr18KaiId: snr18Kai.id!,
        quantity: 1,
      };
      setAssignedSnr18Kais([...assignedSnr18Kais, newRelation]);
    }
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleRemoveSnr18Kai = (snr18KaiId: number) => {
    setAssignedSnr18Kais(
      assignedSnr18Kais.filter((item) => item.snr18KaiId !== snr18KaiId)
    );
  };

  const handleQuantityChange = (snr18KaiId: number, quantity: number) => {
    setAssignedSnr18Kais(
      assignedSnr18Kais.map((item) =>
        item.snr18KaiId === snr18KaiId ? { ...item, quantity } : item
      )
    );
  };

  const handleAssignBahan = (bahan: Bahan) => {
    // Check if already assigned
    const alreadyAssigned = assignedBahans.some(
      (item) => item.bahanId === bahan.id
    );

    if (!alreadyAssigned) {
      const newRelation: ProdukBahan = {
        produkId: 0, // Will be set when saving
        bahanId: bahan.id!,
        quantity: 1,
      };
      setAssignedBahans([...assignedBahans, newRelation]);
    }
    setShowBahanSuggestions(false);
    setBahanSuggestions([]);
  };

  const handleRemoveBahan = (bahanId: number) => {
    setAssignedBahans(
      assignedBahans.filter((item) => item.bahanId !== bahanId)
    );
  };

  const handleBahanQuantityChange = (bahanId: number, quantity: number) => {
    setAssignedBahans(
      assignedBahans.map((item) =>
        item.bahanId === bahanId ? { ...item, quantity } : item
      )
    );
  };

  const handleProdukSelect = async (produk: Produk) => {
    try {
      // Get full produk details with relations
      const fullProduk = await produkService.getById(produk.id!);
      setSelectedProduk(fullProduk);
      
      // Load existing relations
      if (fullProduk.produkSnr18Kais) {
        setAssignedSnr18Kais(fullProduk.produkSnr18Kais);
      }
      if (fullProduk.produkBahans) {
        setAssignedBahans(fullProduk.produkBahans);
      }
      
      // Fill form with produk data
      setFormData({
        namaproduk: fullProduk.namaproduk,
        rated: fullProduk.rated || '',
        produk1: fullProduk.produk1 || '',
        produk2: fullProduk.produk2 || '',
        produk3: fullProduk.produk3 || '',
        stokproduk: fullProduk.stokproduk || '',
      });
      
      setShowProdukSuggestions(false);
      setProdukSuggestions([]);
    } catch (error) {
      console.error('Error loading produk details:', error);
    }
  };

  const handleSave = async () => {
    // Validasi
    if (!formData.namaproduk) {
      alert("Nama Produk wajib diisi!");
      return;
    }

    setIsLoading(true);

    try {
      // Save produk
      const produkData = await produkService.create(
        formData as Produk,
        session?.username || "Unknown"
      );

      // Save assigned SNR18_KAI relations
      if (assignedSnr18Kais.length > 0) {
        for (const relation of assignedSnr18Kais) {
          await produkSnr18KaiService.create({
            produkId: produkData[0].id,
            snr18KaiId: relation.snr18KaiId,
            quantity: relation.quantity || 1,
          });
        }
      }

      // Save assigned Bahan relations
      if (assignedBahans.length > 0) {
        for (const relation of assignedBahans) {
          await produkBahanService.create({
            produkId: produkData[0].id,
            bahanId: relation.bahanId,
            quantity: relation.quantity || 1,
          });
        }
      }

      alert("Data berhasil disimpan!");
      handleReset();
      // Refresh search results if there's a search term
      if (formData.namaproduk.length > 2) {
        await handleSearch(formData.namaproduk);
      }
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
    setSelectedProduct(null);
    setSelectedProduk(null);
    setAssignedSnr18Kais([]);
    setAssignedBahans([]);
    setShowSuggestions(false);
    setShowBahanSuggestions(false);
    setShowProdukSuggestions(false);
    setSuggestions([]);
    setBahanSuggestions([]);
    setProdukSuggestions([]);
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
    <div className="h-full flex flex-col">
      {/* Tab Header */}
      <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
        <span className="inline-block text-sm font-medium bg-white px-4 py-1 rounded-t border border-b-0 border-gray-300 shadow-sm">
          Pencarian Produk
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
                <div className="relative">
                  <input
                    type="text"
                    name="namaproduk"
                    value={formData.namaproduk}
                    onChange={handleInputChange}
                    required
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full"
                    placeholder="Ketik untuk mencari..."
                  />
                  {showProdukSuggestions && produkSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-y-auto">
                      {produkSuggestions.map((produk) => (
                        <div
                          key={produk.id}
                          onClick={() => handleProdukSelect(produk)}
                          className="px-3 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-sm text-blue-600">{produk.namaproduk}</div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div><strong>Rated:</strong> {produk.rated || '-'}</div>
                            <div><strong>Produk 1:</strong> {produk.produk1 || '-'}</div>
                            <div><strong>Produk 2:</strong> {produk.produk2 || '-'}</div>
                            <div><strong>Produk 3:</strong> {produk.produk3 || '-'}</div>
                            <div><strong>Stok:</strong> {produk.stokproduk || '-'}</div>
                            <div><strong>Dibuat:</strong> {produk.createdby || '-'} ({produk.createdat ? new Date(produk.createdat).toLocaleDateString('id-ID') : '-'})</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
            </div>
          </div>

          {/* Tabel Hasil Pencarian */}
          {searchResults.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold mb-3">
                Hasil Pencarian ({searchResults.length} produk ditemukan)
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
                      <th className="px-3 py-2 text-left">SNR18-KAI</th>
                      <th className="px-3 py-2 text-left">Bahan</th>
                      <th className="px-3 py-2 text-left">Dibuat Oleh</th>
                      <th className="px-3 py-2 text-left">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchResults.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium">{item.namaproduk}</td>
                        <td className="px-3 py-2">{item.rated || '-'}</td>
                        <td className="px-3 py-2">{item.produk1 || '-'}</td>
                        <td className="px-3 py-2">{item.produk2 || '-'}</td>
                        <td className="px-3 py-2">{item.produk3 || '-'}</td>
                        <td className="px-3 py-2">{item.stokproduk || '-'}</td>
                        <td className="px-3 py-2">
                          {item.produkSnr18Kais && item.produkSnr18Kais.length > 0 ? (
                            <div className="space-y-1">
                              {item.produkSnr18Kais.map((rel) => (
                                <div key={rel.id} className="text-xs bg-blue-50 px-1 py-0.5 rounded">
                                  {rel.snr18Kai?.namaBahan} ({rel.quantity || 1})
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          {item.produkBahans && item.produkBahans.length > 0 ? (
                            <div className="space-y-1">
                              {item.produkBahans.map((rel) => (
                                <div key={rel.id} className="text-xs bg-green-50 px-1 py-0.5 rounded">
                                  {rel.bahan?.nama_bahan} ({rel.quantity || 1})
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2">{item.createdby || '-'}</td>
                        <td className="px-3 py-2 text-xs">
                          {item.createdat ? new Date(item.createdat).toLocaleDateString('id-ID') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pesan jika tidak ada hasil */}
          {formData.namaproduk.length > 2 && searchResults.length === 0 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded p-4">
              <p className="text-sm text-yellow-800">
                Tidak ada produk ditemukan dengan keyword "{formData.namaproduk}"
              </p>
            </div>
          )}

          {/* Pesan untuk memulai pencarian */}
          {formData.namaproduk.length <= 2 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
              <p className="text-sm text-blue-800">
                Ketik minimal 3 karakter untuk memulai pencarian produk...
              </p>
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
