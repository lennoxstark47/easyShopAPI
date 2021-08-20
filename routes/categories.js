const Category = require('../models/category');
const express = require('express');
const Router = express.Router();

Router.get('/', async (req, res) => {
	const categoryList = await Category.find();

	if (!categoryList) {
		res.status(500).json({ success: false });
	}
	res.send(categoryList);
});

Router.get('/:id', (req, res) => {
	Category.findById(req.params.id)
		.then((result) => {
			if (!result) {
				return res.status(500).json({
					message:
						'The specific category was not found',
				});
			}
			res.status(200).send(result);
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
});

//CAN BE DONE IN THIS WAY ALSO :)
// Router.get('/:id', async (req, res) => {
// 	const category = await Category.findById(
// 		req.params.id
// 	);
// 	if (!category) {
// 		return res.status(500).json({
// 			message: 'The specific category was not found',
// 		});
// 	}
// 	res.status(200).send(category);
// });

Router.put('/:id', (req, res) => {
	const { name, icon, color } = req.body;
	Category.findByIdAndUpdate(
		req.params.id,
		{
			name,
			icon,
			color,
		},
		{
			useFindAndModify: false,
			new: true,
		}
	)
		.then((result) => {
			if (!result) {
				return res
					.status(400)
					.json('The catagory cannot be created');
			}
			res.status(200).send(result);
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
});

//Async PUT

// Router.put('/:id', async (req, res) => {
// 	const { name, icon, color } = req.body;
// 	const updatedCategory =
// 		await Category.findByIdAndUpdate(
// 			req.params.id,
// 			{
// 				name,
// 				icon,
// 				color,
// 			},
// 			{
// 				useFindAndModify: false,
// 				new: true,
// 			}
// 		);
// 	if (!updatedCategory) {
// 		return res
// 			.status(400)
// 			.json('The catagory cannot be created');
// 	}
// 	res.status(200).send(updatedCategory);
// });

Router.post('/', async (req, res) => {
	const { name, icon, color } = req.body;
	const newCategory = new Category({
		name,
		icon,
		color,
	});

	const category = await newCategory.save();
	if (!category) {
		res
			.status(404)
			.json('The category cannot be created');
	}
	res.send(category);
});

Router.delete('/:id', (req, res) => {
	Category.findByIdAndRemove(req.params.id)
		.then((result) => {
			if (result) {
				res.status(200).json({
					success: true,
					message: 'Category is succesfully deleted',
				});
			} else {
				res.status(404).json({
					success: false,
					message: 'Category can not be found',
				});
			}
		})
		.catch((err) => {
			res
				.status(500)
				.json({ success: false, error: err });
		});
});

module.exports = Router;
