import mongoose from "mongoose";

const productModifierSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [ true, "Product Modifier Name is required!" ],
        }
    },
    {
        timestamps: true,
    }
);

export const ProductModifier = mongoose.model( "ProductModifier", productModifierSchema )