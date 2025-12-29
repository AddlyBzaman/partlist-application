import { db } from '@/lib/db';

export interface PartlistA {
  id?: number;
  kodeBahanLama: string;
  kodeBahanBaru?: string;
  namaBahan: string;
  spesifikasi?: string;
  unitBrand?: string;
  cost?: number;
  beaMaterial?: string;
  supplier?: string;
}

export class PartlistAService {
  // Get all data with pagination and search
  static async getAll(page: number = 1, limit: number = 50, keyword?: string): Promise<{data: PartlistA[], pagination: any}> {
    try {
      let query = 'SELECT * FROM bahan';
      let params: any[] = [];

      if (keyword) {
        query += ' WHERE CODE LIKE ? OR CODE_BARU LIKE ? OR NAMA LIKE ? OR SPESIFIKASI LIKE ? OR UNIT LIKE ? OR HARGA LIKE ? OR SUPPLIER LIKE ?';
        const searchTerm = `%${keyword}%`;
        params = Array(7).fill(searchTerm);
      }

      query += ' ORDER BY CODE LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);

      const [rows] = await db.query(query, params);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM bahan';
      let countParams: any[] = [];

      if (keyword) {
        countQuery += ' WHERE CODE LIKE ? OR CODE_BARU LIKE ? OR NAMA LIKE ? OR SPESIFIKASI LIKE ? OR UNIT LIKE ? OR HARGA LIKE ? OR SUPPLIER LIKE ?';
        const searchTerm = `%${keyword}%`;
        countParams = Array(7).fill(searchTerm);
      }

      const [countResult] = await db.query(countQuery, countParams);
      const total = (countResult as any[])[0].total;

      // Map database columns to frontend field names
      const mappedData = (rows as any[]).map((row: any) => ({
        id: row.id,
        kodeBahanLama: row.CODE || '',
        kodeBahanBaru: row.CODE_BARU || '',
        namaBahan: row.NAMA || '',
        spesifikasi: row.SPFESIFIKASI || '',
        unitBrand: row.UNIT || '',
        cost: row.HARGA || 0,
        beaMaterial: '', // BEA_MATERIAL tidak ada di schema
        supplier: row.SUPPLIER || ''
      }));

      return {
        data: mappedData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error getting all partlist_a:', error);
      return {
        data: [],
        pagination: { page: 1, limit: 50, total: 0, totalPages: 0 }
      };
    }
  }

  // Get by ID
  static async getById(id: number): Promise<PartlistA> {
    try {
      const [rows] = await db.query('SELECT * FROM bahan WHERE id = ?', [id]);
      
      const items = rows as any[];
      if (items.length === 0) {
        throw new Error('Partlist A not found');
      }

      const item = items[0];
      return {
        id: item.id,
        kodeBahanLama: item.CODE || '',
        kodeBahanBaru: item.CODE_BARU || '',
        namaBahan: item.NAMA || '',
        spesifikasi: item.SPFESIFIKASI || '',
        unitBrand: item.UNIT || '',
        cost: item.HARGA || 0,
        beaMaterial: '', // BEA_MATERIAL tidak ada di schema
        supplier: item.SUPPLIER || ''
      };
    } catch (error) {
      console.error('Error getting partlist_a:', error);
      throw error;
    }
  }

  // Create new
  static async create(data: PartlistA, username: string): Promise<PartlistA> {
    try {
      const [result] = await db.query(
        `INSERT INTO bahan (
          CODE, CODE_BARU, NAMA, SPESIFIKASI, UNIT, HARGA, SUPPLIER, USER_ID, LAST_UPDATE
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.kodeBahanLama,
          data.kodeBahanBaru || null,
          data.namaBahan,
          data.spesifikasi || null,
          data.unitBrand || null,
          data.cost || null,
          data.supplier || null,
          username,
          new Date().toISOString().slice(0, 19).replace('T', ' ')
        ]
      );

      // Return the created item
      const newItem = await this.getById((result as any).insertId);
      return newItem;
    } catch (error) {
      console.error('Error creating partlist_a:', error);
      throw error;
    }
  }

  // Update
  static async update(id: number, data: PartlistA): Promise<PartlistA> {
    try {
      await db.query(
        `UPDATE bahan SET 
          CODE = ?, CODE_BARU = ?, NAMA = ?, SPESIFIKASI = ?, UNIT = ?, HARGA = ?, SUPPLIER = ?, LAST_UPDATE = ?
        WHERE id = ?`,
        [
          data.kodeBahanLama,
          data.kodeBahanBaru || null,
          data.namaBahan,
          data.spesifikasi || null,
          data.unitBrand || null,
          data.cost || null,
          data.supplier || null,
          new Date().toISOString().slice(0, 19).replace('T', ' '),
          id
        ]
      );

      return await this.getById(id);
    } catch (error) {
      console.error('Error updating partlist_a:', error);
      throw error;
    }
  }

  // Delete
  static async delete(id: number): Promise<void> {
    try {
      await db.query('DELETE FROM bahan WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting partlist_a:', error);
      throw error;
    }
  }

  // Search
  static async search(keyword: string): Promise<PartlistA[]> {
    try {
      const [rows] = await db.query(
        'SELECT * FROM bahan WHERE CODE LIKE ? OR CODE_BARU LIKE ? OR NAMA LIKE ? OR SPESIFIKASI LIKE ? OR UNIT LIKE ? OR HARGA LIKE ? OR SUPPLIER LIKE ? ORDER BY CODE LIMIT 50',
        [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
      );

      // Map database columns to frontend field names
      return (rows as any[]).map((row: any) => ({
        id: row.id,
        kodeBahanLama: row.CODE || '',
        kodeBahanBaru: row.CODE_BARU || '',
        namaBahan: row.NAMA || '',
        spesifikasi: row.SPFESIFIKASI || '',
        unitBrand: row.UNIT || '',
        cost: row.HARGA || 0,
        beaMaterial: '', // BEA_MATERIAL tidak ada di schema
        supplier: row.SUPPLIER || ''
      }));
    } catch (error) {
      console.error('Error searching partlist_a:', error);
      return [];
    }
  }
}

export const partlistAService = PartlistAService;
