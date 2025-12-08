// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export interface Bahan {
  id?: string;
  code_lama: string;
  code_baru: string;
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

// Types untuk Produk
export interface Produk {
  id?: string;
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

// CRUD Operations
export const bahanService = {
  // Create - Tambah data bahan baru
  async create(data: Bahan, username: string) {
    const { data: result, error } = await supabase
      .from('bahan')
      .insert([
        {
          ...data,
          created_by: username,
        },
      ])
      .select();

    if (error) throw error;
    return result;
  },

  // Read - Ambil semua data bahan
  async getAll() {
    const { data, error } = await supabase
      .from('bahan')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Read - Ambil data bahan by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('bahan')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Update - Update data bahan
  async update(id: string, data: Partial<Bahan>) {
    const { data: result, error } = await supabase
      .from('bahan')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    return result;
  },

  // Delete - Hapus data bahan
  async delete(id: string) {
    const { error } = await supabase.from('bahan').delete().eq('id', id);

    if (error) throw error;
    return true;
  },

  // Search - Cari data bahan
  async search(keyword: string) {
    const { data, error } = await supabase
      .from('bahan')
      .select('*')
      .or(`code_lama.ilike.%${keyword}%,nama_bahan.ilike.%${keyword}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
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
      .from('produk')
      .insert([insertData])
      .select();

    if (error) throw error;
    return result;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .order('createdat', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, data: Partial<Produk>) {
    const { data: result, error } = await supabase
      .from('produk')
      .update(data)
      .eq('id', id)
      .select();

    if (error) throw error;
    return result;
  },

  async delete(id: string) {
    const { error } = await supabase.from('produk').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  async search(keyword: string) {
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .or(`namaproduk.ilike.%${keyword}%,rated.ilike.%${keyword}%`)
      .order('createdat', { ascending: false });

    if (error) throw error;
    return data;
  },
};