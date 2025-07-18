import mongoose, { Document } from "mongoose"
import { invalidateCacheProps, OrderItemType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/productModel.js";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary"
import { Review } from "../models/reviewModel.js";
import { UploadApiOptions } from "cloudinary";

export const findAverageRatings = async( productId: mongoose.Types.ObjectId ) => {
    let sumOfRatings = 0;
        
    const reviews = await Review.find( { product: productId } );

    reviews.forEach( ( review ) => {
        sumOfRatings += review.rating;
    } );

   return {
    "ratings": Math.floor( sumOfRatings / reviews.length ) || 0,
    "numberOfReviews": reviews.length,
   }
}

const getBase64 = ( file: Express.Multer.File ) => `data:${file.mimetype};base64,${file.buffer.toString( "base64" )}`;

export const uploadToCloudinary = async (files: Express.Multer.File[]) => {
    const promises = files.map(async (file) => {
        return new Promise<UploadApiResponse>((resolve, reject) => {
            // Set the resource type explicitly
            const options: UploadApiOptions = file.mimetype.startsWith("video/")
                ? { resource_type: "video" }
                : { resource_type: "image" };

            cloudinary.uploader.upload(
                getBase64(file),
                options,
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result!);
                }
            );
        });
    });

    const result = await Promise.all(promises);

    return result.map((i) => ({
        public_id: i.public_id,
        url: i.secure_url,
    }));
};


export const deleteFromCloudinary = async( publicIds: string[] ) => {
    const promises = publicIds.map( ( publicId ) => {
        return new Promise<void>( ( resolve, reject ) => {
            cloudinary.uploader.destroy( publicId, ( error, result ) => {
                if( error ) return reject( error );
                resolve( );
            } );
        } );
    } );
}

export const connectDB = ( uri: string )=>{
    mongoose.connect( uri, {
        dbName:"Ecommerce_24"
    } ).then((c) => {
        console.log( `Database connected to ${c.connection.host}` )
    } ).catch((err) => {
        console.log(err);
    });
}

export const invalidateCache = ( { product, order, homePageContent, admin, userId, orderId, productIdArray }: invalidateCacheProps ) => {
    if( product ){
        const productKeys: string[] = [ "latest-products", "product-categories", "all-products" ];

        productIdArray?.forEach( ( id ) => productKeys.push( `product-${id}` ) );

        myCache.del( productKeys );
    }

    if( order ){
        const orderKeys: string[] = [ "all-orders", `my-orders-${userId}`, `order-${orderId}` ];

        myCache.del( orderKeys );
    }

    if( homePageContent ){
        myCache.del( 'home-page-content' );
    }

    if( admin ){
        myCache.del( [ "admin-stats", "admin-pie-charts", "admin-bar-charts", "admin-line-charts" ] );
    }
}

export const reduceStock = ( orderItems: OrderItemType[] ) => {
    orderItems.forEach( async( item ) => {
        const product = await Product.findById( item.productId );
        
        if( !product ) throw new Error( "Product not found" );

        if( typeof item.variant === "undefined" ){
            product.stock -= item.quantity;
        } else {
            const selectedVariantIndex = product.variants.findIndex( ( variant ) => variant._id?.toString( ) == item.variant?._id );
            product.variants[ selectedVariantIndex ].stock -= item.quantity;
        }
        
        await product.save( );
    } );
}

export const calculatePercentage = ( thisMonth: number, lastMonth: number ) => {
    if( lastMonth === 0 ) return thisMonth*100;
    const percent = ( thisMonth / lastMonth ) * 100;
    return Number( percent.toFixed( 0 ) );
};

export const getInventories = async( { categories, productsCount }: { categories: string[ ], productsCount: number } ) => {
    const categoriesCountPromise = categories.map( category => Product.countDocuments( { category } ) );

    const categoriesCount = await Promise.all( categoriesCountPromise );

    const categoryCount: Record<string, number>[] = [];

    categories.forEach( ( category, i ) => {
        categoryCount.push( {
            [ category ]: Math.round( ( categoriesCount[ i ] / productsCount ) * 100 ),
        } );
    } );

    return categoryCount;
}

interface MyDocument extends Document{
    createdAt: Date;
    discount?: number;
    total?: number | null;
}

type GroupDataByMonthProps = {
    length: number;
    docArr: MyDocument[];
    today: Date;
    property?: "discount" | "total";
}

export const groupDataByMonth = ( { length, docArr, today, property }: GroupDataByMonthProps ) => {
    const data: number[] = new Array(length).fill(0);

    docArr.forEach( ( i ) => {
        const creationDate = i.createdAt;
        const monthDiff = ( today.getMonth() - creationDate.getMonth() + 12 ) % 12;

        if( monthDiff < length ){
            if( property ){
                data[ length -  monthDiff - 1 ] += i[ property ]!;
            } else {
                data[ length -  monthDiff - 1 ] += 1;
            }
        }
    } );

    return data;
}