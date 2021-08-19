const express = require('express');
const Router = express.Router();
const Product = require('../models/product');

const api = process.env.API_URL;

Router.get('/', async (req, res) => {
	const productList = await Product.find();
	if (!productList) {
		res.status(500).json({ success: false });
	}
	res.send(productList);
});

Router.post('/', (req, res) => {
	const { name, image, countInStock } = req.body;
	const newProduct = new Product({
		name,
		image,
		countInStock,
	});

	newProduct
		.save()
		.then((product) => {
			res.status(201).json(product);
		})
		.catch((err) => {
			res.status(500).json({
				erorr: err,
				success: false,
			});
		});
});

module.exports = Router;
