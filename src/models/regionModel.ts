import mongoose from "mongoose";

const regionSchema = new mongoose.Schema(
    {
        countryName: {
            type: String,
            required: [ true, "Country Name is required!" ],
        },
        countryAbbreviation: {
            type: String,
            required: [ true, "Country Abbreviation is required!" ],
        },
        states: [
            {
                stateName: {
                    type: String,
                    required: [ true, "State Name is required!" ],
                },
                stateAbbreviation: {
                    type: String,
                    required: [ true, "State Abbreviation is required!" ],
                },
            }
        ],
    },
    {
        timestamps: true,
    }
);

export const Region = mongoose.model( "Region", regionSchema )