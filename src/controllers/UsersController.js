const { hash } = require('bcryptjs');

const AppError = require('../utils/AppError')

const sqliteConnection = require('../database/sqlite');

class UsersController {
  async create(request, response) {
    const { name, password } = request.body;
    const email = request.body.email.toLowerCase();

    const database = await sqliteConnection();
    const checkUserExists = await database.get('SELECT * FROM users WHERE email = (?)', [email]);

    if (checkUserExists) {
      throw new AppError(`Email ${email} already exists`);
    };

    const hashedPassword = await hash(password, 8);

    await database.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);

    return response.status(201).json();
  };
};

module.exports = UsersController;