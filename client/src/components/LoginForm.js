// see SignupForm.js for comments
import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

import { useMutation } from '@apollo/client'; // Import the useMutation hook
import { LOGIN_USER } from '../utils/mutations'; // Import the LOGIN_USER mutation
import Auth from '../utils/auth';

const LoginForm = () => {
	const [userFormData, setUserFormData] = useState({ email: '', password: '' });
	const [validated] = useState(false);
	const [showAlert, setShowAlert] = useState(false);

	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setUserFormData({ ...userFormData, [name]: value });
	};

	const [loginUser, { error }] = useMutation(LOGIN_USER); // Use the LOGIN_USER mutation

	const handleFormSubmit = async (event) => {
		event.preventDefault();

		// check if form has everything (as per react-bootstrap docs)
		const form = event.currentTarget;
		if (form.checkValidity() === false) {
			event.preventDefault();
			event.stopPropagation();
		}

		try {
			const { data } = await loginUser({ variables: userFormData }); // Use the loginUser mutation

			// Check the response from the mutation
			if (data.loginUser.token) {
				Auth.login(data.loginUser.token);
			} else {
				throw new Error('something went wrong!');
			}
		} catch (err) {
			console.error(err);
			setShowAlert(true);
		}

		setUserFormData({
			username: '',
			email: '',
			password: '',
		});
	};

	return (
		<>
			<Form noValidate validated={validated} onSubmit={handleFormSubmit}>
				<Alert
					dismissible
					onClose={() => setShowAlert(false)}
					show={showAlert}
					variant="danger">
					Something went wrong with your login credentials!
				</Alert>
				<Form.Group className="mb-3">
					<Form.Label htmlFor="email">Email</Form.Label>
					<Form.Control
						type="text"
						placeholder="Your email"
						name="email"
						onChange={handleInputChange}
						value={userFormData.email}
						required
					/>
					<Form.Control.Feedback type="invalid">
						Email is required!
					</Form.Control.Feedback>
				</Form.Group>

				<Form.Group className="mb-3">
					<Form.Label htmlFor="password">Password</Form.Label>
					<Form.Control
						type="password"
						placeholder="Your password"
						name="password"
						onChange={handleInputChange}
						value={userFormData.password}
						required
					/>
					<Form.Control.Feedback type="invalid">
						Password is required!
					</Form.Control.Feedback>
				</Form.Group>
				<Button
					disabled={!(userFormData.email && userFormData.password)}
					type="submit"
					variant="success">
					Submit
				</Button>
			</Form>
		</>
	);
};

export default LoginForm;
