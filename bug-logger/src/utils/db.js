const MONGO_URI =
	'mongodb+srv://nilanjan-admin:nilanjan@contact-keeper.2zhy3.mongodb.net/electron-react-app?retryWrites=true&w=majority';
const mongoose = require('mongoose');

const connectDB = async () => {
	try {
		await mongoose.connect(MONGO_URI, {
			useCreateIndex: true,
			useUnifiedTopology: true,
			useFindAndModify: true,
			useNewUrlParser: true,
		});
		console.log('Database connection established!');
	} catch (e) {
		console.log(e);
	}
};

module.exports = connectDB;
