import { Knex } from 'knex';

exports.seed = async (knex: Knex): Promise<void> => {
  await knex('services').del();

  await knex('services').insert([
    {
      sku: '87968676886768',
      name: 'Site',
      sale_price: 5000,
      company_id: 1,
    },
    {
      sku: '3232525235125',
      name: 'Aplciativo',
      sale_price: 30000,
      company_id: 1,
    },
  ]);
};
