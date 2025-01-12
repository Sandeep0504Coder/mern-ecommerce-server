import express from "express";
import { deleteUser, getAllUsers, getUser, newUser } from "../controllers/userController.js";
import { adminOnly } from "../middlewares/auth.js";
import { deleteAddress, getAddress, getUserAddresses, newAddress, updateAddress } from "../controllers/addressController.js";

const app = express.Router();

//route - api/v1/user/new
app.post( "/new", newUser );

//route - api/v1/user/all
app.get( "/all", adminOnly, getAllUsers );

//route - api/v1/user/dynamicID
app.route(  "/:id" ).get( getUser ).delete( adminOnly, deleteUser );

//route - api/v1/user/address/new
app.route(  "/address/new" ).post( newAddress );

//route - api/v1/user/address/my
app.route(  "/address/my" ).get( getUserAddresses );

//route - api/v1/user/address/:id
app.route(  "/address/:id" ).get( getAddress ).put( updateAddress ).delete( deleteAddress );

export default app;