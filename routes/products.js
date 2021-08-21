const express = require('express');
const Router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');
const mongoose = require('mongoose');
const { count } = require('../models/product');

// const api = process.env.API_URL;

Router.get('/', async (req, res) => {
	const productList = await Product.find()
		.select('name image isFeatured')
		.populate('category');
	if (!productList) {
		res.status(500).json({ success: false });
	}
	res.send(productList);
});

Router.get('/:id', async (req, res) => {
	const productList = await Product.findById(
		req.params.id
	).populate('category');
	if (!productList) {
		return res.status(500).json({ success: false });
	}
	res.send(productList);
});

Router.post('/', (req, res) => {
	Category.findById(req.body.category).then(
		(result) => {
			if (!result) {
				return res
					.status(400)
					.send('Invalid Category');
			}
		}
	);
	const {
		name,
		description,
		richDescription,
		image,
		images,
		brand,
		price,
		category,
		countInStock,
		rating,
		numReviews,
		isFeatured,
		dateCreated,
	} = req.body;
	const newProduct = new Product({
		name,
		description,
		richDescription,
		image,
		images,
		brand,
		price,
		category,
		countInStock,
		rating,
		numReviews,
		isFeatured,
		dateCreated,
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

Router.put('/:id', async (req, res) => {
	if (!mongoose.isValidObjectId(req.params.id)) {
		return res.status(400).json('wrong product id');
	}
	const findCategory = await Category.find();
	if (!findCategory) {
		return res.status(400).send('Invalid Category');
	}

	const {
		name,
		description,
		richDescription,
		image,
		images,
		brand,
		price,
		category,
		countInStock,
		rating,
		numReviews,
		isFeatured,
		dateCreated,
	} = req.body;

	const updatedProduct =
		await Product.findByIdAndUpdate(
			req.params.id,
			{
				name,
				description,
				richDescription,
				image,
				images,
				brand,
				price,
				category,
				countInStock,
				rating,
				numReviews,
				isFeatured,
				dateCreated,
			},
			{
				useFindAndModify: false,
				new: true,
			}
		);
	if (!updatedProduct) {
		return res
			.status(400)
			.send('Product cannot be created');
	}
	res.status(200).send(updatedProduct);
});
Router.delete('/:id', (req, res) => {
	Product.findByIdAndRemove(req.params.id, {
		useFindAndModify: false,
	})
		.then((result) => {
			if (!result) {
				return res.status(400).json({
					success: false,
					message: 'cannot delete item',
				});
			}
			res.status(200).json({
				success: true,
				message: 'deleted item suucessfully',
			});
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
});

Router.get('/get/count', async (req, res) => {
	const productCount =
		await Product.countDocuments((count) => count);
	if (!productCount) {
		return res.status(500).json({ success: false });
	}
	res.json({ productCount: productCount });
});

Router.get('/get/featured/:count', (req, res) => {
	const count = req.params.count
		? req.params.count
		: 0;
	Product.find({ isFeatured: true })
		.limit(+count)

		.then((products) => {
			if (!products) {
				res.status(400).json({ success: false });
			}
			res.send(products);
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
});

Router.get('/', async (req, res) => {
	let filter = {};
	if (req.query.categories) {
		filter = {
			category: req.query.catagories.split(','),
		};
	}

	const filteredProducts = await Product.find(
		filter
	).populate('category');

	if (!filteredProducts) {
		return res.status(400).json({ success: false });
	}
	res.send(filteredProducts);
});

module.exports = Router;
