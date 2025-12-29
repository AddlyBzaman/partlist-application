import { db } from '../db';

export interface ListBahan {
  id: number;
  NOMOR?: string;
  CODE?: string;
  CODE_BARU?: string;
  LNAMA?: string;
  SPEK?: string;
  UNIT?: string;
  PROSES?: string;
  BDOWN?: string;
  RUMUS?: string;
  Produk?: string;
  pakaiperpcs?: string;
  namawip?: string;
  departemen?: string;
}

export class ListBahanService {
  static async getAll(page: number = 1, limit: number = 1000, keyword?: string): Promise<{data: ListBahan[], pagination: any}> {
    try {
      // Test database connection first
      console.log('Attempting database connection...');
      
      let query = 'SELECT id, NOMOR, CODE, CODE_BARU, LNAMA, SPEK, UNIT, PROSES, BDOWN, RUMUS, Produk, pakaiperpcs, namawip, departemen FROM partlist_a';
      let params: any[] = [];

      if (keyword && keyword.trim()) {
        const searchTerm = `%${keyword.trim()}%`;
        query += ' WHERE CODE LIKE ? OR CODE_BARU LIKE ? OR LNAMA LIKE ? OR SPEK LIKE ? OR UNIT LIKE ? OR Produk LIKE ?';
        params = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
      }

      // Add proper ordering for consistent results
      query += ' ORDER BY CODE ASC, LNAMA ASC LIMIT ? OFFSET ?';
      params.push(limit, (page - 1) * limit);

      console.log('Executing query:', query, 'with params:', params);
      const [rows] = await db.query(query, params);
      console.log('Query successful, rows:', (rows as any[]).length);

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) as total FROM partlist_a';
      let countParams: any[] = [];

      if (keyword && keyword.trim()) {
        const searchTerm = `%${keyword.trim()}%`;
        countQuery += ' WHERE CODE LIKE ? OR CODE_BARU LIKE ? OR LNAMA LIKE ? OR SPEK LIKE ? OR UNIT LIKE ? OR Produk LIKE ?';
        countParams = [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm];
      }

      const [countResult] = await db.query(countQuery, countParams);
      const total = (countResult as any[])[0].total;

      return {
        data: rows as ListBahan[],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching list bahan:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      throw new Error(`Failed to fetch data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getById(id: number): Promise<ListBahan | null> {
    try {
      const [rows] = await db.query('SELECT * FROM partlist_a WHERE id = ?', [id]);
      const items = rows as ListBahan[];
      return items.length > 0 ? items[0] : null;
    } catch (error) {
      console.error('Error fetching list bahan by id:', error);
      throw error;
    }
  }

  static async create(data: Partial<ListBahan>): Promise<ListBahan> {
    try {
      const [result] = await db.query(
        `INSERT INTO partlist_a (
          CODE, CODE_BARU, LNAMA, SPEK, UNIT, PROSES, BDOWN, RUMUS, Produk, pakaiperpcs, namawip, departemen
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          data.CODE || null,
          data.CODE_BARU || null,
          data.LNAMA || null,
          data.SPEK || null,
          data.UNIT || null,
          data.PROSES || null,
          data.BDOWN || null,
          data.RUMUS || null,
          data.Produk || null,
          data.pakaiperpcs || null,
          data.namawip || null,
          data.departemen || null
        ]
      );

      const newItem = await this.getById((result as any).insertId);
      if (!newItem) {
        throw new Error('Failed to retrieve created item');
      }
      return newItem;
    } catch (error) {
      console.error('Error creating list bahan:', error);
      throw error;
    }
  }

  static async update(id: number, data: Partial<ListBahan>): Promise<ListBahan | null> {
    try {
      const [result] = await db.query(
        `UPDATE partlist_a SET 
          CODE = ?, CODE_BARU = ?, LNAMA = ?, SPEK = ?, 
          UNIT = ?, PROSES = ?, BDOWN = ?, RUMUS = ?, 
          Produk = ?, pakaiperpcs = ?, namawip = ?, departemen = ?
        WHERE id = ?`,
        [
          data.CODE || null,
          data.CODE_BARU || null,
          data.LNAMA || null,
          data.SPEK || null,
          data.UNIT || null,
          data.PROSES || null,
          data.BDOWN || null,
          data.RUMUS || null,
          data.Produk || null,
          data.pakaiperpcs || null,
          data.namawip || null,
          data.departemen || null,
          id
        ]
      );

      if ((result as any).affectedRows === 0) {
        return null;
      }

      return await this.getById(id);
    } catch (error) {
      console.error('Error updating list bahan:', error);
      throw error;
    }
  }

  static async delete(id: number): Promise<boolean> {
    try {
      const [result] = await db.query('DELETE FROM partlist_a WHERE id = ?', [id]);
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('Error deleting list bahan:', error);
      throw error;
    }
  }

  static async search(keyword: string, page: number = 1, limit: number = 50): Promise<{data: ListBahan[], pagination: any}> {
    try {
      return await this.getAll(page, limit, keyword);
    } catch (error) {
      console.error('Error searching list bahan:', error);
      throw error;
    }
  }
}
