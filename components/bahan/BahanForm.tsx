"use client";

import { Bahan } from "@/types/bahan";

interface BahanFormProps {
  form: Partial<Bahan>;
  updateForm: (name: string, value: any) => void;
  onSave: () => void;
  loading: boolean;
}

export default function BahanForm({
  form,
  updateForm,
  onSave,
  loading,
}: BahanFormProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Tambah Bahan</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave();
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Kode Lama</label>
          <input
            type="text"
            value={form.code_lama || ""}
            onChange={(e) => updateForm("code_lama", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nama Bahan</label>
          <input
            type="text"
            value={form.nama_bahan || ""}
            onChange={(e) => updateForm("nama_bahan", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Spesifikasi Bahan
          </label>
          <input
            type="text"
            value={form.spesifikasi_bahan || ""}
            onChange={(e) => updateForm("spesifikasi_bahan", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Ukuran Unit</label>
          <input
            type="text"
            value={form.ukuran_unit || ""}
            onChange={(e) => updateForm("ukuran_unit", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stok Awal</label>
          <input
            type="text"
            value={form.stok_awal || ""}
            onChange={(e) => updateForm("stok_awal", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nama Loket</label>
          <input
            type="text"
            value={form.nama_loket || ""}
            onChange={(e) => updateForm("nama_loket", e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </div>
  );
}
