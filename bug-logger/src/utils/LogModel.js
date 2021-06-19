const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
	{
		user: {
			type: String,
			required: [true, 'Please add a user name'],
		},
		text: {
			type: String,
			required: [true, 'Please add a log subject'],
		},
		priority: {
			type: Number,
			required: [true, 'Please add a priority level'],
			enum: [1, 2, 3],
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Log', logSchema);
