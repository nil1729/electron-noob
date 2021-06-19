import React, { useState } from 'react';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

function AddLog({ notify, addLogItem }) {
	const [log, setLog] = useState({
		text: '',
		user: '',
		priority: 0,
	});

	const setInput = (e) => {
		setLog({
			...log,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (log.text.trim().length === 0 || log.user.trim().length === 0 || log.priority === 0) {
			notify({ message: 'Please fill all the fields', variant: 'danger' });
			return;
		}

		addLogItem(log);
		setLog({
			text: '',
			user: '',
			priority: 0,
		});
	};

	return (
		<Card className='mb-4 p-1'>
			<Card.Body>
				<Form onSubmit={handleSubmit}>
					<Form.Group className='mb-3' controlId='logText'>
						<Form.Control
							name='text'
							placeholder='Log'
							type='text'
							onChange={setInput}
							value={log.text}
						/>
					</Form.Group>

					<Row>
						<Form.Group as={Col} controlId='user'>
							<Form.Control
								name='user'
								type='text'
								placeholder='User'
								onChange={setInput}
								value={log.user}
							/>
						</Form.Group>

						<Form.Group as={Col} controlId='priority'>
							<Form.Control
								name='priority'
								as='select'
								custom
								onChange={setInput}
								value={log.priority}
							>
								<option disabled value='0'>
									Select Priority
								</option>
								<option value='1'>Low</option>
								<option value='2'>Moderate</option>
								<option value='3'>High</option>
							</Form.Control>
						</Form.Group>
					</Row>
					<Button variant='secondary' type='submit' block>
						Add Log
					</Button>
				</Form>
			</Card.Body>
		</Card>
	);
}

export default AddLog;
