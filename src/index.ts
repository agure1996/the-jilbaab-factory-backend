import Express from "express";
import cors from "cors";
import products from "./data/products.js";
import mongoose from "mongoose";
import * as dotenv  from "dotenv";
import register from "./routes/register.js";
import login from "./routes/login.js";
import router from "./routes/stripe.js";

// Manually load environment variables from .env file
dotenv.config();

// assign express to variable
const app = Express();

// Creating the middleware function (the json) - middleware is used to simply expand functionality of the application
app.use(Express.json());
//Cors allow us to connect nodejs api to react application
app.use(cors());

//setup the register and login endpoints
app.use(`/api/register`, register);
app.use(`/api/login`, login);
app.use("/api/stripe", router); // Use the router for /api/stripe routes

//handle get request for the "/" path from our react app in this case
app.get("/", (req:any, res:any) => {
    res.send("Welcome to Gure Shop API");
});

app.get("/products",  (req:any, res:any) => {
    res.send(products);
});
const port = process.env.PORT;
app.listen(port, () => console.log(`Server running on Port ${port}`));

const dbURI: any = process.env.URI;
//options are optional dont even need them

mongoose
    .connect(`mongodb+srv://${dbURI}`)
    .then(() => console.log(`MongoDB connection Successful`))
    .catch((err: Error) =>
        console.error(`MongoDB Connection Failed : ${err.message}`)
    );
