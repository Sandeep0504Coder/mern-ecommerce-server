import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        shippingInfo: {
            address: {
                type: String,
                required: [ true, "Shippping address is required" ]
            },
            city: {
                type: String,
                required: [ true, "City is required" ]
            },
            state: {
                type: String,
                required: [ true, "State is required" ]
            },
            country: {
                type: String,
                required: [ true, "Coutry is required" ]
            },
            pinCode: {
                type: Number,
                required: [ true, "Pincode is required" ]
            },
        },
        user: {
            type: String,
            ref: "User",
            required: true,
        },
        subtotal: {
            type: Number,
            reuired: true,
        },
        tax: {
            type: Number,
            reuired: true,
        },
        shippingCharges: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        total: {
            type: Number,
            reuired: true,
        },
        status: {
            type: String,
            enum: [ "Processing", "Shipped", "Delivered" ],
            default: "Processing",
        },
        orderItems: [
            {
                productId: {
                    type: mongoose.Types.ObjectId,
                    ref: "Product",
                    required: true
                },
                quantity: Number,
                name: String,
                photo: String,
                price: Number,
                variant: {
                    type: Object,
                    required: true,
                    default: {},
                },
            }
        ]
    },{
        timestamps: true,
    }
);

export const Order = mongoose.model( "Order",orderSchema );