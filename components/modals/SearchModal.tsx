// SearchModal.tsx
import React, { useState } from "react";
import { X } from "lucide-react";

interface SearchModalProps {
  /** * Status untuk menentukan apakah modal harus ditampilkan.
   */
  isOpen: boolean;

  /** * Fungsi untuk menutup modal (dipicu oleh tombol Batal atau tombol Close).
   */
  onClose: () => void;

  /** * Fungsi yang dipicu saat tombol Cari ditekan, membawa kata kunci pencarian.
   */
  onSubmit: (keyword: string) => void;
}

const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  // State lokal untuk menyimpan input kata kunci
  const [keyword, setKeyword] = useState("");

  // Jika isOpen false, tidak ada yang dirender
  if (!isOpen) return null;

  const handleSubmit = () => {
    // Panggil fungsi onSubmit yang ada di komponen induk (BahanPage)
    // Kata kunci dikirimkan untuk menjalankan bahanService.search()
    onSubmit(keyword);
    setKeyword(""); // Reset input setelah dikirim
  };

  const handleClose = () => {
    onClose(); // Tutup modal
    setKeyword(""); // Reset input saat ditutup
  };

  return (
    // Overlay: Latar belakang gelap yang menutupi seluruh layar
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300"
      // Tambahkan handler klik di overlay untuk menutup modal (opsional)
      onClick={handleClose}
    >
      {/* Kotak Modal itu sendiri */}
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-sm m-4 transform scale-100 transition-transform duration-300"
        // Menghentikan event bubbling agar klik di modal tidak menutup modal
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Cari Data Bahan
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Konten/Input */}
        <div className="p-4">
          <label
            htmlFor="search-keyword"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Masukkan Kata Kunci:
          </label>
          <input
            id="search-keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            // Memungkinkan submit ketika tombol Enter ditekan
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cari nama, kode, atau spesifikasi..."
            autoFocus // Otomatis fokus ke input saat modal terbuka
          />
        </div>

        {/* Footer/Tombol Aksi */}
        <div className="p-4 border-t flex justify-end space-x-3 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition"
          >
            Cari
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
