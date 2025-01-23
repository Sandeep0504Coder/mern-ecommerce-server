import express from "express";
import { manageState, createRegion, deleteRegion, getRegionDetails, getRegions, updateRegion, removeState } from "../controllers/regionController.js";
import { adminOnly } from "../middlewares/auth.js";

const app = express.Router();

//route - api/v1/region/new
app.post( "/new", adminOnly, createRegion );

//route - api/v1/region/all
app.get( "/all", getRegions );

//route - api/v1/region/manageState/regionId/dynamicID/stateId/dynamicID
app.route(  "/manageState/regionId/:regionId/stateId/:stateId" ).put( adminOnly, manageState );

//route - api/v1/region/removeState/regionId/dynamicID/stateId/dynamicID
app.route(  "/removeState/regionId/:regionId/stateId/:stateId" ).put( adminOnly, removeState );

//route - api/v1/region/dynamicID
app.route(  "/:id" ).get( adminOnly, getRegionDetails ).put( adminOnly, updateRegion ).delete( adminOnly, deleteRegion );

export default app;