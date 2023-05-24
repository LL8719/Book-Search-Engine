const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
	Query: {
		me: async (parent, args, context) => {
			if (context.user) {
				const userData = await User.findOne({ _id: context.user._id })
					.select('-__v -password')
					.populate('savedBooks');

				console.log(userData);

				return userData;
			}
			throw new AuthenticationError('You need to be logged in!');
		},
	},
	Mutation: {
		login: async (parent, { email, password }) => {
			const user = await User.findOne({ email });
			if (!user) {
				throw new AuthenticationError('No user with this email found!');
			}
			const correctPassword = await user.isCorrectPassword(password);

			if (!correctPassword) {
				throw new AuthenticationError('Incorrect password!');
			}
			const token = signToken(user);
			return { token, user };
		},
		addUser: async (parent, { username, email, password }) => {
			const user = await User.create({ username, email, password });
			const token = signToken(user);

			return { token, user };
		},
		saveBook: async (parent, { newBook }, context) => {
			if (context.user) {
				console.log(newBook);

				const userBook = await User.findByIdAndUpdate(
					{ _id: context.user._id },
					{ $push: { savedBooks: newBook } },
					{ new: true, runValidators: true }
				);
				console.log(userBook);
				return userBook;
			}
			throw new AuthenticationError('You need to be logged in!');
		},
		removeBook: async (parent, { bookId }, context) => {
			if (context.user) {
				const updatedBooks = await User.findOneAndUpdate(
					{ _id: context.user._id },
					{ $pull: { savedBooks: { bookId } } },
					{ new: true }
				);

				return updatedBooks;
			}
			throw new AuthenticationError('You need to be logged in!');
		},
	},
};

module.exports = resolvers;
