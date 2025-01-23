import { NextFunction, Request, Response } from "express";
import { User } from "../models/userModel.js";
import { Address } from "../models/addressModel.js";
import { NewAddressRequestBody, NewUserRequestBody } from "../types/types.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";


export const newAddress = TryCatch(
    async (
        req: Request<{}, {}, NewAddressRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
        let user = await User.findById( req.query.id );

        if( !user ) return next( new ErrorHandler( "Not logged in", 404 ) );

        const { name, primaryPhone, secondaryPhone, address, address2, city, state, country, pinCode, isDefault } = req.body;

        if( !name || !primaryPhone || !address || !city || !state || !country || !pinCode ){
            return next( new ErrorHandler( "Please add all fields", 400 ) );
        }

        if( isDefault ){
            await Address.updateMany( { isDefault: true }, { isDefault: false } );
        }

        const newAddress = await Address.create({
            name,
            primaryPhone,
            secondaryPhone,
            address,
            address2,
            city,
            state,
            country,
            pinCode,
            user: user._id,
            isDefault,
        } );

        return res.status( 201 ).json({
            success: true,
            message: "Delivery address created successfully.",
            addressId: newAddress._id,
        });
    }
);

export const getUserAddresses = TryCatch(
    async( req, res, next ) => {
        const addresses = await Address.find({ user: req.query.id }).select( "-updatedAt -createdAt -__v" );

        return res.status(200).json({
            success: true,
            addresses,
        })
    }
);

export const getAddress = TryCatch(
    async( req, res, next ) => {
        const id = req.params.id;
        const address = await Address.findById( id );

        if( !address ){
            return next( new ErrorHandler( "Invalid Id", 400 ) );
        }

        return res.status(200).json({
            success: true,
            address,
        })
    }
);

export const deleteAddress = TryCatch(
    async( req, res, next ) => {
        const user = await User.findById( req.query.id );

        if( !user ) return next( new ErrorHandler( "Not logged in", 404 ) );

        const address = await Address.findById( req.params.id );

        if( !address ) return next( new ErrorHandler( "Address not found", 404 ) );

        const isAuthenticUser = address.user.toString( ) === user._id.toString( );

        if( !isAuthenticUser ) return next( new ErrorHandler( "Not Authorized", 401 ) );

        const isDefault = address.isDefault;
        
        await address.deleteOne( );

        if( isDefault ) await Address.updateOne( {}, { isDefault: true } );

        return res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });
    }
);

export const updateAddress = TryCatch(
    async( req, res, next ) => {
        const user = await User.findById( req.query.id );

        if( !user ) return next( new ErrorHandler( "Not logged in", 404 ) );

        const deliveryAddress = await Address.findOne( {
            _id: req.params.id,
            user: user._id
        } );

        if( !deliveryAddress ) return next( new ErrorHandler( "Address not found", 404 ) );
        
        const { name, primaryPhone, secondaryPhone, address, address2, city, state, country, pinCode, isDefault } = req.body;

        if( name ) deliveryAddress.name = name;

        if( primaryPhone ) deliveryAddress.primaryPhone = primaryPhone;

        deliveryAddress.secondaryPhone = secondaryPhone;

        if( address ) deliveryAddress.address = address;

        if( address2 ) deliveryAddress.address2 = address2;

        if( city ) deliveryAddress.city = city;

        if( state ) deliveryAddress.state = state;

        if( country ) deliveryAddress.country = country;

        if( pinCode ) deliveryAddress.pinCode = pinCode;
        
        if( isDefault && !deliveryAddress.isDefault ){
            await Address.updateMany( { isDefault: true }, { isDefault: false } );
        } else if( !isDefault && deliveryAddress.isDefault ){
            await Address.updateOne( {}, { isDefault: true } );
        }

        deliveryAddress.isDefault = isDefault;

        await deliveryAddress.save( );

        return res.status(200).json({
            success: true,
            message: "Address updated successfully",
        });
    }
)