const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');

router.get('/', authController.getAllUsers);
router.get('/:id', authController.getUserById);
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.delete('/:id', authController.deactivateUser);

module.exports = router;