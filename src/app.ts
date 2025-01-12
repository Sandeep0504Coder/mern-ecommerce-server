import express from "express";
import { connectDB } from "./utils/features.js";
import { errorMiddleware } from "./middlewares/error.js";
import NodeCache from "node-cache";
import { config } from "dotenv";
import morgan from "morgan";
import Stripe from "stripe";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";

//Importing Routes
import userRoute from "./routes/userRoute.js"
import productRoute from "./routes/productRoute.js"
import orderRoute from "./routes/orderRoute.js"
import paymentRoute from "./routes/paymentRoute.js"
import dashboardRoute from "./routes/statsRoute.js"
import deliveryRulesRoute from "./routes/deliveryRulesRoute.js"
import systemSettingRoute from "./routes/systemSettingRoute.js"


config( { path: "./.env" } );

const port = process.env.PORT || 3000;
const mongoURI = process.env.MONGO_URI || "";
const stripeKey = process.env.STRIPE_KEY || "";

connectDB( mongoURI );

cloudinary.config( {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET,
} )

export const stripe = new Stripe( stripeKey );
export const myCache = new NodeCache({});

const app = express();

app.use( express.json() );
app.use( morgan( "dev" ) );
app.use( cors( {} ) );

app.get( "/", (req, res)=>{
    res.send( `Api working with /api/v1` );
} )

//Using Routes
app.use( "/api/v1/user", userRoute );
app.use( "/api/v1/product", productRoute );
app.use( "/api/v1/order", orderRoute );
app.use( "/api/v1/payment", paymentRoute );
app.use( "/api/v1/dashboard", dashboardRoute );
app.use( "/api/v1/deliveryRule", deliveryRulesRoute );
app.use( "/api/v1/systemSetting", systemSettingRoute );

app.use( "/uploads", express.static( "uploads" ) );
app.use( errorMiddleware );

app.listen( port, () => {
    console.log(`Server is working on http://localhost:${port}`);
} );