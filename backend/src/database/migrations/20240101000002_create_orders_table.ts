import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('orders', (table: Knex.TableBuilder) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable().references('id').inTable('users');
    table.integer('product_id').unsigned().notNullable().references('id').inTable('products');
    table.integer('quantity').notNullable();
    table.decimal('total_price', 10, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('orders');
} 