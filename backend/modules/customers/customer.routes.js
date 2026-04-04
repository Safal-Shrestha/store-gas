const express = require('express');
const router = express.Router();
const customerController = require('./customer.controller');

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);

module.exports = router;