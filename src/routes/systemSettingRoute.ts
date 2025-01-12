import express from "express";
import { createSystemSetting, getSystemSettingDetails, getSystemSettings, getSystemSettingValueBySettingUniqueName, updateSystemSetting } from "../controllers/systemSettingController.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

//route - api/v1/systemSetting/new
app.post( "/new", adminOnly, createSystemSetting );

//route - api/v1/systemSetting/all
app.get( "/all", adminOnly, getSystemSettings );

app.route(  "/settingDetails" ).get( getSystemSettingValueBySettingUniqueName );

//route - api/v1/systemSetting/dynamicID
app.route(  "/:id" ).get( getSystemSettingDetails ).put( adminOnly, updateSystemSetting );

export default app;