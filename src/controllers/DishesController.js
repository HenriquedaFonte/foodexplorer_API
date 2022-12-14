const knex = require('../database/knex');
const sqliteConnection = require('../database/sqlite');
const AppError = require('../utils/AppError');
const DiskStorage = require('../providers/DiskStorage');

class DishesController{
  async create(request, response) {
    const { category, title, description, price, ingredients, user_id } = request.body;

    const avatarFileName = request.file.filename;  

    const diskStorage = new DiskStorage();

    const filename = await diskStorage.saveFile(avatarFileName);

    const dish_id = await knex('dishes').insert({
      category,
      title,
      description,
      price,
      avatar: filename,
      user_id
    }); 
    
    if (typeof ingredients === 'string'){
      const {name, avatar} = JSON.parse(ingredients)
      await knex('ingredients').insert({ 
        name,
        avatar,
        dish_id
      });
    } else {
      const ingredientsInsert = ingredients.map(ingredient => {
        const {name, avatar} = JSON.parse(ingredient)
        return {
          name,
          avatar,
          dish_id
        };
      });
      await knex('ingredients').insert(ingredientsInsert)
    };

    response.status(201).json();
  };

  async show(request, response) {
    const { id } = request.params;
    const dish = await knex('dishes').where({id}).first();
    const ingredients = await knex('ingredients').where({dish_id: id}).orderBy('name');

    const database = await sqliteConnection();
    const checkdishExists = await database.get('SELECT * FROM dishes WHERE id = (?)', [id]);

    if (!checkdishExists){
      throw new AppError('Id invalid')
    };

    return response.json({
      ...dish,
      ingredients
    });
  };
  
  async delete(request, response) {
    const { id } = request.params;

    await knex('dishes').where({ id }).delete();
    
    return response.json();
  };
  
  async index(request, response) {
    const { title } = request.query;

    let dishes;    
    
    if (title) { 
      const dishes1 = await knex('dishes')
      .whereLike('title', `%${title}%`)
      .orderBy('category');

      const dishes2 = await knex('ingredients')
      .whereLike('name', `%${title}%`)
      .innerJoin('dishes', 'dishes.id', 'ingredients.dish_id')
      .orderBy('dishes.title');
      
      dishes = dishes1.concat(dishes2)    
    } else {
      dishes = await knex('dishes')
    };

    return response.json( dishes );
  };

  async update(request, response) {
    const { title, category, ingredients, price, description } = request.body;
    const { id } = request.params;
    const avatarFileName = request.file?.filename;

    const diskStorage = new DiskStorage();

    const dish = await knex("dishes").where({ id }).first();

    if (avatarFileName) {
      await diskStorage.deleteFile(dish.avatar);
      const filename = await diskStorage.saveFile(avatarFileName);
      dish.avatar = filename;
    };

    dish.title = title ?? dish.title;
    dish.category = category ?? dish.category;
    dish.price = price ?? dish.price;
    dish.description = description ?? dish.description;

    await knex("dishes").where({ id }).update(dish);

    if (typeof ingredients === 'string'){
      const {name, avatar} = JSON.parse(ingredients)
      await knex("ingredients").where({ dish_id: id }).delete()
      await knex("ingredients").where({ dish_id: id }).insert({ 
        name,
        avatar,
        dish_id : dish.id});
    }else{
      const ingredientsInsert = ingredients.map(ingredient => {
        const {name, avatar} = JSON.parse(ingredient)
        return {
          name,
          avatar,
          dish_id : dish.id
        };
      });
      await knex("ingredients").where({ dish_id: id }).delete()
      await knex("ingredients").where({ dish_id: id }).insert(ingredientsInsert)
    };


    response.status(201).json();
  };
};

module.exports = DishesController;