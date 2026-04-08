const express = require('express');
const router = express.Router();
const dealerController = require('./dealer.controller');

router.get('/', dealerController.getAllDealers);
router.get('/:id', dealerController.getDealerById);
router.post('/', dealerController.createDealer);
router.put("/:id", dealerController.updateDealer);
router.delete("/:id", dealerController.deactivateDealer);

module.exports = router;