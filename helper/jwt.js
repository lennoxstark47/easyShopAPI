const ewt = require('express-jwt');

const authJwt = () => {
	const secret = process.env.secret;
	const api = process.env.API_URL;
	return ewt({
		secret,
		algorithms: ['HS256'],
		isRevoked: isRevoked,
	}).unless({
		path: [
			{
				url: '/api/products',
				methods: ['GET', 'OPTIONS'],
			},
			'/api/users/login',
			'/api/users/register',
		],
	});
};

const isRevoked = async (req, payload, done) => {
	if (!payload.isAdmin) {
		done(null, true);
	}
	done();
};

module.exports = authJwt;
