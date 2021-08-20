const express = require('express');
const Router = express.Router();
const Product = require('../models/product');
const Category = require('../models/category');

const api = process.env.API_URL;

Router.get('/', async (req, res) => {
	const productList = await Product.find()
		.select('name image -_id')
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

module.exports = Router;
