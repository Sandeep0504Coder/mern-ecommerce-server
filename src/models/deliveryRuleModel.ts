import mongoose from "mongoose";

const deliveyRuleSchema = new mongoose.Schema(
    {
        ruleName: {
            type: String,
            required: [ true, "Please enter rule name" ],
        },
        subtotalMinRange: {
            type: Number,
            required: [ true, "Subtotal min range is required" ],
        },
        subtotalMaxRange: Number,
        amount: {
            type: Number,
            required: [ true, "Delivery fee amount is required" ],
        },
        percentage: {
            type: Number,
            required: [ true, "Delivery fee percentage is required" ],
        },
        setDeliveryFeeTo: {
            type: String,
            enum: [ "Greater", "Leaser" ],
            required: [ true, "Condition is required" ],
        },
    }
)

export const DeliveryRule = mongoose.model( "DeliveryRule", deliveyRuleSchema );