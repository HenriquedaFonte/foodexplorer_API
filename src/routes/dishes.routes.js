const { Router } = require('express');
const multer = require('multer');
const uploadConfig = require('../configs/upload');

const DishesController = require('../controllers/DishesController');

const ensureAuthenticated = require('../middlewares/ensureAuthenticated');

const dishesRoutes = Router();
const upload = multer(uploadConfig.MULTER);

const dishesController = new DishesController();

dishesRoutes.use(ensureAuthenticated);

dishesRoutes.post('/', upload.single('avatar'), dishesController.create);
dishesRoutes.put('/:id', upload.single('avatar'), dishesController.update);
dishesRoutes.get('/:id', dishesController.show);
dishesRoutes.delete('/:id', dishesController.delete);
dishesRoutes.get('/', dishesController.index);

module.exports = dishesRoutes;