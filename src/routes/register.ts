import bcrypt from "bcrypt";
import joi from "joi";
import express from "express";
import User from "../models/user";
import genAuthToken from "../utils/genAuthToken";

const registerRouter = express.Router();

/**Register Account Functionality */
registerRouter.post("/", async (req: any, res: any) => {
    /**
     * Creating a schema
     */
    const schema = joi.object({
        name: joi.string().min(3).max(30).required(),
        email: joi.string().min(3).max(200).email().required(),
        password: joi.string().min(6).max(200).required(),
    });

    /**
     * Validating the schema
     */
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    /**
     * Check to see if user already exists if they do throw error
     * else create new user
     */
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send(`User already exists..`);

    // Create new user instance
    user = new User({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    });

    /**
     * hashing the password
     */
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    try {
        // Save user to database
        user = await user.save();

        // Generate authentication token
        const token = genAuthToken(user);
        res.send(token);
    } catch (err) {
        // Handle any database saving errors
        console.error("Error saving user:", err);
        res.status(500).send("Error registering user. Please try again later.");
    }
});

export default registerRouter;
