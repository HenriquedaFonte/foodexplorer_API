const { compare } = require('bcryptjs');  
const { sign } = require('jsonwebtoken');
const knex = require('../database/knex');
const AppError = require('../utils/AppError');
const authConfig = require('../configs/auth');


class SessionsController {
  async create(request, response) {
    const { email, password } = request.body;

    const user = await knex('users').where({ email }).first();

    if(!user) {
      throw new AppError('Email or password not found, please try again.',  401);
    };

    const passwordMatched = await compare(password, user.password);
    if(!passwordMatched) {
      throw new AppError('Email or password not found, please try again.', 401);
    };

    const isAdmin = (user.email === 'admin@email.com' ? true : false);

    const { secret, expiresIn } = authConfig.jwt;
    const token = sign({}, secret, {
      subject: String(user.id),
      expiresIn
    });

    return response.json({ user, token, isAdmin });
  };
};

module.exports = SessionsController;