const express = require('express');
const Router = express.Router();
const User = require('../models/user');

Router.get('/', async (req, res) => {
	const userList = await User.find();
	if (!userList) {
		res.status(500).json({ success: false });
	}
	res.send(userList);
});

module.exports = Router;
