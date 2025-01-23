import express from "express";
import { manageState, createRegion, deleteRegion, getRegionDetails, getRegions, updateRegion, removeState } from "../controllers/regionController.js";
import { adminOnly } from "../middlewares/auth.js";
import { createHomePageContent, getHeroSectionData, getHomePageContentDetails, getHomePageContents, updateHomePageContent } from "../controllers/homePageContentController.js";
import multer from "multer";

const multiUpload =  multer().array( "banners", 5 );

const app = express.Router();

//route - api/v1/homePageContent/new
// app.post( "/new", adminOnly, multiUpload, createHomePageContent );

//route - api/v1/homePageContent/all
app.get( "/all", adminOnly, getHomePageContents );

//route - api/v1/homePageContent/hero
app.get( "/hero", getHeroSectionData );

// //route - api/v1/homePageContent/dynamicID
app.route(  "/:id" ).get(  getHomePageContentDetails ).put( adminOnly, multiUpload, updateHomePageContent );

export default app;