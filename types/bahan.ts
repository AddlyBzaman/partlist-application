export interface Bahan {
  id?: number;
  code_lama: string;
  nama_bahan: string;
  spesifikasi_bahan: string;
  ukuran_unit: string;
  stok_awal: string;
  nama_loket: string;
  keterangan1: string;
  keterangan2: string;
  keterangan3: string;
  keterangan4: string;
  keterangan5: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BahanInputSementara extends Bahan {
  session_id?: string;
}
