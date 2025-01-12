import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
    {
        settingCategory: {
            type: String,
            required: [ true, "Setting Category is required" ],
        },
        settingUniqueName: {
            type: String,
            required: [ true, "Setting Unique Name is required" ],
        },
        settingName: {
            type: String,
            required: [ true, "Setting Name is required" ],
        },
        settingValue: {
            type: String,
            required: [ true, "Setting Value is required" ],
        },
        entityId: {
            type: String,
        },
    }
)

export const SystemSetting = mongoose.model( "SystemSetting", systemSettingSchema );