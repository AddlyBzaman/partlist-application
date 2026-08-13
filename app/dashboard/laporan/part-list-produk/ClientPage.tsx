"use client";

import React, { useState, useEffect } from "react";
import Toast from "@/components/ui/Toast";
import { getSession } from "@/lib/auth/login";
import { Search, Download, Printer, Eye, Trash2 } from "lucide-react";

interface PartListProduk {
  id: number;
  noprod: string;
  produk_name: string;
  satuan: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

interface PartListProdukItem {
  id: number;
  produk_id: number;
  item_no: number;
  code: string;
  nama_bahan: string;
  spesifikasi: string;
  keterangan: string;
  pakai_pc: string;
  unit: string;
  BDOWN: string;
}

export default function ClientPage() {
  const [username, setUsername] = useState<string>("");
  const [partListData, setPartListData] = useState<PartListProduk[]>([]);
  const [selectedProduk, setSelectedProduk] = useState<PartListProduk | null>(
    null,
  );
  const [selectedItems, setSelectedItems] = useState<PartListProdukItem[]>([]);
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [logoLoading, setLogoLoading] = useState<boolean>(true);

  useEffect(() => {
    const sess = getSession();
    setUsername((sess as any)?.username || "");
    fetchPartListData();
    convertLogoToBase64();
  }, []);

  useEffect(() => {
    const handler = (e: any) => {
      // When a part list is saved elsewhere in the app, refresh the list
      fetchPartListData();
    };

    window.addEventListener("partListSaved", handler as EventListener);
    return () =>
      window.removeEventListener("partListSaved", handler as EventListener);
  }, []);

  // Notification state
  const [notif, setNotif] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({ show: false, message: "", type: "info" });
  const showNotif = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
  ) => setNotif({ show: true, message, type });

  const convertLogoToBase64 = async () => {
    setLogoLoading(true);
    try {
      const response = await fetch("/logo.png");
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setLogoBase64(base64data);
        setLogoLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error("Error converting logo to base64:", error);
      setLogoLoading(false);
    }
  };

  const fetchPartListData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/part-list-produk/list", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setPartListData(data);
      }
    } catch (error) {
      console.error("Error fetching part list data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPartListDetail = async (produkId: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/part-list-produk/detail/${produkId}`, {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedItems(data.items);
      }
    } catch (error) {
      console.error("Error fetching part list detail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetail = (produk: PartListProduk) => {
    setSelectedProduk(produk);
    setShowDetail(true);
    fetchPartListDetail(produk.id);
  };

  const handleDelete = async (produk: PartListProduk) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus part list produk "${produk.produk_name}"?`,
      )
    ) {
      return;
    }
    try {
      const response = await fetch(
        `/api/part-list-produk/delete/${produk.id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        // Poll the list API a few times to ensure server-side revalidation/DB propagation
        const maxRetries = 5;
        const intervalMs = 600;
        let removed = false;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
          // wait a short delay before first check
          await new Promise((res) =>
            setTimeout(res, attempt === 0 ? 300 : intervalMs),
          );

          try {
            const listRes = await fetch("/api/part-list-produk/list", {
              cache: "no-store",
            });
            if (listRes.ok) {
              const arr = await listRes.json();
              setPartListData(arr);
              if (!arr.some((p: any) => p.id === produk.id)) {
                removed = true;
                break;
              }
            }
          } catch (err) {
            console.error("Error polling part list after delete:", err);
          }
        }

        if (removed) {
          showNotif("Part List Produk berhasil dihapus!", "success");
        } else {
          // Last resort: force reload to ensure UI shows latest server state
          console.warn(
            "Delete confirmed but item still present in list after retries; forcing reload.",
          );
          window.location.reload();
        }
      } else {
        showNotif("Gagal menghapus data!", "error");
      }
    } catch (error) {
      console.error("Error deleting part list:", error);
      showNotif("Gagal menghapus data!", "error");
    }
  };

  const handlePrint = () => {
    if (!selectedProduk) return;

    // Check if logo is loaded
    if (logoLoading || !logoBase64) {
      showNotif(
        "Logo sedang dimuat, silakan coba lagi beberapa saat...",
        "info",
      );
      return;
    }

    const currentDate = new Date();
    const formattedDate = currentDate
      .toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "-");
    const formattedTime = currentDate
      .toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(" ", "");

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>PART LIST - ${selectedProduk.produk_name}</title>
          <style>
            @page { size: auto; margin: 0; }
            html, body { margin: 0; padding: 0; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              font-size: 11px;
            }
            .header-left {
              position: absolute;
              top: 20px;
              left: 20px;
              font-size: 10px;
            }
            .header-center {
              text-align: center;
              margin-bottom: 20px;
            }
            .header-center h1 {
              margin: 0;
              font-size: 18px;
              font-weight: bold;
            }
            .header-center .no-part {
              margin: 5px 0;
              font-size: 12px;
            }
            .header-right {
              position: absolute;
              top: 20px;
              right: 20px;
              font-size: 10px;
              text-align: right;
            }
            .header-right .date { display: block; margin-bottom: 2px; }
            .header-right .time { display: block; }
            .info-row {
              margin: 3px 0;
              font-size: 10px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 60px;
              font-size: 10px;
              border-top: 1px solid #000;
              border-bottom: 1px solid #000;
              border-left: 1px solid #000;
              border-right: 1px solid #000;
            }
            th, td { 
              border-left: 1px solid #000;
              border-right: 1px solid #000;
              padding: 4px; 
              text-align: left; 
              vertical-align: top;
            }
            th { 
              background-color: #f5f5f5; 
              font-weight: bold;
              text-align: center;
              border-bottom: 1px solid #000;
            }
            .no-col { width: 5%; text-align: center; }
            .code-col { width: 15%; }
            .nama-col { width: 25%; }
            .spek-col { width: 20%; }
            .ket-col { width: 15%; }
            .pakai-col { width: 20%; text-align: center; }
            @media print { 
              body { margin: 0; padding: 15px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header-left">
            <div><img src="${logoBase64}" alt="Logo Perusahaan" style="height: 30px; width: auto;" /></div>
            <div class="info-row">NOPROD : ${selectedProduk.noprod}</div>
            <div class="info-row">PRODUK : ${selectedProduk.produk_name}</div>
            <div class="info-row">SATUAN : ${selectedProduk.satuan}</div>
          </div>
          
          <div class="header-center">
            <h1>PART LIST</h1>
            <div class="no-part">NO. PART : </div>
          </div>
          
          <div class="header-right">
            <div>HAL. 1</div>
            <div class="date">${formattedDate}</div>
            <div class="time">${formattedTime}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="no-col">NO</th>
                <th class="code-col">CODE</th>
                <th class="nama-col">NAMA BAHAN</th>
                <th class="spek-col">SPESIFIKASI</th>
                <th class="ket-col">KETERANGAN</th>
                <th class="pakai-col">PAKAI / 1000</th>
              </tr>
            </thead>
            <tbody>
              ${
                selectedItems.length > 0
                  ? selectedItems
                      .map((item, index) => {
                        const currentBDOWN = item.BDOWN || "";
                        const previousBDOWN =
                          index > 0 ? selectedItems[index - 1].BDOWN || "" : "";
                        const shouldAddSpacing =
                          index > 0 && currentBDOWN !== previousBDOWN;

                        return `
                    <tr>
                      <td class="no-col" style="${shouldAddSpacing ? "padding-top: 25px;" : ""}">${index + 1}</td>
                      <td class="code-col" style="${shouldAddSpacing ? "padding-top: 25px;" : ""}">${item.code || ""}</td>
                      <td class="nama-col" style="${shouldAddSpacing ? "padding-top: 25px;" : ""}">${item.nama_bahan || ""}</td>
                      <td class="spek-col" style="${shouldAddSpacing ? "padding-top: 25px;" : ""}">${item.spesifikasi || ""}</td>
                      <td class="ket-col" style="${shouldAddSpacing ? "padding-top: 25px;" : ""}">${item.keterangan || ""}</td>
                      <td class="pakai-col" style="${shouldAddSpacing ? "padding-top: 25px;" : ""}">${item.pakai_pc || ""} ${item.unit || ""}</td>
                    </tr>
                  `;
                      })
                      .join("")
                  : '<tr><td colspan="6" style="text-align: center;">Tidak ada data</td></tr>'
              }
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Create hidden iframe
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px";
    iframe.style.top = "-9999px";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    document.body.appendChild(iframe);

    // Write content to iframe and print
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(printContent);
      iframeDoc.close();

      // Wait for content to load, then print
      setTimeout(() => {
        iframe.contentWindow?.print();

        // Remove iframe after printing
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 500);
    }
  };

  const filteredData = partListData.filter(
    (item) =>
      item.produk_name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.user_id.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      item.noprod.toLowerCase().includes(searchKeyword.toLowerCase()),
  );

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
        <span className="inline-block text-sm font-medium bg-white px-4 py-1 rounded-t border border-b-0 border-gray-300 shadow-sm">
          Laporan Part List Produk
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-5 overflow-auto">
        {!showDetail ? (
          // List View
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Daftar Part List Produk</h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-2.5 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="Cari produk atau user..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">
                        No
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">
                        NOPROD
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">
                        Nama Produk
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">
                        Satuan
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">
                        User ID
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700">
                        Tanggal Dibuat
                      </th>
                      <th className="px-3 py-2 text-center font-semibold text-gray-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((item, index) => (
                        <tr key={item.id} className="border-t hover:bg-gray-50">
                          <td className="px-3 py-2">{index + 1}</td>
                          <td className="px-3 py-2 font-medium">
                            {item.noprod}
                          </td>
                          <td className="px-3 py-2 font-medium">
                            {item.produk_name}
                          </td>
                          <td className="px-3 py-2">{item.satuan}</td>
                          <td className="px-3 py-2">{item.user_id}</td>
                          <td className="px-3 py-2">
                            {new Date(item.created_at).toLocaleDateString(
                              "id-ID",
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <button
                              onClick={() => handleViewDetail(item)}
                              className="p-1.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded mr-1"
                              title="Lihat Detail"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="p-1.5 bg-red-100 hover:bg-red-200 text-red-600 rounded"
                              title="Hapus"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-3 py-8 text-center text-gray-500"
                        >
                          Tidak ada data part list produk
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          // Detail View
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedProduk?.produk_name}
                </h3>
                <p className="text-sm text-gray-600">
                  User: {selectedProduk?.user_id} | Tanggal:{" "}
                  {selectedProduk &&
                    new Date(selectedProduk.created_at).toLocaleDateString(
                      "id-ID",
                    )}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  disabled={logoLoading}
                  className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded text-sm font-medium flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Printer size={16} />
                  {logoLoading ? "Loading..." : "Print"}
                </button>
                <button
                  onClick={() => setShowDetail(false)}
                  className="px-3 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm font-medium"
                >
                  Kembali
                </button>
              </div>
            </div>

            <div id="print-content">
              <div className="header text-center mb-6">
                <h1>LAPORAN PART LIST PRODUK</h1>
                <p>
                  <strong>Nama Produk:</strong> {selectedProduk?.produk_name}
                </p>
                <p>
                  <strong>User:</strong> {selectedProduk?.user_id}
                </p>
                <p>
                  <strong>Tanggal:</strong>{" "}
                  {selectedProduk &&
                    new Date(selectedProduk.created_at).toLocaleDateString(
                      "id-ID",
                    )}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-l border-r border-b border-gray-400">
                        No
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-l border-r border-b border-gray-400">
                        Code
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-l border-r border-b border-gray-400">
                        Nama Bahan
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-l border-r border-b border-gray-400">
                        Spesifikasi
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-l border-r border-b border-gray-400">
                        Keterangan
                      </th>
                      <th className="px-3 py-2 text-left font-semibold text-gray-700 border-l border-r border-b border-gray-400">
                        Pakai/1000
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.length > 0 ? (
                      selectedItems.map((item, index) => {
                        const currentBDOWN = item.BDOWN || "";
                        const previousBDOWN =
                          index > 0 ? selectedItems[index - 1].BDOWN || "" : "";
                        const shouldAddSpacing =
                          index > 0 && currentBDOWN !== previousBDOWN;
                        const isLastItem = index === selectedItems.length - 1;
                        const spacingClass = shouldAddSpacing ? "pt-8" : "py-2";

                        return (
                          <tr key={item.id}>
                            <td
                              className={`px-3 ${spacingClass} border-l border-r border-gray-400 ${isLastItem ? "border-b" : ""}`}
                            >
                              {item.item_no}
                            </td>
                            <td
                              className={`px-3 ${spacingClass} border-l border-r border-gray-400 ${isLastItem ? "border-b" : ""}`}
                            >
                              {item.code}
                            </td>
                            <td
                              className={`px-3 ${spacingClass} border-l border-r border-gray-400 ${isLastItem ? "border-b" : ""}`}
                            >
                              {item.nama_bahan}
                            </td>
                            <td
                              className={`px-3 ${spacingClass} border-l border-r border-gray-400 ${isLastItem ? "border-b" : ""}`}
                            >
                              {item.spesifikasi}
                            </td>
                            <td
                              className={`px-3 ${spacingClass} border-l border-r border-gray-400 ${isLastItem ? "border-b" : ""}`}
                            >
                              {item.keterangan}
                            </td>
                            <td
                              className={`px-3 ${spacingClass} border-l border-r border-gray-400 ${isLastItem ? "border-b" : ""}`}
                            >
                              {item.pakai_pc} {item.unit}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-8 text-center text-gray-500 border-l border-r border-b border-gray-400"
                        >
                          Tidak ada data bahan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="footer mt-8 text-right">
                <p>Total Item: {selectedItems.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
