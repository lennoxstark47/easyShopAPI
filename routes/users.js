const express = require('express');
const Router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');

Router.get('/', async (req, res) => {
	const userList = await User.find().select(
		'-passwordHash'
	);
	if (!userList) {
		res.status(500).json({ success: false });
	}
	res.send(userList);
});

Router.get('/:id', (req, res) => {
	User.findById(req.params.id)
		.select('-passwordHash')
		.then((user) => {
			if (!user) {
				return res.status(404).json({
					success: false,
					message: 'User not found',
				});
			}
			res.send(user);
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
});

Router.post('/', (req, res) => {
	const {
		name,
		email,
		// passwordHash,
		phone,
		isAdmin,
		street,
		apartment,
		zip,
		city,
		country,
	} = req.body;
	const newUser = new User({
		name,
		email,
		passwordHash: bcrypt.hashSync(
			req.body.password,
			10
		),
		phone,
		isAdmin,
		street,
		apartment,
		zip,
		city,
		country,
	});
	newUser
		.save()
		.then((user) => {
			if (!user) {
				res.status(500).json({
					success: false,
					message: 'error creating a user',
				});
			}
			res.send(user);
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
});

module.exports = Router;
