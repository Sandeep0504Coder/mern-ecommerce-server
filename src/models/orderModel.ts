import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        shippingInfo: {
            name: {
                type: String,
                required: [ true, "Please enter name" ],
            },
            primaryPhone: {
                type: Number,
                required: [ true, "Please enter phone number" ],
                minlength: [ 10, "Phone number must be equal or more than 10 numbers" ],
                maxlength: [ 15, "Phone number must not be more than 15 numbers" ],
            },
            secondaryPhone: {
                type: Number,
                minlength: [ 10, "Phone number must be equal or more than 10 numbers" ],
                maxlength: [ 15, "Phone number must not be more than 15 numbers" ],
            },
            address: {
                type: String,
                required: [ true, "Shippping address is required" ]
            },
            address2: {
                type: String,
                // required: [ true, "House No, Building name is required" ]
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
                    configuration: [
                        {
                            key: { type: String, required: true },   // e.g., "RAM", "Color"
                            value: { type: String, required: true }  // e.g., "4GB", "Red"
                        }
                    ],
                    price: Number,
                    _id: mongoose.Types.ObjectId
                },
            }
        ]
    },{
        timestamps: true,
    }
);

export const Order = mongoose.model( "Order",orderSchema );