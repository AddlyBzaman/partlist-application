import { db } from '@/lib/db';

export interface Produk {
  id?: number;
  namaproduk: string;
  rated?: string;
  produk1?: string;
  produk2?: string;
  produk3?: string;
  stokproduk?: string;
  createdby?: string;
  createdat?: string;
  updatedat?: string;
  produkSnr18Kais?: any[];
  produkBahans?: any[];
}

export interface SNR18KAI {
  id?: number;
  namaBahan: string;
  created_at?: string;
  updated_at?: string;
}

export class ProdukService {
  // Search products from partlist table
  static async search(keyword: string): Promise<Produk[]> {
    try {
      const [rows] = await db.query(
        `SELECT * FROM partlist WHERE 
         produk LIKE ? OR 
         rated LIKE ? OR 
         produk1 LIKE ? OR 
         produk2 LIKE ? OR 
         produk3 LIKE ? OR 
         no_part LIKE ?
         ORDER BY LAST_UPDATE DESC
         LIMIT 50`,
        [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
      );

      return (rows as any[]).map((row: any) => ({
        id: row.id,
        namaproduk: row.PRODUK || '',
        rated: row.RATED || '',
        produk1: row.PRODUK1 || '',
        produk2: row.PRODUK2 || '',
        produk3: row.PRODUK3 || '',
        stokproduk: row.NO_PART || '',
        createdby: row.USER_ID || '',
        createdat: row.LAST_UPDATE || '',
        updatedat: row.LAST_UPDATE || '',
        produkSnr18Kais: [],
        produkBahans: []
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Get product by ID
  static async getById(id: number): Promise<Produk> {
    try {
      const [rows] = await db.query(
        'SELECT * FROM partlist WHERE id = ?',
        [id]
      );

      const products = rows as any[];
      if (products.length === 0) {
        throw new Error('Product not found');
      }

      const product = products[0];
      return {
        id: product.id,
        namaproduk: product.PRODUK || '',
        rated: product.RATED || '',
        produk1: product.PRODUK1 || '',
        produk2: product.PRODUK2 || '',
        produk3: product.PRODUK3 || '',
        stokproduk: product.NO_PART || '',
        createdby: product.USER_ID || '',
        createdat: product.LAST_UPDATE || '',
        updatedat: product.LAST_UPDATE || '',
        produkSnr18Kais: [],
        produkBahans: []
      };
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  }

  // Create new product
  static async create(product: Produk, username: string): Promise<Produk[]> {
    try {
      const [result] = await db.query(
        `INSERT INTO partlist (
          PRODUK, RATED, PRODUK1, PRODUK2, PRODUK3, NO_PART, USER_ID, LAST_UPDATE
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          product.namaproduk,
          product.rated || null,
          product.produk1 || null,
          product.produk2 || null,
          product.produk3 || null,
          product.stokproduk || null,
          username
        ]
      );

      // Return the created product
      const newProduct = await this.getById((result as any).insertId);
      return [newProduct];
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  // Get all products
  static async getAll(): Promise<Produk[]> {
    try {
      const [rows] = await db.query('SELECT * FROM partlist ORDER BY LAST_UPDATE DESC LIMIT 100');

      return (rows as any[]).map((row: any) => ({
        id: row.id,
        namaproduk: row.PRODUK || '',
        rated: row.RATED || '',
        produk1: row.PRODUK1 || '',
        produk2: row.PRODUK2 || '',
        produk3: row.PRODUK3 || '',
        stokproduk: row.NO_PART || '',
        createdby: row.USER_ID || '',
        createdat: row.LAST_UPDATE || '',
        updatedat: row.LAST_UPDATE || '',
        produkSnr18Kais: [],
        produkBahans: []
      }));
    } catch (error) {
      console.error('Error getting all products:', error);
      return [];
    }
  }
}

export const produkService = ProdukService;
