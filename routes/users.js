const express = require('express');
const Router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

Router.post('/login', (req, res) => {
	const secret = process.env.secret;
	User.findOne({ email: req.body.email })
		.then((user) => {
			if (!user) {
				return res
					.status(400)
					.send('User not found');
			}
			if (
				user &&
				bcrypt.compareSync(
					req.body.password,
					user.passwordHash
				)
			) {
				const token = jwt.sign(
					{
						userId: user.id,
						isAdmin: user.isAdmin,
					},
					secret,
					{ expiresIn: '1h' }
				);
				return res
					.status(200)
					.send({
						user: user.email,
						token: token,
					});
			}
			res.status(400).send('Password is wrong');
		})
		.catch((err) => {
			res.status(500).json({ error: err });
		});
});

Router.post('/register', (req, res) => {
	const {
		name,
		email,
		password,
		phone,

		street,
		apartment,
		zip,
		city,
		country,
	} = req.body;
	const newUser = new User({
		name,
		email,
		passwordHash: bcrypt.hashSync(password, 10),
		phone,

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

Router.delete('/:id', (req, res) => {
	User.findByIdAndRemove(req.params.id).then(
		(user) => {
			if (!user) {
				return res
					.status(400)
					.send('User not found');
			}
			res
				.status(200)
				.send(
					`The user ${user.name} deleted successfully`
				);
		}
	);
});

module.exports = Router;
