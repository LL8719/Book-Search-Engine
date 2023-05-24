const mongoose = require('mongoose');

mongoose
	.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/googlebooks', {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useCreateIndex: true,
		useFindAndModify: false,
	})
	.catch((err) => {
		console.error(err);
	});
module.exports = mongoose.connection;
