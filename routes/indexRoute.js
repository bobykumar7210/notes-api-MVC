const router = require('express').Router();
const noteRoutes = require('./noteRoutes');
const userRoutes = require('./userRoute');

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Notes API', version: '1.0.0' });
});

router.use('/notes', noteRoutes);
router.use('/users', userRoutes);

module.exports = router;
