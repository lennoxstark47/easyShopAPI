const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const User = require('./models/user');
const bodyParser = require('body-parser');

const app = express();
require('dotenv').config();
app.use(morgan('tiny'));
app.use(express.json());
app.use(bodyParser.json());

const port = process.env.PORT || 5000;
const api = process.env.API_URL;
const db = process.env.ATLAS_URI;
mongoose
	.connect(db, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then((response) =>
		console.log('mongodb connected.......')
	)
	.catch((err) => console.log(err));

app.get('/', (req, res) => {
	// res.json('You are in root route');
	User.find()
		.then((data) => {
			res.json(data);
		})
		.catch((err) => res.json(err));
});

app.get(`${api}/products`, (req, res) => {
	res.json('Here are ur products');
});

//testing
app.post('/postuser', (req, res) => {
	const name = req.body.name;
	const newUser = new User({ name });

	newUser
		.save()
		.then((response) => {
			res.json(response);
		})
		.catch((err) => res.json(err));
});

app.listen(port, () => {
	console.log(
		`Server is running at port ${port}`
	);
});
