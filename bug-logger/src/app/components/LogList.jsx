import React from 'react';
import Table from 'react-bootstrap/Table';
import ListItem from './ListItem.jsx';

function LogList({ logs, deleteLogItem }) {
	return (
		<Table bordered hover>
			<thead>
				<tr>
					<th>Priority</th>
					<th>Log Text</th>
					<th>User</th>
					<th>Created</th>
					<th>Action</th>
				</tr>
			</thead>
			<tbody>
				{logs.map((log) => (
					<ListItem key={log.id} log={log} deleteLogItem={deleteLogItem} />
				))}
			</tbody>
		</Table>
	);
}

export default LogList;
