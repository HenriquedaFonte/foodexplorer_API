exports.up = knex =>
  knex.schema.createTable('dishes', table => {
    table.increments('id')
    table.boolean('favorite').defaultTo(false)
    table.text('category').notNullable()
    table.text('title').notNullable()
    table.text('description').notNullable()
    table.text('price').notNullable()
    table.text('avatar')
  });

exports.down = knex => knex.schema.dropTable('dishes')
