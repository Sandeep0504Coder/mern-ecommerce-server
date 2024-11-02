import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [ true, "Product Name is required!" ],
        },
        photos: [
            {
                public_id: {
                    type: String,
                    required: [ true, "Please enter public id!" ],
                },
                url: {
                    type: String,
                    required: [ true, "Please enter url!" ],
                }
            }
        ],
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
        description: {
            type: String,
            required: [ true, "Product description is required!" ]
        },
        ratings: {
            type: Number,
            default: 0,
        },
        numOfReviews: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

export const Product = mongoose.model( "Product", productSchema )