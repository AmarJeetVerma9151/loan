const express = require('express');
const router = express.Router();
const  authController = require('../controllers/auth');



router.post('/register', authController.register);
router.post('/login', authController.login);

router.use(authController.authenticateToken)
router.put('/profile',authController.updateUser);
router.get('/user',authController.getUser);





module.exports = router