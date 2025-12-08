'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, logout } from '@/lib/auth';
import { bahanService, Bahan } from '@/lib/supabase';
import { ChevronRight, ChevronDown, Home, RefreshCw, FileText, MapPin, Settings, Save, RotateCcw, Search, LogOut, Loader2, X } from 'lucide-react';
// Import Komponen Modal yang baru
import SearchModal from './SearchModal'; 

interface ExpandedMenus {
  application: boolean;
  referensi: boolean;
  partList: boolean;
}

// Tambahkan definisi props untuk SearchModal
interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (keyword: string) => void;
}

export default function BahanPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  
  const [expandedMenus, setExpandedMenus] = useState<ExpandedMenus>({
    application: true,
    referensi: true,
    partList: false
  });

  const [formData, setFormData] = useState({
    code_lama: '',
    nama_bahan: '',
    spesifikasi_bahan: '',
    ukuran_unit: '',
    stok_awal: '',
    nama_loket: '',
    keterangan1: '',
    keterangan2: '',
    keterangan3: '',
    keterangan4: '',
    keterangan5: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState<Bahan[]>([]);
  // STATE BARU: Untuk mengontrol tampilan Modal Pencarian
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); 

  // Auth Protection
  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession.isLoggedIn) {
      router.push('/login');
    } else {
      setSession(currentSession);
      loadData();
    }
  }, [router]);

  // Load data dari Supabase
  const loadData = async () => {
    try {
      const data = await bahanService.getAll();
      setDataList(data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const toggleMenu = (menu: keyof ExpandedMenus): void => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // FUNGSI BARU: Logika inti pencarian, dipanggil oleh Modal
  const executeSearch = async (keyword: string) => {
    // Tutup modal setelah mendapatkan kata kunci
    setIsSearchModalOpen(false); 
    
    if (keyword) {
      try {
        const results = await bahanService.search(keyword);
        setDataList(results || []);
      } catch (error) {
        console.error('Error searching:', error);
        alert('Gagal melakukan pencarian');
      }
    }
  };

  // FUNGSI MODIFIKASI: handleBrowse sekarang hanya memicu tampilan modal
  const handleBrowse = () => {
    setIsSearchModalOpen(true);
  };

  const handleSave = async () => {
    // Validasi
    if (!formData.nama_bahan) {
      alert('Nama Bahan wajib diisi!');
      return;
    }

    setIsLoading(true);

    try {
      await bahanService.create(formData as Bahan, session?.username || 'Unknown');
      
      alert('Data berhasil disimpan!');
      handleReset();
      loadData(); // Reload data
    } catch (error: any) {
      console.error('Error saving data:', error);
      alert(`Gagal menyimpan data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      code_lama: '',
      nama_bahan: '',
      spesifikasi_bahan: '',
      ukuran_unit: '',
      stok_awal: '',
      nama_loket: '',
      keterangan1: '',
      keterangan2: '',
      keterangan3: '',
      keterangan4: '',
      keterangan5: ''
    });
  };

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin logout?')) {
      logout();
      router.push('/login');
    }
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
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-700 to-gray-600 text-white px-4 py-2.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded flex items-center justify-center shadow-md">
            <div className="w-5 h-5 border-2 border-white"></div>
          </div>
          <div>
            <h1 className="text-base font-semibold leading-tight">Partlist Application</h1>
            <p className="text-xs text-gray-300 leading-tight">PT. Nikkatsu Electric Works</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <div className="text-right mr-2">
            <p className="text-xs text-gray-300">Welcome,</p>
            <p className="text-sm font-semibold">{session?.username}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded text-sm font-medium transition-colors shadow"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-48 bg-white border-r border-gray-300 overflow-y-auto shadow-sm">
          <nav className="py-2">
            <div className="mb-1">
              <button
                onClick={() => toggleMenu('application')}
                className="flex items-center gap-1.5 w-full px-3 py-1.5 hover:bg-gray-100 text-left transition-colors"
              >
                {expandedMenus.application ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <Home size={14} className="flex-shrink-0" />
                <span className="text-xs font-semibold">APPLICATION</span>
              </button>
              
              {expandedMenus.application && (
                <div className="mt-1">
                  <button
                    onClick={() => toggleMenu('referensi')}
                    className="flex items-center gap-1.5 w-full pl-6 pr-3 py-1.5 hover:bg-gray-100 text-left transition-colors"
                  >
                    {expandedMenus.referensi ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <RefreshCw size={13} className="flex-shrink-0" />
                    <span className="text-xs">Referensi</span>
                  </button>
                  
                  {expandedMenus.referensi && (
                    <div className="mt-1">
                      <button className="flex items-center gap-1.5 w-full pl-12 pr-3 py-1.5 bg-blue-500 text-white text-left transition-colors">
                        <FileText size={13} className="flex-shrink-0" />
                        <span className="text-xs font-medium">Bahan</span>
                      </button>
                      <button 
                        onClick={() => router.push('/dashboard/produk')}
                        className="flex items-center gap-1.5 w-full pl-12 pr-3 py-1.5 hover:bg-gray-100 text-left transition-colors">
                        <FileText size={13} className="flex-shrink-0" />
                        <span className="text-xs">Produk</span>
                      </button>
                    </div>
                  )}
                  
                  <button
                    onClick={() => toggleMenu('partList')}
                    className="flex items-center gap-1.5 w-full pl-6 pr-3 py-1.5 hover:bg-gray-100 text-left transition-colors"
                  >
                    {expandedMenus.partList ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    <FileText size={13} className="flex-shrink-0" />
                    <span className="text-xs">Part List</span>
                  </button>
                  
                  {expandedMenus.partList && (
                    <div className="mt-1">
                      <button className="w-full pl-12 pr-3 py-1.5 hover:bg-gray-100 text-left transition-colors text-xs">
                        Part List per Produk
                      </button>
                      <button className="w-full pl-12 pr-3 py-1.5 hover:bg-gray-100 text-left transition-colors text-xs">
                        Part List per Bahan
                      </button>
                    </div>
                  )}
                  
                  <button className="flex items-center gap-1.5 w-full pl-6 pr-3 py-1.5 hover:bg-gray-100 text-left transition-colors">
                    <ChevronRight size={14} />
                    <MapPin size={13} className="flex-shrink-0" />
                    <span className="text-xs">Lokasi</span>
                  </button>
                  
                  <button className="flex items-center gap-1.5 w-full pl-6 pr-3 py-1.5 hover:bg-gray-100 text-left transition-colors">
                    <ChevronRight size={14} />
                    <Settings size={13} className="flex-shrink-0" />
                    <span className="text-xs">Setup</span>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
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
                    <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                      <label className="text-sm text-gray-700">1. Code Lama / Code Baru</label>
                      <input
                        type="text"
                        name="code_lama"
                        value={formData.code_lama}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                      <label className="text-sm text-gray-700">2. Nama Bahan <span className="text-red-500">*</span></label>
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
                      <label className="text-sm text-gray-700">3. Spesifikasi Bahan</label>
                      <input
                        type="text"
                        name="spesifikasi_bahan"
                        value={formData.spesifikasi_bahan}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                      <label className="text-sm text-gray-700">4. Ukuran / Unit Bahan</label>
                      <input
                        type="text"
                        name="ukuran_unit"
                        value={formData.ukuran_unit}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                      <label className="text-sm text-gray-700">5. Stok Awal / Jenis Bahan</label>
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
                      <label className="text-sm text-gray-700">6. Nama - Loket Bahan</label>
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
                      <label className="text-sm text-gray-700">10. Keterangan-4</label>
                      <input
                        type="text"
                        name="keterangan4"
                        value={formData.keterangan4}
                        onChange={handleInputChange}
                        className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-[160px_1fr] gap-3 items-center">
                      <label className="text-sm text-gray-700">11. Keterangan-5</label>
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
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left">Code</th>
                          <th className="px-3 py-2 text-left">Nama Bahan</th>
                          <th className="px-3 py-2 text-left">Spesifikasi</th>
                          <th className="px-3 py-2 text-left">Ukuran</th>
                          <th className="px-3 py-2 text-left">Stok Awal</th>
                          <th className="px-3 py-2 text-left">Dibuat Oleh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataList.map((item) => (
                          <tr key={item.id} className="border-t hover:bg-gray-50">
                            <td className="px-3 py-2">{item.code_lama}</td>
                            <td className="px-3 py-2">{item.nama_bahan}</td>
                            <td className="px-3 py-2">{item.spesifikasi_bahan}</td>
                            <td className="px-3 py-2">{item.ukuran_unit}</td>
                            <td className="px-3 py-2">{item.stok_awal}</td>
                            <td className="px-3 py-2">{item.created_by}</td>
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
        </main>
      </div>

      {/* Komponen Modal Modern DITAMBAHKAN DI SINI */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)} 
        onSubmit={executeSearch} 
      />
    </div>
  );
}