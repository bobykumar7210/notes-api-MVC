const UserController = require('../controllers/userController');   
const router = require('express').Router();
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validationMiddleware = require('../middlewares/validation/validationMiddleware');
const { ROLES } = require('../utils/constants');
const { uploadProfileImage } = require('../middlewares/uploadMiddleware');
const { registerValidation, loginValidation } = require('../validators/user.validator');
const { loginLimiter } = require('../middlewares/rateLimiter');

// POST /users/register - Register a new user
router.post('/register', registerValidation, validationMiddleware, UserController.registerUser);

// POST /users/login - Login a user
router.post('/login', loginLimiter, loginValidation, validationMiddleware, UserController.loginUser);

router.get('/profile', authMiddleware, UserController.getUserProfile);
router.post('/profile/image', authMiddleware, uploadProfileImage, UserController.uploadProfileImage);
router.get('/', authMiddleware, roleMiddleware(ROLES.ADMIN), UserController.getAllUsers);
router.delete('/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), UserController.deleteUser);

module.exports = router;