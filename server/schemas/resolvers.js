const { User, Book } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
	Query: {
		me: async (parent, args, context) => {
			if (context.user) {
				return User.findOne({ _id: context.user._id }).populate('savedBooks');
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
		saveBook: async (
			parent,
			{ authors, description, title, bookId, image, link },
			context
		) => {
			if (context.user) {
				const book = await Book.create({
					authors,
					description,
					title,
					bookId,
					image,
					link,
				});
				await User.findOneAndUpdate(
					{ _id: context.user._id },
					{ $addToSet: { savedBooks: book._id } },
					{ new: true }
				).populate('savedBooks');
				return User.findOne({ _id: context.user._id }).populate('savedBooks');
			}
			throw new AuthenticationError('You need to be logged in!');
		},
		removeBook: async (parent, { bookId }, context) => {
			if (context.user) {
				await User.findOneAndUpdate(
					{ _id: context.user._id },
					{ $pull: { savedBooks: bookId } },
					{ new: true }
				).populate('savedBooks');
				return User.findOne({ _id: context.user._id }).populate('savedBooks');
			}
			throw new AuthenticationError('You need to be logged in!');
		},
	},
};

module.exports = resolvers;
