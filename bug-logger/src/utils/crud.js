const Log = require('./LogModel');

const fetchLogs = async () => {
	try {
		const logs = await Log.aggregate([
			{ $match: { _id: { $exists: true } } },
			{
				$project: {
					id: {
						$toString: '$_id',
					},
					text: 1,
					priority: 1,
					created: '$createdAt',
					user: 1,
				},
			},
		]);
		return logs;
	} catch (e) {
		return { success: false };
	}
};

const addLogItem = async (logItem) => {
	try {
		const newLogItem = await Log.create(logItem);
		return { ...logItem, id: newLogItem.id, created: newLogItem.createdAt };
	} catch (e) {
		return { success: false };
	}
};

const deleteLogItem = async (id) => {
	try {
		await Log.deleteOne({ _id: id });
		return { success: true };
	} catch (e) {
		return { success: false };
	}
};

module.exports = { fetchLogs, addLogItem, deleteLogItem };
