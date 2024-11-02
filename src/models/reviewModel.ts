import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        comment: {
            type: String,
            maxlength: [ 200, "Comment must not be more than 200 characters" ],
        },
        rating: {
            type: Number,
            required: [ true, "Please give rating" ],
            min: [ 1, "rating must be at least 1" ],
            max: [ 5, "Rating must not be more than 5" ],
        },
        user: {
            type: String,
            ref: "User",
            required: true,
        },
        product: {
            type: mongoose.Types.ObjectId,
            ref: "Product",
            required: true
        }
    },{ timestamps: true }
)

export const Review = mongoose.model( "Review", reviewSchema );