import mongoose from "mongoose";

const HomePageContentSchema = new mongoose.Schema({
    banners: [
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
    productSections: [
        {
            filters: [
                {
                    key: { type: String,
                        required: true,
                        enum:[ "name", "category", "price", "ratings", "numOfReviews", "stock", "createdAt" ]
                    },
                    value: { type: String, required: true }
                }
            ],
            sectionLabel: {
                type: String,
                required: [true, "Product Section Label is required!"],
            },
        }
    ],
    promotionalText: {
        type: String,
        required: [ true, "Promotional Text is required!" ]
    },
});

export const HomePageContent = mongoose.model( "HomePageContent", HomePageContentSchema );