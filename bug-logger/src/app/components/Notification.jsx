import React from 'react';
import Alert from 'react-bootstrap/Alert';

function Notification({ message, variant }) {
	return (
		<Alert variant={variant} className='mb-4 text-center'>
			{message}
		</Alert>
	);
}

export default Notification;
