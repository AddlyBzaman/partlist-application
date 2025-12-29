import { db } from '@/lib/db';
import { Bahan } from '@/types/bahan';

export const bahanService = {
  async getAll(): Promise<Bahan[]> {
    try {
      const [rows] = await db.query('SELECT * FROM partlist ORDER BY id DESC');
      return rows as Bahan[];
    } catch (error) {
      console.error('Error fetching bahan data:', error);
      throw error;
    }
  },

  async search(keyword: string): Promise<Bahan[]> {
    try {
      const [rows] = await db.query(
        'SELECT * FROM partlist WHERE CODE LIKE ? OR LNAMA LIKE ? OR SPEK LIKE ? ORDER BY id DESC',
        [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
      );
      return rows as Bahan[];
    } catch (error) {
      console.error('Error searching bahan:', error);
      throw error;
    }
  },

  async create(data: any, createdBy: string): Promise<Bahan> {
    try {
      const [result] = await db.query(
        `INSERT INTO partlist (
          CODE, LNAMA, UNIT, SPEK, CODE_BARU, Produk, last_update, user_id, FLAG
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.code_lama,
          data.nama_bahan || null,
          data.ukuran_unit || null,
          data.spesifikasi_bahan || null,
          data.code_baru || null,
          data.produk || null,
          new Date().toISOString().slice(0, 19).replace('T', ' '),
          createdBy,
          '1'
        ]
      );
      
      // Get inserted record
      const [insertedRows] = await db.query('SELECT * FROM partlist WHERE CODE = ?', [data.code_lama]);
      return (insertedRows as Bahan[])[0];
    } catch (error) {
      console.error('Error creating bahan:', error);
      throw error;
    }
  },

  async deleteById(id: number): Promise<void> {
    try {
      await db.query('DELETE FROM partlist WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting bahan:', error);
      throw error;
    }
  },

  async deleteAll(): Promise<void> {
    try {
      await db.query('DELETE FROM partlist');
    } catch (error) {
      console.error('Error deleting all bahan:', error);
      throw error;
    }
  }
};
