const Order = require('../models/order');
const OrderItem = require('../models/order-item');
const express = require('express');
const Router = express.Router();

Router.get(`/`, async (req, res) => {
	const orderList = await Order.find()
		.populate('user', 'name')
		.populate({
			path: 'orderItems',
			populate: {
				path: 'product',
				populate: 'category',
			},
		});

	if (!orderList) {
		res.status(500).json({ success: false });
	}
	res.send(orderList);
});

Router.get(`/:id`, async (req, res) => {
	const order = await Order.findById(req.params.id)
		.populate('user', 'name')
		.populate({
			path: 'orderItems',
			populate: {
				path: 'product',
				populate: 'category',
			},
		});

	if (!order) {
		return res.status(500).json({ success: false });
	}
	res.send(order);
});

Router.post('/', (req, res) => {
	const orderItemsIds = req.body.orderItems.map(
		(item) => {
			let newOrderItem = new OrderItem({
				quantity: item.quantity,
				product: item.product,
			});
			newOrderItem.save();
			return newOrderItem._id;
		}
	);

	const {
		shippingAddress1,
		shippingAddress2,
		city,
		zip,
		country,
		phone,
		status,
		totalPrice,
		user,
		dateOrdered,
	} = req.body;
	const newOrder = new Order({
		orderItems: orderItemsIds,
		shippingAddress1,
		shippingAddress2,
		city,
		zip,
		country,
		phone,
		status,
		totalPrice,
		user,
		dateOrdered,
	});
	newOrder.save().then((order) => {
		if (!order) {
			res.status(400).json({
				success: false,
				message: 'Error creating an order',
			});
		}
		res.status(200).send(order);
	});
});

Router.put('/:id', (req, res) => {
	Order.findByIdAndUpdate(
		req.params.id,
		{
			status: req.body.status,
		},
		{ new: true }
	)
		.then((order) => {
			if (!order) {
				res.status(400).json({
					success: false,
					message: 'Order can not be updated',
				});
			}
			res.send(order);
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
});

Router.delete('/:id', (req, res) => {
	Order.findByIdAndRemove(req.params.id)
		.then(async (order) => {
			if (order) {
				await order.orderItems.map(
					async (orderItem) => {
						await OrderItem.findByIdAndRemove(
							orderItem
						);
					}
				);
				res.status(400).json({
					success: true,
					message: `${order._id} is deleted successfully!`,
				});
			} else {
				res.status(400).send('Order cant be deleted');
			}
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
});

module.exports = Router;
