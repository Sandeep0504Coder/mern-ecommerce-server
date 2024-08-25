import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { Order } from "../models/orderModel.js";
import { Product } from "../models/productModel.js";
import { User } from "../models/userModel.js";
import { calculatePercentage, getInventories, groupDataByMonth } from "../utils/features.js";

export const getDashboardStats = TryCatch( async( req, res, next ) => {
    let stats = { };
    const key = "admin-stats";

    if( myCache.has( key ) ) stats = JSON.parse( myCache.get( key ) as string );
    else {
        const today = new Date();
        const sixMonthsAgo = new Date( today.getFullYear( ), today.getMonth( ) - 6, 1 );

        const thisMonth = {
            start: new Date( today.getFullYear( ), today.getMonth( ), 1 ),
            end: today,
        };

        const lastMonth = {
            start: new Date( today.getFullYear( ), today.getMonth( ) - 1, 1 ),
            end: new Date( today.getFullYear( ), today.getMonth( ), 0 ),
        };

        const thisMonthProductsPromise = Product.find( {
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            }
        } );

        const lastMonthProductsPromise = Product.find( {
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            }
        } );

        const thisMonthUsersPromise = User.find( {
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            }
        } );

        const lastMonthUsersPromise = User.find( {
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            }
        } );

        const thisMonthOrdersPromise = Order.find( {
            createdAt: {
                $gte: thisMonth.start,
                $lte: thisMonth.end,
            }
        } );

        const lastMonthOrdersPromise = Order.find( {
            createdAt: {
                $gte: lastMonth.start,
                $lte: lastMonth.end,
            }
        } );

        const lastSixMonthOrdersPromise = Order.find( {
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today,
            }
        } );

        const latestTransactionPromise = Order.find( {} ).select( [ "discount", "total", "status", "orderItems" ] ).limit( 4 );

        const [
            thisMonthProducts,
            thisMonthUsers,
            thisMonthOrders,
            lastMonthProducts,
            lastMonthUsers,
            lastMonthOrders,
            productsCount,
            usersCount,
            allOrders,
            lastSixMonthOrders,
            categories,
            femaleUsersCount,
            latestTransaction,
        ] = await Promise.all( [
            thisMonthProductsPromise,
            thisMonthUsersPromise,
            thisMonthOrdersPromise,
            lastMonthProductsPromise,
            lastMonthUsersPromise,
            lastMonthOrdersPromise,
            Product.countDocuments(),
            User.countDocuments(),
            Order.find( {} ).select( "total" ),
            lastSixMonthOrdersPromise,
            Product.distinct( "category" ),
            User.countDocuments( { gender: "female" } ),
            latestTransactionPromise
        ] );

        let thisMonthRevenue = 0;
        let lastMonthRevenue = 0;

        thisMonthOrders.forEach( order => {
            thisMonthRevenue += order.total || 0;
        } );

        lastMonthOrders.forEach( order => {
            lastMonthRevenue += order.total || 0;
        } )

        const changePercent = {
            revenue: calculatePercentage( thisMonthRevenue, lastMonthRevenue ),
            product: calculatePercentage( thisMonthProducts.length, lastMonthProducts.length ),
            user: calculatePercentage( thisMonthUsers.length, lastMonthUsers.length ),
            order: calculatePercentage( thisMonthOrders.length, lastMonthOrders.length ),
        };
        
        const revenue = allOrders.reduce( ( total,order ) => total + ( order.total || 0 ), 0 );

        const count = {
            revenue,
            product: productsCount,
            user: usersCount,
            order: allOrders.length,
        };

        const orderMonthCount = new Array(6).fill(0);
        const orderMonthRevenue = new Array(6).fill(0);

        lastSixMonthOrders.forEach( ( order ) => {
            const creationDate = order.createdAt;
            const monthDiff = ( today.getMonth() - creationDate.getMonth() + 12 ) % 12;

            if( monthDiff < 6 ){
                orderMonthCount[ 6 - monthDiff - 1 ] += 1;
                orderMonthRevenue[ 6 -  monthDiff - 1 ] += order.total;
            }
        } );

        const categoryCount = await getInventories( { categories, productsCount } );

        const userRatio = {
            male: usersCount - femaleUsersCount,
            female: femaleUsersCount,
        };

        const modifiedLatestTransaction = latestTransaction.map( i => ( {
            _id: i._id,
            discount: i.discount,
            amount: i.total,
            status: i.status,
            quantity: i.orderItems.length,
        } ) )

        stats = {
            categoryCount,
            changePercent,
            count,
            chart: {
                order: orderMonthCount,
                revenue: orderMonthRevenue,
            },
            userRatio,
            latestTransaction: modifiedLatestTransaction,
        };

        myCache.set( key, JSON.stringify( stats ) );
    }

    return res.status( 200 ).json( {
        success: true,
        stats,
    } );
} );

export const getPieCharts = TryCatch( async( req, res, next ) => {
    let charts;
    const key = "admin-pie-charts";

    if( myCache.has( key ) ) charts = JSON.parse( myCache.get( key ) as string );
    else {
        const allOrderPromise = Order.find( {} ).select( [ "total", "discount", "subtotal", "tax", "shippingCharges" ] );

        const [
            processingOrderCount,
            shippedOrderCount,
            deliveredOrderCount,
            categories,
            productsCount,
            outOfStockProducts,
            allOrders,
            allUsers,
            adminUsers,
            customerUsers,
        ] = await Promise.all( [
            Order.countDocuments( { status: "Processing" } ),
            Order.countDocuments( { status: "Shipped" } ),
            Order.countDocuments( { status: "Delivered" } ),
            Product.distinct( "category" ),
            Product.countDocuments( ),
            Product.countDocuments( { stock: 0 } ),
            allOrderPromise,
            User.find( {} ).select( "dob" ),
            User.countDocuments( { role: "admin" } ),
            User.countDocuments( { role: "user" } ),
        ] );

        const orderFulfillment = {
            processing: processingOrderCount,
            shipped: shippedOrderCount,
            delivered: deliveredOrderCount,
        };

        const productCategories = await getInventories( { categories, productsCount } );

        const stockAvailability = {
            inStock: productsCount - outOfStockProducts,
            outOfStock: outOfStockProducts,
        };

        const grossIncome = allOrders.reduce( ( prev, order ) => prev + ( order.total || 0 ), 0 );

        const discount = allOrders.reduce( ( prev, order ) => prev + ( order.discount || 0 ), 0 );

        const productionCost = allOrders.reduce( ( prev, order ) => prev + ( order.shippingCharges || 0 ), 0 );

        const burnt = allOrders.reduce( ( prev, order ) => prev + ( order.tax || 0 ), 0 );

        var marketingCostPercentage = Number( process.env.MARKETING_COST_PERCENTAGE );

        const marketingCost = Math.round( grossIncome * ( marketingCostPercentage / 100 ) );

        const netMargin = grossIncome - discount - productionCost - burnt - marketingCost;

        const revenueDistribution = {
            netMargin,
            discount,
            productionCost,
            burnt,
            marketingCost,
        };

        const userAgeGroup = {
            teen: allUsers.filter( ( user ) => user.age < 20 ).length,
            adult: allUsers.filter( ( user ) => user.age >= 20 && user.age < 40 ).length,
            old: allUsers.filter( ( user ) => user.age >= 40 ).length,
        };

        const adminCustomer = {
            admin: adminUsers,
            customer: customerUsers,
        };

        charts = {
            orderFulfillment,
            productCategories,
            stockAvailability,
            revenueDistribution,
            adminCustomer,
            userAgeGroup,
        };

        myCache.set( key, JSON.stringify( charts ) );
    }

    return res.status( 200 ).json( {
        success: true,
        charts,
    } ); 
} );

export const getBarCharts = TryCatch( async( req, res, next ) => {
    let charts;
    const key = "admin-bar-charts";

    if( myCache.has( key ) ) charts = JSON.parse( myCache.get( key ) as string );
    else {
        const today = new Date();
        const sixMonthsAgo = new Date( today.getFullYear( ), today.getMonth( ) - 6, 1 );
        const twelveMonthsAgo = new Date( today.getFullYear( ), today.getMonth( ) - 12, 1 );

        const lastSixMonthProductsPromise =  Product.find( {
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        } ).select( "createdAt" );

        const lastSixMonthUsersPromise =  User.find( {
            createdAt: {
                $gte: sixMonthsAgo,
                $lte: today
            }
        } ).select( "createdAt" );

        const lastTwelveMonthOrdersPromise =  Order.find( {
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today
            }
        } ).select( "createdAt" );

        const [
            lastSixMonthProducts,
            lastSixMonthUsers,
            lastTwelveMonthOrders,
        ] = await Promise.all( [
            lastSixMonthProductsPromise,
            lastSixMonthUsersPromise,
            lastTwelveMonthOrdersPromise,
        ] );

        const productCounts = groupDataByMonth( { length: 6, today, docArr: lastSixMonthProducts } );
        const userCounts = groupDataByMonth( { length: 6, today, docArr: lastSixMonthUsers } );
        const orderCounts = groupDataByMonth( { length: 12, today, docArr: lastTwelveMonthOrders } );

        charts = {
            users: userCounts,
            products: productCounts,
            orders: orderCounts,
        };

        myCache.set( key, JSON.stringify( charts ) );
    }

    return res.status( 200 ).json( {
        success: true,
        charts,
    } );
} );

export const getLineCharts = TryCatch( async( req, res, next ) => {
    let charts;
    const key = "admin-line-charts";

    if( myCache.has( key ) ) charts = JSON.parse( myCache.get( key ) as string );
    else {
        const today = new Date();
        const twelveMonthsAgo = new Date( today.getFullYear( ), today.getMonth( ) - 12, 1 );

        const baseQuery = {
            createdAt: {
                $gte: twelveMonthsAgo,
                $lte: today
            }
        };

        const [
            twelveMonthProducts,
            twelveMonthUsers,
            twelveMonthOrders,
        ] = await Promise.all( [
            Product.find( baseQuery ).select( "createdAt" ),
            User.find( baseQuery ).select( "createdAt" ),
            Order.find( baseQuery ).select( [ "createdAt", "discount", "total" ] ),
        ] );

        const productCounts = groupDataByMonth( { length: 12, today, docArr: twelveMonthProducts } );
        const userCounts = groupDataByMonth( { length: 12, today, docArr: twelveMonthUsers } );
        const discount = groupDataByMonth( { length: 12, today, docArr: twelveMonthOrders, property: "discount" } );
        const revenue = groupDataByMonth( { length: 12, today, docArr: twelveMonthOrders, property: "total" } );

        charts = {
            users: userCounts,
            products: productCounts,
            discount,
            revenue,
        };

        myCache.set( key, JSON.stringify( charts ) );
    }

    return res.status( 200 ).json( {
        success: true,
        charts,
    } );
} );