import bcrypt from "bcrypt";
import joi from "joi";
import express from "express";
import User from "../models/user";
import genAuthToken from "../utils/genAuthToken";

const loginRouter = express.Router();

loginRouter.post("/", async (req: any, res: any) => {
    const schema = joi.object({
        email: joi.string().min(3).max(200).required().email(),
        password: joi.string().min(6).max(200).required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user:any = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send(`Invalid email`);

    const isValidPassword: boolean = await bcrypt.compare(req.body.password, user.password);
    if (!isValidPassword) return res.status(400).send(`Invalid password`);
    
    const token = genAuthToken(user);
    return res.send(token); // Ensure you return after sending the response
});


export default loginRouter;
