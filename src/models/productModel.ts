import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [ true, "Product Name is required!" ],
        },
        photo: {
            type: String,
            required: [ true, "Product photo is required!" ],
        },
        category: {
            type: String,
            required: [ true, "Product category is required!" ],
            trim: true,
        },
        price: {
            type: Number,
            required: [ true, "Product price is required!" ],
        },
        stock: {
            type: Number,
            required: [ true, "Product stock is required!" ],
        },
        description: String,
    },
    {
        timestamps: true,
    }
);

export const Product = mongoose.model( "Product", productSchema )