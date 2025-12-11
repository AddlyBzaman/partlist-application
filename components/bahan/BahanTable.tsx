"use client";

import { Bahan } from "@/types/bahan";

interface BahanTableProps {
  data: Bahan[];
}

export default function BahanTable({ data }: BahanTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Kode Lama
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Nama Bahan
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Spesifikasi
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Ukuran Unit
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Stok Awal
            </th>
            <th className="px-6 py-3 text-left text-sm font-semibold">
              Nama Loket
            </th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                Tidak ada data
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">{item.code_lama}</td>
                <td className="px-6 py-3">{item.nama_bahan}</td>
                <td className="px-6 py-3">{item.spesifikasi_bahan}</td>
                <td className="px-6 py-3">{item.ukuran_unit}</td>
                <td className="px-6 py-3">{item.stok_awal}</td>
                <td className="px-6 py-3">{item.nama_loket}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
