import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
    {
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
            required: [ true, "Road name, Area, colony is required" ]
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
            required: [ true, "Please enter pin code" ],
        },
        user: {
            type: String,
            ref: "User",
            required: true,
        },
        isDefault: {
            type: Boolean,
            required: true,
        }
    },{ timestamps: true }
);

export const Address = mongoose.model( "Address", addressSchema );