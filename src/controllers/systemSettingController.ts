import { NextFunction, Request, Response } from "express";
import { CreateSystemSettingRequestBody } from "../types/types.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { DeliveryRule } from "../models/deliveryRuleModel.js";
import { SystemSetting } from "../models/systemSettingModel.js";

export const createSystemSetting = TryCatch(
    async (
        req: Request<{}, {}, CreateSystemSettingRequestBody>,
        res: Response,
        next: NextFunction
    ) => {
        const { settingCategory, settingName, settingValue, settingUniqueName, entityId } = req.body;

        if( !settingCategory || !settingName || !settingUniqueName || !settingValue ){
            return next( new ErrorHandler( "Please add all fields", 400 ) );
        }

        await SystemSetting.create({
            settingCategory,
            settingName,
            settingUniqueName,
            settingValue,
            entityId
        } );

        return res.status( 201 ).json( {
            success: true,
            message: "System Setting created successfully.",
        } );
    }
);

export const getSystemSettings = TryCatch(
    async( req, res, next ) => {
        const systemSettings = await SystemSetting.find({ }).select( "-updatedAt -createdAt -__v" );

        var modifiedSystemSettings = await Promise.all( systemSettings.map( async( systemSetting ) => {
            if( systemSetting.entityId && systemSetting.entityId.length > 0 ){
                if( systemSetting.settingUniqueName == "deliveryFee" ){
                    const entityDetails = await DeliveryRule.findById( systemSetting.entityId );

                    return {
                        _id: systemSetting._id,
                        settingCategory: systemSetting.settingCategory,
                        settingUniqueName: systemSetting.settingUniqueName,
                        settingName: systemSetting.settingName,
                        settingValue: systemSetting.settingValue,
                        entityId: systemSetting.entityId,
                        entityDetails:  entityDetails ? entityDetails.ruleName : systemSetting.entityId
                    }
                }
            }

            return {
                _id: systemSetting._id,
                settingCategory: systemSetting.settingCategory,
                settingUniqueName: systemSetting.settingUniqueName,
                settingName: systemSetting.settingName,
                settingValue: systemSetting.settingValue,
                entityId: systemSetting.entityId,
                entityDetails: systemSetting.entityId
            }
        } ) );

        return res.status(200).json({
            success: true,
            systemSettings: modifiedSystemSettings,
        })
    }
);

export const getSystemSettingDetails = TryCatch(
    async( req, res, next ) => {
        const id = req.params.id;
        const systemSetting = await SystemSetting.findById( id );

        if( !systemSetting ){
            return next( new ErrorHandler( "Invalid Id", 400 ) );
        }

        if( systemSetting.entityId && systemSetting.entityId.length > 0 ){
            let modifiedSystemSetting: {
                _id: string;
                settingCategory: string;
                settingUniqueName: string;
                settingName: string;
                settingValue: string;
                entityId?: string | null | undefined;
                entityOptions?: {
                    ruleName: string;
                    subtotalMinRange: number;
                    amount: number;
                    percentage: number;
                    setDeliveryFeeTo: "Greater" | "Leaser";
                    subtotalMaxRange?: number | null | undefined
                }[]
            } = {
                _id: systemSetting._id.toString(),
                settingCategory: systemSetting.settingCategory,
                settingUniqueName: systemSetting.settingUniqueName,
                settingName: systemSetting.settingName,
                settingValue: systemSetting.settingValue,
                entityId: systemSetting.entityId,
            };

            if( systemSetting.settingUniqueName == "deliveryFee" ){
                const entityOptions = await DeliveryRule.find( {} );
                modifiedSystemSetting[ "entityOptions" ] = entityOptions;

                return res.status(200).json({
                    success: true,
                    systemSetting: modifiedSystemSetting,
                })
            }
        }


        return res.status(200).json({
            success: true,
            systemSetting,
        })
    }
);

export const updateSystemSetting = TryCatch(
    async( req, res, next ) => {
        const systemSetting = await SystemSetting.findOne( { _id: req.params.id } );

        if( !systemSetting ) return next( new ErrorHandler( "System Setting not found", 404 ) );
        
        const { settingValue, entityId } = req.body;

        if( settingValue ) systemSetting.settingValue = settingValue;

        if( entityId ) systemSetting.entityId = entityId;

        await systemSetting.save( );

        return res.status(200).json({
            success: true,
            message: "System setting updated successfully",
        });
    }
);

export const getSystemSettingValueBySettingUniqueName = TryCatch(
    async( req: Request<{},{},{},{ settingUniqueName?: string;}>, res, next ) => {
        const { settingUniqueName } = req.query;
        const systemSetting = await SystemSetting.findOne( { settingUniqueName } );

        if( !systemSetting ){
            return next( new ErrorHandler( "Invalid Id", 400 ) );
        }

        if( systemSetting.entityId && systemSetting.entityId.length > 0 ){
            let modifiedSystemSetting: {
                _id: string;
                settingCategory: string;
                settingUniqueName: string;
                settingName: string;
                settingValue: string;
                entityId?: string | null | undefined;
                entityDetails?: {
                    ruleName: string;
                    subtotalMinRange: number;
                    amount: number;
                    percentage: number;
                    setDeliveryFeeTo: "Greater" | "Leaser";
                    subtotalMaxRange?: number | null | undefined
                }
            } = {
                _id: systemSetting._id.toString(),
                settingCategory: systemSetting.settingCategory,
                settingUniqueName: systemSetting.settingUniqueName,
                settingName: systemSetting.settingName,
                settingValue: systemSetting.settingValue,
                entityId: systemSetting.entityId,
            };

            if( systemSetting.settingUniqueName == "deliveryFee" ){
                const entityDetails = await DeliveryRule.findById( systemSetting.entityId );

                if( entityDetails ) modifiedSystemSetting[ "entityDetails" ] = entityDetails;

                return res.status(200).json({
                    success: true,
                    systemSetting: modifiedSystemSetting,
                })
            }
        }


        return res.status(200).json({
            success: true,
            systemSetting,
        })
    }
);