import mongoose, { Document } from "mongoose"
import { invalidateCacheProps, OrderItemType } from "../types/types.js";
import { myCache } from "../app.js";
import { Product } from "../models/productModel.js";

export const connectDB = ( uri: string )=>{
    mongoose.connect( uri, {
        dbName:"Ecommerce_24"
    } ).then((c) => {
        console.log( `Database connected to ${c.connection.host}` )
    } ).catch((err) => {
        console.log(err);
    });
}

export const invalidateCache = ( { product, order, admin, userId, orderId, productIdArray }: invalidateCacheProps ) => {
    if( product ){
        const productKeys: string[] = [ "latest-products", "product-categories", "all-products" ];

        productIdArray?.forEach( ( id ) => productKeys.push( `product-${id}` ) );

        myCache.del( productKeys );
    }

    if( order ){
        const orderKeys: string[] = [ "all-orders", `my-orders-${userId}`, `order-${orderId}` ];

        myCache.del( orderKeys );
    }

    if( admin ){
        myCache.del( [ "admin-stats", "admin-pie-charts", "admin-bar-charts", "admin-line-charts" ] );
    }
}

export const reduceStock = ( orderItems: OrderItemType[] ) => {
    orderItems.forEach( async( item ) => {
        const product = await Product.findById( item.productId );
        
        if( !product ) throw new Error( "Product not found" );

        product.stock -= item.quantity;
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