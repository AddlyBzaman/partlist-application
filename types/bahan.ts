export interface Bahan {
  id?: number;
  NOMOR?: string | null;
  CODE: string;
  CODE_BARU?: string | null;
  LNAMA?: string | null;
  UNIT?: string | null;
  PROSES?: string | null;
  BDOWN?: string | null;
  SPEK?: string | null;
  RUMUS?: string | null;
  Produk?: string | null;
  pakaiperpcs?: string | null;
  namawip?: string | null;
  departemen?: string | null;
  bagian?: string | null;
  namabahan?: string | null;
  last_update?: string | null;
  user_id?: string | null;
  NOPROD?: string | null;
  FLAG?: string | null;
}

export interface BahanInputSementara extends Bahan {
  session_id?: string;
}
