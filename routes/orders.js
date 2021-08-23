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
	const order = await Order.findById(
		req.params.id
	)
		.populate('user', 'name')
		.populate({
			path: 'orderItems',
			populate: {
				path: 'product',
				populate: 'category',
			},
		});

	if (!order) {
		return res
			.status(500)
			.json({ success: false });
	}
	res.send(order);
});

Router.post('/', async (req, res) => {
	const orderItemsIds = Promise.all(
		req.body.orderItems.map(async (orderItem) => {
			let newOrderItem = new OrderItem({
				quantity: orderItem.quantity,
				product: orderItem.product,
			});

			newOrderItem = await newOrderItem.save();

			return newOrderItem._id;
		})
	);
	const orderItemsIdsResolved =
		await orderItemsIds;

	const totalPrices = await Promise.all(
		orderItemsIdsResolved.map(
			async (orderItemId) => {
				const orderItem =
					await OrderItem.findById(
						orderItemId
					).populate('product', 'price');
				const totalPrice =
					orderItem.product.price *
					orderItem.quantity;
				return totalPrice;
			}
		)
	);

	const totalPrice = totalPrices.reduce(
		(a, b) => a + b,
		0
	);

	let order = new Order({
		orderItems: orderItemsIdsResolved,
		shippingAddress1: req.body.shippingAddress1,
		shippingAddress2: req.body.shippingAddress2,
		city: req.body.city,
		zip: req.body.zip,
		country: req.body.country,
		phone: req.body.phone,
		status: req.body.status,
		totalPrice: totalPrice,
		user: req.body.user,
	});
	order = await order.save();

	if (!order)
		return res
			.status(400)
			.send('the order cannot be created!');

	res.send(order);
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
	Order.findByIdAndRemove(req.params.id, {
		useFindAndModify: false,
	})
		.then(async (order) => {
			if (order) {
				await order.orderItems.map(
					async (orderItem) => {
						await OrderItem.findByIdAndRemove(
							orderItem,
							{
								useFindAndModify: false,
							}
						);
					}
				);
				res.status(400).json({
					success: true,
					message: `${order._id} is deleted successfully!`,
				});
			} else {
				res
					.status(400)
					.send('Order cant be deleted');
			}
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
});

module.exports = Router;
