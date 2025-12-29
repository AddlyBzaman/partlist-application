"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import { ListBahan } from "@/lib/services/listBahanService";
import { RefreshCw, FileText, Download, Search } from "lucide-react";
import * as XLSX from "xlsx";

export default function ListBahanPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [dataList, setDataList] = useState<ListBahan[]>([]);
  const [filteredData, setFilteredData] = useState<ListBahan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 1000,
    total: 0,
    totalPages: 0
  });

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

  // Load data dari database
  const loadData = async (page: number = 1, limit: number = 1000, keyword?: string) => {
    setIsLoading(true);
    try {
      // Use API endpoint instead of direct service call
      const url = keyword 
        ? `/api/list-bahan?page=${page}&limit=${limit}&keyword=${encodeURIComponent(keyword)}`
        : `/api/list-bahan?page=${page}&limit=${limit}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      console.log('API response:', result);
      console.log('Real data from partlist_a loaded:', result.data?.length || 0, 'items');
      
      setDataList(result.data || []);
      setFilteredData(result.data || []);
      setPagination(result.pagination || {
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 0
      });
    } catch (error) {
      console.error('Error loading data from API:', error);
      console.error('API call failed - check console for details');
      
      // Show empty data instead of mock data
      setDataList([]);
      setFilteredData([]);
      setPagination({
        page: 1,
        limit: 100,
        total: 0,
        totalPages: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Search/Filter data
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);

    // If keyword is empty, load all data
    if (!keyword.trim()) {
      loadData(1, pagination.limit);
      return;
    }

    // Load data with search keyword from server
    loadData(1, pagination.limit, keyword);
  };

  // Export to Excel
  const handleExportExcel = () => {
    // Prepare data untuk export
    const exportData = filteredData.map((item, index) => ({
      No: index + 1,
      "Kode Lama": item.CODE || "-",
      "Kode Baru": item.CODE_BARU || "-",
      "Nama Bahan": item.LNAMA || "-",
      Spesifikasi: item.SPEK || "-",
      Unit: item.UNIT || "-",
      Currency: "-",
      Cost: "-",
      "Bea Material": "-",
      Supplier: "-",
    }));

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Bahan");

    // Auto-width columns
    const maxWidth = exportData.reduce(
      (w, r) => Math.max(w, Object.keys(r).length),
      10
    );
    ws["!cols"] = Array(maxWidth).fill({ wch: 20 });

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `Data_Bahan_${timestamp}.xlsx`;

    // Download
    XLSX.writeFile(wb, filename);
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
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="h-full flex flex-col">
            {/* Header Bar */}
            <div className="bg-white border-b border-gray-300 px-5 py-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  List Bahan
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadData()}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 border border-gray-400 rounded text-sm font-medium flex items-center gap-2 transition-all"
                  >
                    <RefreshCw size={16} />
                    Refresh
                  </button>
                  <button
                    onClick={handleExportExcel}
                    disabled={filteredData.length === 0}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={16} />
                    Export Excel
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Cari berdasarkan kode, nama, spesifikasi, unit, atau produk..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-300">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {pagination.total} data
                  </span>
                  {pagination.totalPages > 1 && (
                    <span className="text-sm text-gray-500 ml-2">
                      (Halaman {pagination.page} dari {pagination.totalPages})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto p-5">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm">Loading data...</p>
                  </div>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <FileText
                      size={48}
                      className="mx-auto text-gray-300 mb-3"
                    />
                    <p className="text-gray-600 text-sm">
                      Tidak ada data yang ditemukan
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {searchKeyword
                        ? "Coba kata kunci lain"
                        : "Mulai input data bahan"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-100 to-gray-50 border-b-2 border-gray-300">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Kode Lama
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Kode Baru
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Nama Bahan
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Spesifikasi
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Unit
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Currency
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Cost
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Bea Material
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Supplier
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredData.map((item, index) => (
                          <tr
                            key={item.id}
                            className="hover:bg-blue-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                              {item.CODE || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.CODE_BARU || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {item.LNAMA || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.SPEK || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.UNIT || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              -
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              -
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              -
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              -
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination Controls */}
                  {pagination.totalPages > 1 && (
                    <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Menampilkan {filteredData.length} dari {pagination.total} data
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => loadData(pagination.page - 1, pagination.limit)}
                          disabled={pagination.page === 1}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
                        >
                          Previous
                        </button>
                        <span className="px-3 py-1 text-sm">
                          {pagination.page} / {pagination.totalPages}
                        </span>
                        <button
                          onClick={() => loadData(pagination.page + 1, pagination.limit)}
                          disabled={pagination.page === pagination.totalPages}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded text-sm"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
