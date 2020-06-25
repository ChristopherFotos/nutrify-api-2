const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const checkAuth = require('../middlewear/check-auth.js')
const Order = require('../models/order.js');
const Product = require('../models/product.js')

const OrdersController = require('../controllers/orders');

router.get('/', checkAuth, OrdersController.orders_get_all)
router.post('/', checkAuth, OrdersController.orders_create_order)
router.get('/:orderId', checkAuth, OrdersController.orders_get_by_id)
router.delete('/:orderId', checkAuth, OrdersController.orders_delete)
router.patch('/:orderId', checkAuth, OrdersController.orders_patch)


module.exports = router;