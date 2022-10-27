const { Router } = require('express');
const multer = require('multer');
const uploadConfig = require('../configs/upload');

const IngredientsAvatarController = require('../controllers/IngredientsAvatarController');


const ingredientsRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const ingredientsAvatarController = new IngredientsAvatarController();

ingredientsRoutes.patch('/:ingredients_id', upload.single('avatar'), ingredientsAvatarController.update);


module.exports = ingredientsRoutes;