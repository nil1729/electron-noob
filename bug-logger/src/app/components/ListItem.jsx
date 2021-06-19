import React from 'react';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import moment from 'moment';

function ListItem({ log, deleteLogItem }) {
	const setUpPriority = (level) => {
		switch (Number(level)) {
			case 1:
				return { text: 'Low', variant: 'success' };
			case 2:
				return { text: 'Moderate', variant: 'warning' };
			case 3:
				return { text: 'High', variant: 'danger' };
		}
	};

	return (
		<tr>
			<td>
				{' '}
				<h5>
					<Badge variant={setUpPriority(log.priority).variant}>
						{setUpPriority(log.priority).text}
					</Badge>
				</h5>
			</td>
			<td>{log.text}</td>
			<td>{log.user}</td>
			<td>{moment(log.created).format('MMM Do YYYY, hh:mm:ss A')}</td>
			<td>
				<Button
					variant='danger'
					onClick={() => {
						deleteLogItem(log.id);
					}}
				>
					X
				</Button>
			</td>
		</tr>
	);
}

export default ListItem;
