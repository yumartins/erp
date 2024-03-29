import { Knex } from 'knex';

exports.seed = async (knex: Knex): Promise<void> => {
  await knex('roles').del();

  await knex('roles').insert([
    { name: 'ADMIN' },
    { name: 'OPERATOR' },
    { name: 'FINANCIAL' },
  ]);
};
