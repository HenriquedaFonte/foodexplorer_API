const knex = require('../database/knex');
const AppError = require('../utils/AppError');
const DiskStorage = require('../providers/DiskStorage');

class IngredientsAvatarController {
  async update(request, response) {
    const { ingredients_id } = request.params;
    const avatarFileName = request.file.filename;

    const diskStorage = new DiskStorage();

    const ingredients = await knex('ingredients')
    .where({ id: ingredients_id })
    .first();

    if (!ingredients) {
      throw new AppError('ingredients not found', 401);
    };

    if (ingredients.avatar) {
      await diskStorage.deleteFile(ingredients.avatar);
    };

    const filename = await diskStorage.saveFile(avatarFileName);
    ingredients.avatar = filename;

    await knex('ingredients').update(ingredients).where({ id: ingredients_id});

    return response.json(ingredients);
  };
};

module.exports = IngredientsAvatarController;