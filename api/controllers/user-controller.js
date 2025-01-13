import User from "../models/user-model.js";
import { errorHandler } from "../utils/error.js";
import bcryptjs from 'bcryptjs';

export const test = (req, res) => {
    res.send("hello world");
};

export const updateUser = async (req, res, next) => {
    if (req.user.id !== req.params.id) 
        return next(errorHandler(401, 'You can only update your own profile'));

    try {
        // If password is provided, hash it
        if (req.body.password) {
            req.body.password = bcryptjs.hashSync(req.body.password, 10);
        }

        // Update the user and return the updated document
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password,
                    avatar: req.body.avatar,
                },
            },
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return next(errorHandler(404, 'User not found'));
        }

        // Exclude password from response
        const { password, ...rest } = updatedUser._doc;
        res.status(200).json(rest);
    } catch (error) {
        next(error);
    }
};
