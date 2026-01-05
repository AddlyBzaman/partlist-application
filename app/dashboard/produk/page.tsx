"use client";

import React, { useState, useEffect } from "react";
import { getSession } from "@/lib/auth/login";
import { Save, RotateCcw, Search, Download, Trash2, Loader2 } from "lucide-react";

export default function ProdukPage() {
  const [username, setUsername] = useState<string>("");

  const [formData, setFormData] = useState({
    produk: "",
    rated: "",
    produk1: "",
    produk2: "",
    produk3: "",
    stokproduk: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);

  useEffect(() => {
    const sess = getSession();
    setUsername((sess as any)?.username || "");
    loadAllProducts();
  }, []);

  const loadAllProducts = async () => {
    try {
      const response = await fetch('/api/produk/all');
      if (response.ok) {
        const data = await response.json();
        setDataList(data);
      }
    } catch (error) {
      console.error('Error loading all products:', error);
    }
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark> : part
    );
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
    if (name === 'produk') {
      if (value.length >= 3) {
        await searchProducts(value);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }
  };

  const searchProducts = async (keyword: string) => {
    setIsSearching(true);
    try {
      // Search dari tabel partlist menggunakan header
      const response = await fetch('/api/produk/search', {
        method: 'GET',
        headers: {
          'x-keyword': keyword
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
        setShowDropdown(data.length > 0);
      } else {
        console.error('Search failed');
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectProduct = (product: any) => {
    setFormData({
      produk: product.PRODUK || '',
      rated: product.RATED || '',
      produk1: product.PRODUK1 || '',
      produk2: product.PRODUK2 || '',
      produk3: product.PRODUK3 || '',
      stokproduk: product.NO_PART || '',
    });
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleSave = async () => {
    if (!formData.produk) {
      alert("Nama Produk wajib diisi!");
      return;
    }

    setIsLoading(true);
    try {
      // Save to partlist table
      const response = await fetch('/api/produk/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          user_id: username,
        }),
      });

      if (response.ok) {
        alert("Data produk berhasil disimpan!");
        handleReset();
        // Refresh search results
        if (formData.produk.length >= 3) {
          await searchProducts(formData.produk);
        }
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
    setFormData({
      produk: "",
      rated: "",
      produk1: "",
      produk2: "",
      produk3: "",
      stokproduk: "",
    });
    setShowDropdown(false);
    setSearchResults([]);
  };

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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-[200px_1fr] gap-3 items-center relative">
                <label className="text-sm text-gray-700">
                  1. Nama / Nama Produk <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="produk"
                    value={formData.produk}
                    onChange={handleInputChange}
                    required
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full"
                    placeholder="Ketik untuk mencari..."
                  />
                  {isSearching && (
                    <div className="absolute right-2 top-2">
                      <Loader2 size={16} className="animate-spin text-gray-400" />
                    </div>
                  )}

                  {/* Dropdown Search Results */}
                  {showDropdown && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-64 overflow-y-auto">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => handleSelectProduct(product)}
                          className="px-3 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-medium text-sm text-blue-600">
                            {highlightText(product.PRODUK, formData.produk)}
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            <div><strong>Rated:</strong> {highlightText(product.RATED || '-', formData.rated)}</div>
                            <div><strong>Produk 1:</strong> {highlightText(product.PRODUK1 || '-', formData.produk1)}</div>
                            <div><strong>Produk 2:</strong> {highlightText(product.PRODUK2 || '-', formData.produk2)}</div>
                            <div><strong>Produk 3:</strong> {highlightText(product.PRODUK3 || '-', formData.produk3)}</div>
                            <div><strong>Stok:</strong> {highlightText(product.NO_PART || '-', formData.stokproduk)}</div>
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
        </div>

        {/* Tombol Lihat Semua Produk */}
        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => setShowAllProducts(!showAllProducts)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow"
          >
            <Search size={16} />
            {showAllProducts ? 'Sembunyikan Semua' : 'Lihat Semua Produk'}
          </button>
          
          {searchResults.length > 0 && (
            <span className="text-sm text-gray-600">
              {searchResults.length} produk ditemukan
            </span>
          )}
        </div>

        {/* Hasil Pencarian */}
        {(searchResults.length > 0 || showAllProducts) && (
          <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold mb-3">
              {showAllProducts ? 'Semua Produk' : `Hasil Pencarian (${searchResults.length} produk ditemukan)`}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[600px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left whitespace-nowrap">Nama Produk</th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">Rated</th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">Produk 1</th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">Produk 2</th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">Produk 3</th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">Stok</th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">Dibuat Oleh</th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">Tanggal</th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllProducts ? dataList : searchResults).map((item) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">
                        {showAllProducts ? item.PRODUK : highlightText(item.PRODUK, formData.produk)}
                      </td>
                      <td className="px-3 py-2">
                        {showAllProducts ? (item.RATED || '-') : highlightText(item.RATED || '-', formData.produk)}
                      </td>
                      <td className="px-3 py-2">
                        {showAllProducts ? (item.PRODUK1 || '-') : highlightText(item.PRODUK1 || '-', formData.produk)}
                      </td>
                      <td className="px-3 py-2">
                        {showAllProducts ? (item.PRODUK2 || '-') : highlightText(item.PRODUK2 || '-', formData.produk)}
                      </td>
                      <td className="px-3 py-2">
                        {showAllProducts ? (item.PRODUK3 || '-') : highlightText(item.PRODUK3 || '-', formData.produk)}
                      </td>
                      <td className="px-3 py-2">
                        {showAllProducts ? (item.NO_PART || '-') : highlightText(item.NO_PART || '-', formData.produk)}
                      </td>
                      <td className="px-3 py-2">{item.USER_ID || '-'}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap">
                        {item.createdat ? new Date(item.createdat).toLocaleDateString('id-ID') : '-'}
                      </td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleSelectProduct(item)}
                          className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs whitespace-nowrap"
                        >
                          Pilih
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pesan untuk memulai pencarian */}
        {formData.produk.length < 3 && (
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
  );
}
