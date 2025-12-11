import { supabase } from "../supabase";
import { Bahan } from "@/types/bahan";

export const bahanService = {
  async getAll() {
    const { data, error } = await supabase
      .from("bahan")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;
    return data as Bahan[];
  },

  async search(keyword: string) {
    const { data, error } = await supabase
      .from("bahan")
      .select("*")
      .ilike("nama_bahan", `%${keyword}%`);

    if (error) throw error;
    return data as Bahan[];
  },

  async create(payload: Bahan, createdBy: string) {
    // Check if code_lama already exists
    if (payload.code_lama) {
      const { data: existing, error: checkError } = await supabase
        .from("bahan")
        .select("code_lama")
        .eq("code_lama", payload.code_lama)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existing) {
        const error = new Error("Kode bahan ini sudah ada di database");
        throw error;
      }
    }

    const { data, error } = await supabase
      .from("bahan")
      .insert({
        ...payload,
        created_by: createdBy,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
