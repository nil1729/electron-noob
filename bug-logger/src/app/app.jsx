import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Spinner from 'react-bootstrap/Spinner';

// Components
import Container from 'react-bootstrap/Container';
import LogList from './components/LogList.jsx';
import AddLog from './components/AddLog.jsx';
import Notification from './components/Notification.jsx';

const MainApp = () => {
	const [logs, setLogs] = useState(null);
	const [alert, setAlert] = useState(null);
	const [logFetching, setLogFetching] = useState(true);

	const notify = (alert) => {
		setAlert(alert);
		setTimeout(() => {
			setAlert(null);
		}, 5000);
	};

	useEffect(() => {
		window['bug:logger'].fetchLogs.then((docs) => {
			if (Array.isArray(docs)) {
				setLogFetching(false);
				setLogs(docs);
			} else {
				notify({
					message: 'Something went wrong! Please close the app and relaunch',
					variant: 'warning',
				});
			}
		});
		// eslint-disable-next-line
	}, []);

	const addLogItem = async (log) => {
		let newLogItem = await window['bug:logger'].addLog(log);
		setLogs([newLogItem, ...logs]);
		notify({ message: 'Log added successfully', variant: 'success' });
	};

	const deleteLogItem = async (id) => {
		const result = await window['bug:logger'].removeLog(id);
		if (result.success) {
			setLogs(logs.filter((log) => log.id !== id));
			notify({ message: 'Log removed successfully', variant: 'success' });
		} else {
			notify({
				message: 'Something went wrong! Please try again',
				variant: 'danger',
			});
		}
	};

	return (
		<Container className='mt-5 text-center mb-5'>
			<AddLog notify={notify} addLogItem={addLogItem} />
			{alert ? <Notification message={alert.message} variant={alert.variant} /> : null}
			{logFetching || !logs ? (
				<Spinner animation='border' />
			) : logs && logs.length === 0 ? (
				<h4>No Logs added till now</h4>
			) : (
				<LogList logs={logs} deleteLogItem={deleteLogItem} />
			)}
		</Container>
	);
};

ReactDOM.render(<MainApp />, document.body);
