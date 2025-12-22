// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types untuk Bahan
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

// ✅ BARU: Type untuk Bahan Input Sementara
export interface BahanInputSementara extends Bahan {
  session_id?: string;
}

// Types untuk Produk
export interface Produk {
  id?: number;
  namaproduk: string;
  rated: string;
  produk1: string;
  produk2: string;
  produk3: string;
  stokproduk: string;
  createdby?: string;
  createdat?: string;
  updatedat?: string;
  // Relations
  produkSnr18Kais?: ProdukSnr18Kai[];
  produkBahans?: ProdukBahan[];
}

// Types untuk Produk SNR18_KAI Relation
export interface ProdukSnr18Kai {
  id?: number;
  produkId: number;
  snr18KaiId: number;
  quantity?: number;
  createdAt?: string;
  // Relations
  produk?: Produk;
  snr18Kai?: SNR18KAI;
}

// Types untuk Produk Bahan Relation
export interface ProdukBahan {
  id?: number;
  produkId: number;
  bahanId: number;
  quantity?: number;
  createdAt?: string;
  // Relations
  produk?: Produk;
  bahan?: Bahan;
}

// Types untuk SNR18_KAI
export interface SNR18KAI {
  id?: number;
  code: string;
  namaBahan: string;
  spesifikasi?: string;
  keterangan?: string;
  pakaiPerPc?: number;
  unit: string;
  hargaIdr?: number;
  hargaUsd?: number;
  hargaJpy?: number;
  beaMasukPersen?: number;
  freight?: number;
  totalUsd?: number;
  pembelianTerakhir?: string;
  keteranganAkhir?: string;
  createdAt?: string;
  updatedAt?: string;
}

// CRUD Operations untuk Bahan (tabel utama)
export const bahanService = {
  async create(data: Bahan, username?: string) {
    const insertData: any = { ...data };
    if (username) {
      insertData.created_by = username;
    }

    const { data: result, error } = await supabase
      .from("bahan")
      .insert([insertData])
      .select();

    if (error) throw error;
    return result;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("bahan")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from("bahan")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, data: Partial<Bahan>) {
    const { data: result, error } = await supabase
      .from("bahan")
      .update(data)
      .eq("id", id)
      .select();

    if (error) throw error;
    return result;
  },

  async delete(id: number) {
    const { error } = await supabase.from("bahan").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  async search(keyword: string) {
    const { data, error } = await supabase
      .from("bahan")
      .select("*")
      .or(`code_lama.ilike.%${keyword}%,nama_bahan.ilike.%${keyword}%`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },
};


export const bahanSementaraService = {
  async create(
    data: BahanInputSementara,
    username?: string,
    sessionId?: string
  ) {
    
    const { id, created_at, updated_at, ...insertData } = data;

    if (username) {
      insertData.created_by = username;
    }
    insertData.session_id = sessionId || insertData.session_id || "global";

    const { data: result, error } = await supabase
      .from("bahan_input_sementara")
      .insert([insertData])
      .select();

    if (error) throw error;
    return result;
  },

  async getAllBySession(sessionId: string) {
    const { data, error } = await supabase
      .from("bahan_input_sementara")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("bahan_input_sementara")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async deleteById(id: number) {
    const { error } = await supabase
      .from("bahan_input_sementara")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },

  async deleteAllBySession(sessionId: string) {
    const { error } = await supabase
      .from("bahan_input_sementara")
      .delete()
      .eq("session_id", sessionId);

    if (error) throw error;
    return true;
  },

  async deleteAll() {
    const { error } = await supabase
      .from("bahan_input_sementara")
      .delete()
      .not("id", "is", null);

    if (error) throw error;
    return true;
  },

  async reassignSession(oldSessionId: string, newSessionId: string) {
    const { error } = await supabase
      .from("bahan_input_sementara")
      .update({ session_id: newSessionId })
      .eq("session_id", oldSessionId);

    if (error) throw error;
    return true;
  },

  async moveToMainTable(sessionId: string) {
    // Ambil semua data dari tabel sementara
    const { data: sementaraData, error: fetchError } = await supabase
      .from("bahan_input_sementara")
      .select("*")
      .eq("session_id", sessionId);

    if (fetchError) throw fetchError;
    if (!sementaraData || sementaraData.length === 0) {
      throw new Error("Tidak ada data untuk dipindahkan");
    }

    // Siapkan data untuk insert ke tabel utama
    const dataToInsert = sementaraData.map((item) => ({
      code_lama: item.code_lama,
      nama_bahan: item.nama_bahan,
      spesifikasi_bahan: item.spesifikasi_bahan,
      ukuran_unit: item.ukuran_unit,
      stok_awal: item.stok_awal,
      nama_loket: item.nama_loket,
      keterangan1: item.keterangan1,
      keterangan2: item.keterangan2,
      keterangan3: item.keterangan3,
      keterangan4: item.keterangan4,
      keterangan5: item.keterangan5,
      created_by: item.created_by,
    }));

    // Insert ke tabel utama
    const { error: insertError } = await supabase
      .from("bahan")
      .insert(dataToInsert);

    if (insertError) throw insertError;

    // Hapus dari tabel sementara
    await this.deleteAllBySession(sessionId);

    return sementaraData.length;
  },
};

// CRUD Operations untuk Produk
export const produkService = {
  async create(data: Produk, username?: string) {
    const insertData: any = { ...data };
    if (username) {
      insertData.createdby = username;
    }

    const { data: result, error } = await supabase
      .from("produk")
      .insert([insertData])
      .select();

    if (error) throw error;
    return result;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("produk")
      .select(`
        *,
        produkSnr18Kais (
          *,
          snr18Kai (*)
        ),
        produkBahans (
          *,
          bahan (*)
        )
      `)
      .order("createdat", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from("produk")
      .select(`
        *,
        produkSnr18Kais (
          *,
          snr18Kai (*)
        ),
        produkBahans (
          *,
          bahan (*)
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, data: Partial<Produk>) {
    const { data: result, error } = await supabase
      .from("produk")
      .update(data)
      .eq("id", id)
      .select();

    if (error) throw error;
    return result;
  },

  async delete(id: number) {
    const { error } = await supabase.from("produk").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  async search(keyword: string) {
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .or(`namaproduk.ilike.%${keyword}%,rated.ilike.%${keyword}%`)
      .order("createdat", { ascending: false });

    if (error) throw error;
    return data;
  },
};

// CRUD Operations untuk Produk SNR18_KAI Relation
export const produkSnr18KaiService = {
  async create(data: ProdukSnr18Kai) {
    const { data: result, error } = await supabase
      .from("produkSnr18Kai")
      .insert([data])
      .select(`
        *,
        snr18Kai (*)
      `);

    if (error) throw error;
    return result;
  },

  async getByProdukId(produkId: number) {
    const { data, error } = await supabase
      .from("produkSnr18Kai")
      .select(`
        *,
        snr18Kai (*)
      `)
      .eq("produkId", produkId);

    if (error) throw error;
    return data;
  },

  async update(id: number, data: Partial<ProdukSnr18Kai>) {
    const { data: result, error } = await supabase
      .from("produkSnr18Kai")
      .update(data)
      .eq("id", id)
      .select();

    if (error) throw error;
    return result;
  },

  async delete(id: number) {
    const { error } = await supabase.from("produkSnr18Kai").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  async deleteByProdukAndSnr18(produkId: number, snr18KaiId: number) {
    const { error } = await supabase
      .from("produkSnr18Kai")
      .delete()
      .eq("produkId", produkId)
      .eq("snr18KaiId", snr18KaiId);

    if (error) throw error;
    return true;
  },
};

// CRUD Operations untuk Produk Bahan Relation
export const produkBahanService = {
  async create(data: ProdukBahan) {
    const { data: result, error } = await supabase
      .from("produkBahan")
      .insert([data])
      .select(`
        *,
        bahan (*)
      `);

    if (error) throw error;
    return result;
  },

  async getByProdukId(produkId: number) {
    const { data, error } = await supabase
      .from("produkBahan")
      .select(`
        *,
        bahan (*)
      `)
      .eq("produkId", produkId);

    if (error) throw error;
    return data;
  },

  async update(id: number, data: Partial<ProdukBahan>) {
    const { data: result, error } = await supabase
      .from("produkBahan")
      .update(data)
      .eq("id", id)
      .select();

    if (error) throw error;
    return result;
  },

  async delete(id: number) {
    const { error } = await supabase.from("produkBahan").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  async deleteByProdukAndBahan(produkId: number, bahanId: number) {
    const { error } = await supabase
      .from("produkBahan")
      .delete()
      .eq("produkId", produkId)
      .eq("bahanId", bahanId);

    if (error) throw error;
    return true;
  },
};

// CRUD Operations untuk SNR18_KAI
export const snr18KaiService = {
  async create(data: SNR18KAI) {
    const { data: result, error } = await supabase
      .from("snr18_kai")
      .insert([data])
      .select();

    if (error) throw error;
    return result;
  },

  async getAll() {
    const { data, error } = await supabase
      .from("snr18_kai")
      .select("*")
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from("snr18_kai")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: number, data: Partial<SNR18KAI>) {
    const { data: result, error } = await supabase
      .from("snr18_kai")
      .update(data)
      .eq("id", id)
      .select();

    if (error) throw error;
    return result;
  },

  async delete(id: number) {
    const { error } = await supabase.from("snr18_kai").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  async search(keyword: string) {
    const { data, error } = await supabase
      .from("snr18_kai")
      .select("*")
      .or(`code.ilike.%${keyword}%,namaBahan.ilike.%${keyword}%,spesifikasi.ilike.%${keyword}%`)
      .order("createdAt", { ascending: false });

    if (error) throw error;
    return data;
  },
};
