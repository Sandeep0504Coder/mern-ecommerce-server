import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Coupon } from "../models/couponModel.js";
import ErrorHandler from "../utils/utility-class.js";

export const createPaymentIntent = TryCatch( async( req, res, next ) => {
    const { amount } = req.body;

    if( !amount ) return next( new ErrorHandler( "Please enter amount", 400 ) );

    const paymentIntent = await stripe.paymentIntents.create( {
        amount: Number( amount ) * 100,
        currency: "inr"
    } );

    return res.status(201).json( {
        success: true,
        clientSecret: paymentIntent.client_secret,
    } );
} );

export const createCoupon = TryCatch( async( req, res, next ) => {
    const { coupon, amount } = req.body;

    if( !coupon || !amount ) return next( new ErrorHandler( "Please enter both coupon and amount", 400 ) );

    await Coupon.create( { code: coupon, amount } );

    return res.status(201).json( {
        success: true,
        message: `Coupon ${coupon} created successfully`,
    } );
} );

export const updateCoupon = TryCatch( async( req, res, next ) => {
    const { id } = req.params;
    const { amount } = req.body;

    const coupon = await Coupon.findById( id );

    if( !coupon ) return next( new ErrorHandler( "Coupon not found", 404 ) );

    if( amount ) coupon.amount = amount;

    await coupon.save( );

    return res.status(200).json( {
        success: true,
        message: `Coupon ${coupon.code} updated successfully`,
    } );
} );

export const getCouponDetails = TryCatch( async( req, res, next ) => {
    const { id } = req.params;

    const coupon = await Coupon.findById( id );
    
    if( !coupon ) return next( new ErrorHandler( "Coupon not found", 404 ) );

    return res.status( 200 ).json(
        {
            success: true,
            coupon,
        }
    );
} );

export const applyDiscount = TryCatch( async( req, res, next ) => {
    const { coupon } = req.query;

    if( !coupon ) return next( new ErrorHandler( "Please enter coupon code", 400 ) );

    const discount = await Coupon.findOne( { code: coupon } );

    if( !discount ) return next( new ErrorHandler( "Invalid coupon code", 400 ) );

    return res.status( 200 ).json( {
        success: true,
        discount: discount.amount,
    } );
} );

export const allCoupons = TryCatch( async( req, res, next ) => {
    const coupons = await Coupon.find( {} );

    return res.status( 200 ).json( {
        success: true,
        coupons,
    } );
} );

export const deleteCoupon = TryCatch( async( req, res, next ) => {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete( id );

    if( !coupon ) return next( new ErrorHandler( "Invalid coupon Id", 400 ) );

    return res.status( 200 ).json( {
        success: true,
        message: `Coupon ${coupon.code} deleted successfully.`,
    } );
} );