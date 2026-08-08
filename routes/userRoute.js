const UserController = require('../controllers/userController');   
const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validationMiddleware = require('../middlewares/validation/validationMiddleware');
const { ROLES } = require('../utils/constants');
const { registerValidation, loginValidation } = require('../validators/user.validator');

// POST /users/register - Register a new user
router.post('/register', registerValidation, validationMiddleware, UserController.registerUser);

// POST /users/login - Login a user
router.post('/login', loginValidation, validationMiddleware, UserController.loginUser);

router.get('/profile', authMiddleware, UserController.getUserProfile);
router.get('/', authMiddleware, roleMiddleware(ROLES.ADMIN), UserController.getAllUsers);
router.delete('/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), UserController.deleteUser);

module.exports = router;