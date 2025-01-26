import { NextFunction, Request, Response } from "express";
import { CreateCountryRequestBody, CreateDeliveryRuleRequestBody, HomePageContentType, NewHomePageContentRequestBody, ProductSectionType } from "../types/types.js";
import { TryCatch } from "../middlewares/error.js";
import ErrorHandler from "../utils/utility-class.js";
import { DeliveryRule } from "../models/deliveryRuleModel.js";
import { Region } from "../models/regionModel.js";
import { deleteFromCloudinary, uploadToCloudinary } from "../utils/features.js";
import { HomePageContent } from "../models/homePageContentModel.js";
import { Document } from "mongoose";
import { Product } from "../models/productModel.js";


export const createHomePageContent = TryCatch( async( req: Request<{}, {}, NewHomePageContentRequestBody>, res, next ) => {
    const { promotionalText } = req.body;
    const banners = req.files as Express.Multer.File[] | undefined;
    // Parse the variants string
    const productSections = JSON.parse( req.body.productSections );

    if( !banners ) return next( new ErrorHandler( "Please add banner", 400 ) );

    if( banners.length < 1 ) return next( new ErrorHandler( "Please add atlease one banner", 400 ) );
    if( banners.length > 5 ) return next( new ErrorHandler( "You can only upload 5 banners", 400 ) );

    if( !promotionalText ){
        return next( new ErrorHandler( "Please enter all fields", 400 ) );
    }

    // Upload Here

    const bannersURL = await uploadToCloudinary( banners );

    await HomePageContent.create( {
        promotionalText,
        banners: bannersURL,
        productSections: productSections,
    } );

    return res.status( 201 ).json(
        {
            success: true,
            message: "Home Page Content Created Successfully"
        }
    );
} );

export const updateHomePageContent = TryCatch( async( req, res, next ) => {
    const { id } = req.params;
    const { promotionalText, promotionalTextLabel } = req.body;

     // Narrowing req.files type
    const files = req.files as Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined;

    let banners: Express.Multer.File[] | undefined;
    let promotionalVideo: Express.Multer.File | undefined;

    if (files) {
        if (!Array.isArray(files)) {
            banners = files["banners"];
            promotionalVideo = files["promotionalVideo"]?.[0];
        }
    }

    // Parse the productSections string
    const productSections = req.body.productSections ? JSON.parse(req.body.productSections) : undefined;

    const homePageContent = await HomePageContent.findById( id );

    if( !homePageContent ) return next( new ErrorHandler( "Home Page Content not found", 404 ) );

    if( banners && banners.length > 0 ){
        const bannersURL = await uploadToCloudinary( banners );
        
        await deleteFromCloudinary( homePageContent.banners.map( ( banner ) => banner.public_id ) );

        let i = 0;

        while( i < homePageContent.banners.length ){
            homePageContent.banners.pop();
        }

        bannersURL.forEach( ( bannerURL ) => {
            homePageContent.banners.push( bannerURL );
        } );
    }

    // Update promotional video if provided
    if (promotionalVideo) {
        const promotionalVideoURL = await uploadToCloudinary([promotionalVideo]);

        // Delete old promotional video from Cloudinary, if exists
        if (homePageContent.promotionalVideo?.public_id) {
            await deleteFromCloudinary([homePageContent.promotionalVideo.public_id]);
        }

        // Replace old promotional video with the new one
        homePageContent.promotionalVideo = promotionalVideoURL[0];
    }

    if( promotionalText ) homePageContent.promotionalText = promotionalText;
    if( promotionalTextLabel ) homePageContent.promotionalTextLabel = promotionalTextLabel;
    if( productSections ) homePageContent.productSections = productSections;

    await homePageContent.save();

    return res.status( 200 ).json(
        {
            success: true,
            message: "Home Page updated Successfully"
        }
    );
} );

export const getHomePageContents = TryCatch( async( req, res, next ) => {
    const homePageContents = await HomePageContent.find({});

    return res.status( 200 ).json(
        {
            success: true,
            homePageContents: homePageContents
        }
    );
} );

export const getHomePageContentDetails = TryCatch( async( req, res, next ) => {
    const { id } = req.params;

    const homePageContentDetails = await HomePageContent.findById( id );
    
    if( !homePageContentDetails ) return next( new ErrorHandler( "Home Page Content not found", 404 ) );

    return res.status( 200 ).json(
        {
            success: true,
            homePageContent: homePageContentDetails,
        }
    );
} );

export const getHeroSectionData = TryCatch( async( req, res, next ) => {
    // Fetch home page content from the database
    const homePageContent: HomePageContentType | null = await HomePageContent.findOne()
        .select('-__v -createdAt -updatedAt')
        .lean();

    if (!homePageContent) {
        return res.status(404).json({
            success: false,
            message: 'Home page content not found',
        });
    }

    // Iterate through productSections and fetch filtered products
    const productSectionsWithProducts: ProductSectionType[] = await Promise.all(
        homePageContent.productSections.map(async (section): Promise<ProductSectionType> => {
            const query: Record<string, string> = {};

            // Build query for filters
            section.filters.forEach((filter) => {
                query[filter.key] = filter.value.includes( "{" ) ? JSON.parse( filter.value ) : filter.value;
            });
            
            // Fetch products based on query
            const products = await Product.find(query)
                .limit(5)
                .select("_id name price photos category variants stock")
                .lean();

            return {
                ...section,
                products,
            };
        })
    );

    // Update homePageContent with the filtered products
    homePageContent.productSections = productSectionsWithProducts;

    // Send response
    return res.status(200).json({
        success: true,
        homePageContent,
    });  
} );