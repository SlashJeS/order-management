import db from '../database/connection';

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  created_at: Date;
}

export const ProductModel = {
  async findAll(): Promise<Product[]> {
    return db('products').select('*');
  },

  async findById(id: number): Promise<Product | null> {
    const product = await db('products').where('id', id).first();
    return product || null;
  },

  async updateStock(id: number, quantity: number): Promise<Product> {
    const [updatedProduct] = await db('products')
      .where('id', id)
      .decrement('stock', quantity)
      .returning('*');
    return updatedProduct;
  },
}; 