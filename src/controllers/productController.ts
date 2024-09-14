import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import { Product } from "../models/productModel.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";

//Revalidate on new, update, delete product & on new order
export const getLatestProducts = TryCatch( async( req, res, next ) => {
    let latestProducts;

    if( myCache.has( "latest-products" ) ){
        latestProducts = JSON.parse( myCache.get( "latest-products" ) as string );
    } else {
        latestProducts = await Product.find({}).limit( 5 ).sort( { createdAt: -1 } );
        myCache.set( "latest-products", JSON.stringify( latestProducts ) );
    }

    return res.status( 200 ).json(
        {
            success: true,
            products: latestProducts
        }
    );
} );

//Revalidate on new, update, delete product & on new order
export const getProductCategories = TryCatch( async( req, res, next ) => {
    let productCategories;
    
    if( myCache.has( "product-categories" ) ){
        productCategories = JSON.parse( myCache.get( "product-categories" ) as string );
    } else {
        productCategories = await Product.distinct( "category" );
        myCache.set( "product-categories", JSON.stringify( productCategories ) );
    }

    return res.status( 200 ).json(
        {
            success: true,
            categories: productCategories
        }
    );
} );

//Revalidate on new, update, delete product & on new order
export const getAdminProducts = TryCatch( async( req, res, next ) => {
    let products;

    if( myCache.has( "all-products" ) ){
        products = JSON.parse( myCache.get( "all-products" ) as string );
    } else {
        products = await Product.find({});
        myCache.set( "all-products", JSON.stringify( products ) );
    }

    return res.status( 200 ).json(
        {
            success: true,
            products: products
        }
    );
} );

export const getProductDetails = TryCatch( async( req, res, next ) => {
    let product;
    const { id } = req.params;

    if( myCache.has( `product-${id}` ) ){
        product = JSON.parse( myCache.get( `product-${id}` ) as string );
    } else {
        product = await Product.findById( id );
        
        if( !product ) return next( new ErrorHandler( "Product not found", 404 ) );
        
        myCache.set( `product-${id}`, JSON.stringify( product ) );
    }
    

    return res.status( 200 ).json(
        {
            success: true,
            product,
        }
    );
} );

export const createProduct = TryCatch( async( req: Request<{}, {}, NewProductRequestBody>, res, next ) => {
    const { name, category, price, stock, description } = req.body;
    const photo = req.file;

    if( !photo ) return next( new ErrorHandler( "Please add photo", 400 ) );

    if( !name || !price || !stock || !category ){
        rm( photo.path, () => {
            console.log( "Deleted" );
        } )
        return next( new ErrorHandler( "Please enter all fields", 400 ) );
    }

    await Product.create( {
        name,
        category: category.toLowerCase(),
        price,
        stock,
        description,
        photo: photo.path
    } );

    invalidateCache( { product: true, admin: true } );

    return res.status( 201 ).json(
        {
            success: true,
            message: "Product Created Successfully"
        }
    );
} );

export const updateProduct = TryCatch( async( req, res, next ) => {
    const { id } = req.params;
    const { name, category, price, stock, description } = req.body;
    const photo = req.file;

    const product = await Product.findById( id );

    if( !product ) return next( new ErrorHandler( "Product not found", 404 ) );

    if( photo ){
        rm( product.photo, () => {
            console.log( "Old photo Deleted" );
        } );

        product.photo = photo.path;
    }

    if( name ) product.name = name;
    if( category ) product.category = category;
    if( price ) product.price = price;
    if( stock ) product.stock = stock;
    if( description ) product.description = description;

    await product.save();

    invalidateCache( { product: true, productIdArray: [ String( product._id ) ], admin: true } );

    return res.status( 200 ).json(
        {
            success: true,
            message: "Product updated Successfully"
        }
    );
} );

export const deleteProduct = TryCatch( async( req, res, next ) => {
    const { id } = req.params;
    const product = await Product.findById( id );

    if( !product ) return next( new ErrorHandler( "Product not found", 404 ) );

    rm( product.photo, () => {
        console.log( "Product photo Deleted" );
    } );

    await Product.findByIdAndDelete( id );
    
    invalidateCache( { product: true, productIdArray: [ String( product._id ) ], admin: true } );

    return res.status( 200 ).json(
        {
            success: true,
            message: "Product deleted successfully"
        }
    );
} );

export const getAllProducts = TryCatch( async( req: Request<{},{},{},SearchRequestQuery>, res, next ) => {
    const { search, price, category, sort } = req.query;

    const page = Number( req.query.page ) || 1;

    const limit =  Number( process.env.PRODUCT_PER_PAGE ) || 8;
    const skip = limit * ( page - 1 );

    const baseQuery: BaseQuery = { };

    if( search ) baseQuery.name = {
        $regex: search,
        $options: "i",
    };

    if( price ) baseQuery.price = {
        $lte: Number(price),
    };

    if( category ) baseQuery.category = category;

    const productsPromise = Product.find( baseQuery )
        .sort( sort && { price: sort==="asc" ? 1 : -1 } )
        .limit( limit )
        .skip( skip );

    const [ products, filteredOnlyProducts ] = await Promise.all( [
        productsPromise, 
        Product.find( baseQuery ),
    ] );

    const totalPage = Math.ceil( filteredOnlyProducts.length / limit );

    return res.status( 200 ).json(
        {
            success: true,
            products,
            totalPage,
        }
    );
} );