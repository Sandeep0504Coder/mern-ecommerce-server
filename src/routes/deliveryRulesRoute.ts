import express from "express";
import { createDeliveryRule, getDeliveryRuleDetails, getDeliveryRules, updateDeliveryRule, deleteDeliveryRule } from "../controllers/deliveryRulesController.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

//route - api/v1/deliveryRule/new
app.post( "/new", adminOnly, createDeliveryRule );

//route - api/v1/deliveryRule/all
app.get( "/all", adminOnly, getDeliveryRules );

//route - api/v1/deliveryRule/dynamicID
app.route(  "/:id" ).get( adminOnly, getDeliveryRuleDetails ).put( adminOnly, updateDeliveryRule ).delete( adminOnly, deleteDeliveryRule );

export default app;