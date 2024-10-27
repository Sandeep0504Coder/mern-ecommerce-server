import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { allCoupons, applyDiscount, createCoupon, createPaymentIntent, deleteCoupon, getCouponDetails, updateCoupon } from "../controllers/paymentController.js";

const app = express.Router();

//route - api/v1/payment/create
app.post( "/create", createPaymentIntent );

//route - api/v1/payment/discount
app.get( "/discount", applyDiscount );

//route - api/v1/payment/coupon/new
app.post( "/coupon/new", adminOnly, createCoupon );

//route - api/v1/payment/coupon/all
app.get( "/coupon/all", adminOnly, allCoupons );

//route - api/v1/payment/coupon/:id
app.route( "/coupon/:id" ).get( adminOnly, getCouponDetails ).delete( adminOnly, deleteCoupon ).put( adminOnly, updateCoupon );

export default app;