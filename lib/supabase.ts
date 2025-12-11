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

// ✅ BARU: CRUD Operations untuk Bahan Input Sementara
export const bahanSementaraService = {
  async create(
    data: BahanInputSementara,
    username?: string,
    sessionId?: string
  ) {
    // Remove id and auto-generated fields
    const { id, created_at, updated_at, ...insertData } = data;

    if (username) {
      insertData.created_by = username;
    }
    if (sessionId) {
      insertData.session_id = sessionId;
    }

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

// CRUD Operations untuk Produk (tetap sama)
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
      .select("*")
      .order("createdat", { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from("produk")
      .select("*")
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
      .or(`namaproduk.ilike.%${keyword}%,kated.ilike.%${keyword}%`)
      .order("createdat", { ascending: false });

    if (error) throw error;
    return data;
  },
};
