import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products', (table: Knex.TableBuilder) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('description').notNullable();
    table.decimal('price', 10, 2).notNullable();
    table.integer('stock').notNullable().defaultTo(0);
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('products');
} 