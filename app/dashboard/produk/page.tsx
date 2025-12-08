'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, logout } from '@/lib/auth';
import { produkService, Produk } from '@/lib/supabase';
import { ChevronRight, ChevronDown, Home, RefreshCw, FileText, MapPin, Settings, Save, RotateCcw, Search, LogOut, Loader2 } from 'lucide-react';

interface ExpandedMenus {
  application: boolean;
  referensi: boolean;
  partList: boolean;
}

export default function ProdukPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  
  const [expandedMenus, setExpandedMenus] = useState<ExpandedMenus>({
    application: true,
    referensi: true,
    partList: false
  });

  const [formData, setFormData] = useState({
    namaproduk: '',
    rated: '',
    produk1: '',
    produk2: '',
    produk3: '',
    stokproduk: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState<Produk[]>([]);

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
      const data = await produkService.getAll();
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

  const handleBrowse = async () => {
    const keyword = prompt('Masukkan kata kunci pencarian:');
    if (keyword) {
      try {
        const results = await produkService.search(keyword);
        setDataList(results || []);
      } catch (error) {
        console.error('Error searching:', error);
        alert('Gagal melakukan pencarian');
      }
    }
  };

  const handleSave = async () => {
    // Validasi
    if (!formData.namaproduk) {
      alert('Nama Produk wajib diisi!');
      return;
    }

    setIsLoading(true);

    try {
      await produkService.create(formData as Produk, session?.username || 'Unknown');
      
      alert('Data berhasil disimpan!');
      handleReset();
      loadData();
    } catch (error: any) {
      console.error('Error saving data:', error);
      alert(`Gagal menyimpan data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      namaproduk: '',
      rated: '',
      produk1: '',
      produk2: '',
      produk3: '',
      stokproduk: ''
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
                      <button 
                        onClick={() => router.push('/dashboard/bahan')}
                        className="flex items-center gap-1.5 w-full pl-12 pr-3 py-1.5 hover:bg-gray-100 text-left transition-colors"
                      >
                        <FileText size={13} className="flex-shrink-0" />
                        <span className="text-xs">Bahan</span>
                      </button>
                      <button className="flex items-center gap-1.5 w-full pl-12 pr-3 py-1.5 bg-blue-500 text-white text-left transition-colors">
                        <FileText size={13} className="flex-shrink-0" />
                        <span className="text-xs font-medium">Produk</span>
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
                Produk ({dataList.length} data)
              </span>
            </div>

            {/* Form Content */}
            <div className="flex-1 p-5 overflow-auto">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-3xl">
                
                <div className="space-y-4">
                  <div className="grid grid-cols-[200px_1fr] gap-3 items-center">
                    <label className="text-sm text-gray-700">1. Nama / Nama Produk <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="namaproduk"
                      value={formData.namaproduk}
                      onChange={handleInputChange}
                      required
                      className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                    />
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
                    <label className="text-sm text-gray-700">6. Stok Produk / No Part</label>
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

              {/* Tabel Data */}
              {dataList.length > 0 && (
                <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <h3 className="text-sm font-semibold mb-3">Data Produk Terdaftar</h3>
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
                          <th className="px-3 py-2 text-left">Dibuat Oleh</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataList.map((item) => (
                          <tr key={item.id} className="border-t hover:bg-gray-50">
                            <td className="px-3 py-2">{item.namaproduk}</td>
                            <td className="px-3 py-2">{item.rated}</td>
                            <td className="px-3 py-2">{item.produk1}</td>
                            <td className="px-3 py-2">{item.produk2}</td>
                            <td className="px-3 py-2">{item.produk3}</td>
                            <td className="px-3 py-2">{item.stokproduk}</td>
                            <td className="px-3 py-2">{item.createdby}</td>
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
    </div>
  );
}