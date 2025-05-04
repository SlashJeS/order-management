import db from '../database/connection';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: Date;
}

export const UserModel = {
  async findByEmail(email: string): Promise<User | null> {
    const user = await db('users').where('email', email).first();
    return user || null;
  },

  async create(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    const [newUser] = await db('users').insert(user).returning('*');
    return newUser;
  },

  async findById(id: number): Promise<User | null> {
    const user = await db('users').where('id', id).first();
    return user || null;
  },
}; 