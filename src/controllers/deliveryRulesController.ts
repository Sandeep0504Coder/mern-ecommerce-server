import { NextFunction, Request, Response } from "express";
import { CreateDeliveryRuleRequestBody } from "../types/types.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { DeliveryRule } from "../models/deliveryRuleModel.js";


export const createDeliveryRule = TryCatch(
    async (
        req: Request<{}, {}, CreateDeliveryRuleRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
        const { ruleName, subtotalMinRange, subtotalMaxRange, amount, percentage, setDeliveryFeeTo } = req.body;

        if( !ruleName || !subtotalMinRange || !amount || !percentage || !setDeliveryFeeTo ){
            return next( new ErrorHandler( "Please add all fields", 400 ) );
        }

        await DeliveryRule.create({
            ruleName,
            subtotalMinRange,
            subtotalMaxRange,
            amount,
            percentage,
            setDeliveryFeeTo
        } );

        return res.status( 201 ).json( {
            success: true,
            message: "Delivery Rule created successfully.",
        } );
    }
);

export const getDeliveryRules = TryCatch(
    async( req, res, next ) => {
        const deliveryRules = await DeliveryRule.find({ }).select( "-updatedAt -createdAt -__v" );

        return res.status(200).json({
            success: true,
            deliveryRules,
        })
    }
);

export const getDeliveryRuleDetails = TryCatch(
    async( req, res, next ) => {
        const id = req.params.id;
        const deliveryRule = await DeliveryRule.findById( id );

        if( !deliveryRule ){
            return next( new ErrorHandler( "Invalid Id", 400 ) );
        }

        return res.status(200).json({
            success: true,
            deliveryRule,
        })
    }
);

export const deleteDeliveryRule = TryCatch(
    async( req, res, next ) => {
        const deliveryRule = await DeliveryRule.findById( req.params.id );

        if( !deliveryRule ) return next( new ErrorHandler( "Delivery Rule not found", 404 ) );
        
        await deliveryRule.deleteOne( );

        return res.status(200).json({
            success: true,
            message: "Delivery rule deleted successfully",
        });
    }
);

export const updateDeliveryRule = TryCatch(
    async( req, res, next ) => {
        const deliveryRule = await DeliveryRule.findOne( { _id: req.params.id } );

        if( !deliveryRule ) return next( new ErrorHandler( "Delivery Rule not found", 404 ) );
        
        const { ruleName, subtotalMinRange, subtotalMaxRange, amount, percentage, setDeliveryFeeTo } = req.body;

        if( ruleName ) deliveryRule.ruleName = ruleName;

        if( subtotalMinRange ) deliveryRule.subtotalMinRange = subtotalMinRange;

        deliveryRule.subtotalMaxRange = subtotalMaxRange;

        if( amount ) deliveryRule.amount = amount;

        if( percentage ) deliveryRule.percentage = percentage;

        if( setDeliveryFeeTo ) deliveryRule.setDeliveryFeeTo = setDeliveryFeeTo;

        await deliveryRule.save( );

        return res.status(200).json({
            success: true,
            message: "Delivery rule updated successfully",
        });
    }
)