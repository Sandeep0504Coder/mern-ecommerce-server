import { NextFunction, Request, Response } from "express";
import { CreateCountryRequestBody, CreateDeliveryRuleRequestBody } from "../types/types.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { DeliveryRule } from "../models/deliveryRuleModel.js";
import { Region } from "../models/regionModel.js";


export const createRegion = TryCatch(
    async (
        req: Request<{}, {}, CreateCountryRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
        const { countryName, countryAbbreviation } = req.body;

        if( !countryName || !countryAbbreviation ){
            return next( new ErrorHandler( "Please add all fields", 400 ) );
        }

        await Region.create({
            countryName,
            countryAbbreviation
        } );

        return res.status( 201 ).json( {
            success: true,
            message: "Region created successfully.",
        } );
    }
);

export const getRegions = TryCatch(
    async( req, res, next ) => {
        const regions = await Region.find({ });

        return res.status(200).json({
            success: true,
            regions,
        })
    }
);

export const getRegionDetails = TryCatch(
    async( req, res, next ) => {
        const id = req.params.id;
        const region = await Region.findById( id );

        if( !region ){
            return next( new ErrorHandler( "Invalid Id", 400 ) );
        }

        return res.status(200).json({
            success: true,
            region,
        })
    }
);

export const deleteRegion = TryCatch(
    async( req, res, next ) => {
        const region = await Region.findById( req.params.id );

        if( !region ) return next( new ErrorHandler( "Region not found", 404 ) );
        
        await region.deleteOne( );

        return res.status(200).json({
            success: true,
            message: "Region deleted successfully",
        });
    }
);

export const updateRegion = TryCatch(
    async( req, res, next ) => {
        const region = await Region.findOne( { _id: req.params.id } );

        if( !region ) return next( new ErrorHandler( "Region not found", 404 ) );
        
        const { countryName, countryAbbreviation } = req.body;

        if( countryName ) region.countryName = countryName;

        if( countryAbbreviation ) region.countryAbbreviation = countryAbbreviation;

        await region.save( );

        return res.status(200).json({
            success: true,
            message: "Region updated successfully",
        });
    }
)

export const manageState = TryCatch( async( req, res, next ) => {
    const { regionId, stateId } = req.params;
    const { stateName, stateAbbreviation } = req.body;

    const region = await Region.findById( regionId );

    if( !region ) return next( new ErrorHandler( "Region not found", 404 ) );

    const stateIndex = region.states.findIndex( ( state ) => state._id?.toString() == stateId );

    if( stateIndex == -1 ){
        if( !stateName || !stateAbbreviation ){
            return next( new ErrorHandler( "Please add all fields", 400 ) );
        }
        region.states.push( { stateName, stateAbbreviation } );
    } else {
        if( stateName ) region.states[stateIndex].stateName = stateName;
        if( stateAbbreviation ) region.states[stateIndex].stateAbbreviation = stateAbbreviation;
    }

    await region.save( );

    return res.status( 200 ).json(
        {
            success: true,
            message: `State ${stateIndex == -1 ? "Added" : "Updated"} Successfully`
        }
    );
} );

export const removeState = TryCatch( async( req, res, next ) => {
    const { regionId, stateId } = req.params;

    const region = await Region.findById( regionId );

    if( !region ) return next( new ErrorHandler( "Region not found", 404 ) );

    const stateIndex = region.states.findIndex( ( state ) => state._id?.toString() == stateId );

    if( stateIndex == -1 ){
        return next( new ErrorHandler( "State not found", 404 ) );
    }

    region.states.splice( stateIndex, 1 );
    await region.save( );

    return res.status( 200 ).json(
        {
            success: true,
            message: `State removed Successfully`
        }
    );
} );