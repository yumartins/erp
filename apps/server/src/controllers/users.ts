import { bcrypt, remove } from '@core/helpers';
import { Context } from 'koa';

import knex from '../database';

const users = {
  list: async (ctx: Context): Promise<void> => {
    const {
      role,
      father,
    } = ctx.query;

    const roles = role && await knex('roles').where({ name: role }).first();

    /**
     * Checks if the permission
     * user "USER" is sending the query "father_id".
     */
    if ((! role || role === 'USER') && ! father) ctx.throw(400, 'The "father" query is required.');

    await knex('users')
      .where({ role_id: roles?.id || 1 })
      .andWhere({ father_id: father || null })
      .returning('*')
      .then((user) => {
        const usered = user.map(({ password, ...rest }) => rest);

        ctx.body = usered;
      });
  },

  show: async (ctx: Context, next: () => Promise<void>): Promise<void> => {
    await next();

    const {
      id,
    } = ctx.params;

    const logged = await knex('users').where({ id }).first();

    ctx.body = remove('password', logged);
  },

  create: async (ctx: Context, next: () => Promise<void>): Promise<void> => {
    await next();

    const {
      role,
    } = ctx.query;

    const {
      name,
      email,
      password,
      father_id,
    } = ctx.request.body;

    const hash = await bcrypt.hash(password);

    const roles = role && await knex('roles').where({ name: role }).first();
    const logged = await knex('users').where({ email }).first();

    /**
     * Checks if the email is
     * already registered in the database.
     */
    if (email === logged?.email) ctx.throw(400, 'Registered user.');

    /**
     * Checks if the permission
     * user "USER" is sending the key "father_id".
     */
    if ((! role || role === 'USER') && ! father_id) ctx.throw(400, 'Required father_id.');

    await knex('users')
      .insert({
        name,
        email,
        role_id: roles?.id || 1,
        password: hash,
        father_id: father_id || null,
      })
      .returning('*')
      .then((user) => {
        ctx.body = remove('password', user[0]);

        ctx.status = 201;
      });
  },

  update: async (ctx: Context, next: () => Promise<void>): Promise<void> => {
    await next();

    const {
      id,
    } = ctx.params;

    const {
      name,
      email,
      password,
    } = ctx.request.body;

    const logged = await knex('users').where({ id }).first();

    const hash = password ? await bcrypt.hash(password) : logged.password;

    await knex('users')
      .update({
        name,
        email,
        password: hash,
      })
      .where({ id })
      .returning('*')
      .then((user) => {
        ctx.body = remove('password', user[0]);
      });
  },

  delete: async (ctx: Context, next: () => Promise<void>): Promise<void> => {
    await next();

    const {
      id,
    } = ctx.params;

    await knex('users')
      .where({ id })
      .del();

    ctx.status = 200;
  },
};

export default users;
