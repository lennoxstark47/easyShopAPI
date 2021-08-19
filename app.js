const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
require('dotenv').config();

//middlewares
app.use(morgan('tiny'));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors);

//variable declaration
const port = process.env.PORT || 5000;
const api = process.env.API_URL;
const db = process.env.ATLAS_URI;

//db connection
mongoose
	.connect(db, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() =>
		console.log('mongodb connected.......')
	)
	.catch((err) => console.log(err));

//routes
const productsRouter = require('./routes/products');
const usersRouter = require('./routes/users');
const categoriesRouter = require('./routes/categories');
const ordersRouter = require('./routes/orders');

app.use(`${api}/users`, usersRouter);
app.use(`${api}/products`, productsRouter);
app.use(`${api}/orders`, ordersRouter);
app.use(`${api}/categories`, categoriesRouter);

app.listen(port, () => {
	console.log(`Server is running at port ${port}`);
});
