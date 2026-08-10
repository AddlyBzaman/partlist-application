"use client";

import React, { useState, useEffect } from "react";
import { getSession } from "@/lib/auth/login";
import {
  Save,
  RotateCcw,
  Search,
  Download,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  SkeletonLoading,
  TableSkeleton,
  CardSkeleton,
} from "@/components/ui/SkeletonLoading";
import { CacheMonitor } from "@/components/ui/CacheMonitor";
import { Toaster, toast } from "sonner";

// Client-side cache for search results
const searchCache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes

export default function ProdukPage() {
  const [username, setUsername] = useState<string>("");

  const [formData, setFormData] = useState({
    noproduk: "",
    produk: "",
    rated: "",
    produk1: "",
    produk2: "",
    produk3: "",
    stokproduk: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataList, setDataList] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [productMaterials, setProductMaterials] = useState<{
    [key: string]: any[];
  }>({});
  const [selectedMaterialProduct, setSelectedMaterialProduct] = useState<{
    noprod: string;
    produk: string;
  } | null>(null);
  const [loadingMaterials, setLoadingMaterials] = useState<Set<string>>(
    new Set(),
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce function for search
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  useEffect(() => {
    const sess = getSession();
    setUsername((sess as any)?.username || "");
    loadAllProducts();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(".search-dropdown-container")) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadAllProducts = async () => {
    setIsDataLoading(true);
    try {
      const response = await fetch("/api/produk/all");
      if (response.ok) {
        const result = await response.json();
        setDataList(result.data || result); // Handle both old and new format
      }
    } catch (error) {
      console.error("Error loading all products:", error);
    } finally {
      setIsDataLoading(false);
    }
  };

  const fetchProductMaterials = async (noprod: string) => {
    if (productMaterials[noprod] || loadingMaterials.has(noprod)) {
      return;
    }

    setLoadingMaterials((prev) => new Set(prev).add(noprod));
    try {
      const response = await fetch(`/api/produk/materials/${noprod}`);
      if (response.ok) {
        const materials = await response.json();
        setProductMaterials((prev) => ({
          ...prev,
          [noprod]: materials,
        }));
      }
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoadingMaterials((prev) => {
        const newSet = new Set(prev);
        newSet.delete(noprod);
        return newSet;
      });
    }
  };

  const openMaterialModal = (noprod: string, produk: string) => {
    setSelectedMaterialProduct({ noprod, produk });
    fetchProductMaterials(noprod);
  };

  const closeMaterialModal = () => {
    setSelectedMaterialProduct(null);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    const productKey =
      productToDelete?.NOPROD ||
      productToDelete?.NO_PART ||
      productToDelete?.PRODUK;

    if (!productKey) {
      toast.error("Identifier produk tidak tersedia!");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/produk/delete/${encodeURIComponent(productKey)}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        toast.success("Produk berhasil dihapus! 🗑️");
        setShowDeleteModal(false);
        setProductToDelete(null);
        await loadAllProducts();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Gagal menghapus produk!");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Gagal menghapus produk!");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (product: any) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;

    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Debounced search function
  const debouncedSearch = (keyword: string) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      if (keyword) {
        searchProducts(keyword);
      }
    }, 300); // 300ms delay

    setSearchTimeout(timeout);
  };

  const searchProducts = async (keyword: string) => {
    // Check client-side cache first
    const cacheKey = keyword.toLowerCase();
    const cached = searchCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("Client cache hit for:", keyword);
      setSearchResults(cached.data);
      setShowDropdown(cached.data.length > 0);
      return;
    }

    setIsSearching(true);
    try {
      // Search dari tabel partlist menggunakan header
      const response = await fetch("/api/produk/search", {
        method: "GET",
        headers: {
          "x-keyword": keyword,
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Cache the result
        searchCache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });

        setSearchResults(data);
        setShowDropdown(data.length > 0);
      } else {
        console.error("Search failed");
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectProduct = (product: any) => {
    setFormData({
      noproduk: product.NOPROD || "",
      produk: product.PRODUK || "",
      rated: product.RATED || "",
      produk1: product.PRODUK1 || "",
      produk2: product.PRODUK2 || "",
      produk3: product.PRODUK3 || "",
      stokproduk: product.NO_PART || "",
    });
    setShowDropdown(false);
    setSearchResults([]);
  };

  const handleSave = async () => {
    if (!formData.noproduk) {
      toast.error("No Produk wajib diisi!");
      return;
    }
    if (!formData.produk) {
      toast.error("Nama Produk wajib diisi!");
      return;
    }

    setIsLoading(true);
    try {
      // Save to partlist table
      const response = await fetch("/api/produk/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          no_produk: formData.noproduk,
          nama_produk: formData.produk,
          rated: formData.rated,
          produk1: formData.produk1,
          produk2: formData.produk2,
          produk3: formData.produk3,
          stokproduk: formData.stokproduk,
          user_id: username,
        }),
      });

      if (response.ok) {
        toast.success("Data produk berhasil disimpan! 🎉");
        handleReset();
        // Refresh all products list
        await loadAllProducts();
      } else {
        const errorData = await response.json();
        console.error("Server error:", errorData);
        toast.error(errorData.error || "Gagal menyimpan data!");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      toast.error("Gagal menyimpan data!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      noproduk: "",
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredData = dataList.filter(
    (item) =>
      searchTerm === "" ||
      item.PRODUK?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.NOPROD?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.RATED?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.NO_PART?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleRightClick = (e: React.MouseEvent, product: any) => {
    e.preventDefault();

    // Create custom context menu
    const menu = document.createElement("div");
    menu.className =
      "fixed bg-white border border-gray-300 rounded-lg shadow-lg py-2 z-50";
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;

    menu.innerHTML = `
      <div class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-medium text-red-600" data-action="delete">
        🗑️ Hapus Produk
      </div>
    `;

    document.body.appendChild(menu);

    const handleMenuClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const action = target.getAttribute("data-action");

      if (action === "delete") {
        openDeleteModal(product);
      }

      document.body.removeChild(menu);
      document.removeEventListener("click", handleMenuClick);
    };

    // Add click listener to close menu
    setTimeout(() => {
      document.addEventListener("click", handleMenuClick);
    }, 0);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tab Header */}
      <div className="bg-gray-200 px-4 py-2 border-b border-gray-300">
        <span className="inline-block text-sm font-medium bg-white px-4 py-1 rounded-t border border-b-0 border-gray-300 shadow-sm">
          Input Data Produk
        </span>
      </div>

      {/* Form Content */}
      <div className="flex-1 p-5 overflow-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">
                  1. No Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="noproduk"
                  value={formData.noproduk}
                  onChange={handleInputChange}
                  required
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  placeholder="Masukkan nomor produk..."
                />
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center relative">
                <label className="text-sm text-gray-700">
                  2. Nama Produk <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="produk"
                    value={formData.produk}
                    onChange={handleInputChange}
                    required
                    className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent w-full"
                    placeholder="Masukkan nama produk..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">3. Rated</label>
                <input
                  type="text"
                  name="rated"
                  value={formData.rated}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">4. Produk 1</label>
                <input
                  type="text"
                  name="produk1"
                  value={formData.produk1}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">5. Produk 2</label>
                <input
                  type="text"
                  name="produk2"
                  value={formData.produk2}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                <label className="text-sm text-gray-700">6. Produk 3</label>
                <input
                  type="text"
                  name="produk3"
                  value={formData.produk3}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-[150px_1fr] gap-2 items-center">
                <label className="text-sm text-gray-700">7. Unit Produk</label>
                <select
                  name="stokproduk"
                  value={formData.stokproduk}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-white"
                >
                  <option value="">-- Pilih Unit --</option>
                  <option value="BTG">BTG</option>
                  <option value="BTL">BTL</option>
                  <option value="BTNG">BTNG</option>
                  <option value="CC">CC</option>
                  <option value="GR">GR</option>
                  <option value="KGS">KGS</option>
                  <option value="LBR">LBR</option>
                  <option value="LTR">LTR</option>
                  <option value="M3">M3</option>
                  <option value="ML">ML</option>
                  <option value="MTR">MTR</option>
                  <option value="MYR">MYR</option>
                  <option value="PCS">PCS</option>
                  <option value="PDC">PDC</option>
                  <option value="PSC">PSC</option>
                  <option value="ROL">ROL</option>
                  <option value="SET">SET</option>
                  <option value="TUB">TUB</option>
                  <option value="YAR">YAR</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Hasil Pencarian */}
        {isDataLoading ? (
          <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="text-sm font-semibold mb-3">Memuat data...</h3>
            <TableSkeleton rows={5} columns={9} />
          </div>
        ) : showAllProducts ? (
          <div className="mt-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            {/* Search Bar */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 relative search-dropdown-container">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    handleSearch(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      searchProducts(searchTerm);
                    }
                  }}
                  placeholder="Cari produk..."
                  className="w-full border border-gray-300 rounded px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />

                {/* Dropdown Search Results */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded mt-1 shadow-lg z-10 max-h-60 overflow-y-auto">
                    {searchResults.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectProduct(item)}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="text-sm font-medium">{item.PRODUK}</div>
                        <div className="text-xs text-gray-500">
                          {item.NOPROD} - {item.RATED}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {showDropdown &&
                  searchTerm &&
                  searchResults.length === 0 &&
                  !isSearching && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded mt-1 shadow-lg z-10 p-3">
                      <div className="text-center text-gray-500 text-sm">
                        <div className="mb-1">🔍</div>
                        Tidak ada produk ditemukan untuk "{searchTerm}"
                      </div>
                    </div>
                  )}
              </div>
              <button
                onClick={() => searchProducts(searchTerm)}
                disabled={isSearching}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded text-sm font-medium flex items-center gap-2 transition-colors disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Mencari...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Cari
                  </>
                )}
              </button>
            </div>

            <h3 className="text-sm font-semibold mb-3">
              Semua Produk ({filteredData.length} produk)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[600px]">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left whitespace-nowrap">
                      No. Produk
                    </th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">
                      Nama Produk
                    </th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">
                      Rated
                    </th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">
                      Produk 1
                    </th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">
                      Produk 2
                    </th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">
                      Produk 3
                    </th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">
                      Unit
                    </th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">
                      Bahan
                    </th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">
                      Dibuat Oleh
                    </th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">
                      Tanggal
                    </th>
                    <th className="px-3 py-2 text-left whitespace-nowrap">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t hover:bg-gray-50 cursor-pointer"
                      onContextMenu={(e) => handleRightClick(e, item)}
                    >
                      <td className="px-3 py-2 font-medium">
                        {item.NOPROD || "-"}
                      </td>
                      <td className="px-3 py-2">{item.PRODUK || "-"}</td>
                      <td className="px-3 py-2">{item.RATED || "-"}</td>
                      <td className="px-3 py-2">{item.PRODUK1 || "-"}</td>
                      <td className="px-3 py-2">{item.PRODUK2 || "-"}</td>
                      <td className="px-3 py-2">{item.PRODUK3 || "-"}</td>
                      <td className="px-3 py-2">{item.NO_PART || "-"}</td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() =>
                            openMaterialModal(
                              item.NOPROD || "",
                              item.PRODUK || "",
                            )
                          }
                          className="px-2 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs flex items-center gap-1 mx-auto"
                        >
                          {loadingMaterials.has(item.NOPROD) ? (
                            <>
                              <Loader2 size={12} className="animate-spin" />
                              Loading...
                            </>
                          ) : (
                            <>
                              <Search size={12} />
                              {productMaterials[item.NOPROD]
                                ? `${productMaterials[item.NOPROD].length} Bahan`
                                : "Lihat Bahan"}
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-3 py-2">{item.USER_ID || "-"}</td>
                      <td className="px-3 py-2 text-xs whitespace-nowrap">
                        {item.createdat
                          ? new Date(item.createdat).toLocaleDateString("id-ID")
                          : "-"}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => {
                              setFormData({
                                noproduk: item.NOPROD || "",
                                produk: item.PRODUK || "",
                                rated: item.RATED || "",
                                produk1: item.PRODUK1 || "",
                                produk2: item.PRODUK2 || "",
                                produk3: item.PRODUK3 || "",
                                stokproduk: item.NO_PART || "",
                              });
                            }}
                            className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs"
                          >
                            Pilih
                          </button>
                          <button
                            onClick={() => openDeleteModal(item)}
                            className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Material Detail Modal */}
        {selectedMaterialProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-5xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Detail Bahan untuk {selectedMaterialProduct.produk} (
                    {selectedMaterialProduct.noprod})
                  </h3>
                  <p className="text-sm text-slate-600"></p>
                </div>
                <button
                  onClick={closeMaterialModal}
                  className="text-slate-500 hover:text-slate-900 text-2xl font-bold leading-none"
                  aria-label="Close material modal"
                >
                  ×
                </button>
              </div>

              <div className="overflow-y-auto max-h-[72vh] p-5">
                {loadingMaterials.has(selectedMaterialProduct.noprod) ? (
                  <div className="flex items-center justify-center py-20 text-slate-500">
                    <Loader2 size={18} className="animate-spin mr-2" /> Memuat
                    bahan...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[800px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left whitespace-nowrap">
                            Code
                          </th>
                          <th className="px-3 py-2 text-left whitespace-nowrap">
                            Code Baru
                          </th>
                          <th className="px-3 py-2 text-left whitespace-nowrap">
                            Nama Bahan
                          </th>
                          <th className="px-3 py-2 text-left whitespace-nowrap">
                            Spesifikasi
                          </th>
                          <th className="px-3 py-2 text-left whitespace-nowrap">
                            Unit
                          </th>
                          <th className="px-3 py-2 text-left whitespace-nowrap">
                            Proses
                          </th>
                          <th className="px-3 py-2 text-left whitespace-nowrap">
                            Bdown
                          </th>
                          <th className="px-3 py-2 text-left whitespace-nowrap">
                            Pakai/PCS
                          </th>
                          <th className="px-3 py-2 text-left whitespace-nowrap">
                            Nama WIP
                          </th>
                          <th className="px-3 py-2 text-left whitespace-nowrap">
                            Departemen
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(
                          productMaterials[selectedMaterialProduct.noprod] || []
                        ).map((material: any, index: number) => (
                          <tr key={index} className="border-t hover:bg-gray-50">
                            <td className="px-3 py-2 font-medium">
                              {material.code || "-"}
                            </td>
                            <td className="px-3 py-2">
                              {material.code_baru || "-"}
                            </td>
                            <td className="px-3 py-2">
                              {material.nama_bahan || "-"}
                            </td>
                            <td className="px-3 py-2">
                              {material.spesifikasi || "-"}
                            </td>
                            <td className="px-3 py-2">
                              {material.unit || "-"}
                            </td>
                            <td className="px-3 py-2">
                              {material.PROSES || "-"}
                            </td>
                            <td className="px-3 py-2">
                              {material.BDOWN || "-"}
                            </td>
                            <td className="px-3 py-2">
                              {material.pakaiperpcs || "-"}
                            </td>
                            <td className="px-3 py-2">
                              {material.namawip || "-"}
                            </td>
                            <td className="px-3 py-2">
                              {material.departemen || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {(productMaterials[selectedMaterialProduct.noprod] || [])
                      .length === 0 && (
                      <div className="text-center py-10 text-gray-500 text-sm">
                        Tidak ada bahan ditemukan untuk produk ini
                      </div>
                    )}
                  </div>
                )}
              </div>
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
          onClick={() => setShowAllProducts(!showAllProducts)}
          className="px-5 py-2 bg-green-500 hover:bg-green-600 border border-green-600 text-white rounded text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow"
        >
          <Search size={16} />
          {showAllProducts ? "Sembunyikan Semua" : "Lihat Produk"}
        </button>
        <button
          onClick={handleReset}
          className="px-5 py-2 bg-red-500 hover:bg-red-600 border border-red-600 text-white rounded text-sm font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow"
        >
          <RotateCcw size={16} />
          Reset
        </button>
      </div>

      {/* Cache Monitor */}
      <CacheMonitor />

      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
        visibleToasts={3}
        theme="light"
        toastOptions={{
          style: {
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "0.75rem",
            boxShadow:
              "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          },
          className: "toast-notification",
        }}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Konfirmasi Hapus Produk
                </h3>
                <p className="text-sm text-gray-600">
                  Apakah Anda yakin ingin menghapus produk ini?
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    No. Produk:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {productToDelete.NOPROD}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Nama Produk:
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {productToDelete.PRODUK}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Rated:
                  </span>
                  <span className="text-sm text-gray-900">
                    {productToDelete.RATED || "-"}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                ⚠️ <strong>Peringatan:</strong> Tindakan ini tidak dapat
                dibatalkan. Produk yang dihapus akan hilang secara permanen.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setProductToDelete(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteProduct}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Hapus Produk
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
