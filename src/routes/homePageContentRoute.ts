import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { createHomePageContent, getHeroSectionData, getHomePageContentDetails, getHomePageContents, updateHomePageContent } from "../controllers/homePageContentController.js";
import multer from "multer";
import ErrorHandler from "../utils/utility-class.js";

const upload = multer({
    fileFilter: (req, file, cb) => {
        if (file.fieldname === "banners" && !file.mimetype.startsWith("image/")) {
            return cb(new ErrorHandler("Only image files are allowed for banners!", 400));
        }
        if (file.fieldname === "promotionalVideo" && !file.mimetype.startsWith("video/")) {
            return cb(new ErrorHandler("Only video files are allowed for promotional video!", 400));
        }
        cb(null, true);
    },
}).fields([
    { name: "banners", maxCount: 5 },
    { name: "promotionalVideo", maxCount: 1 },
]);

const app = express.Router();

//route - api/v1/homePageContent/new
// app.post( "/new", upload, createHomePageContent );

//route - api/v1/homePageContent/all
app.get( "/all", adminOnly, getHomePageContents );

//route - api/v1/homePageContent/hero
app.get( "/hero", getHeroSectionData );

// //route - api/v1/homePageContent/dynamicID
app.route(  "/:id" ).get(  getHomePageContentDetails ).put( adminOnly, upload, updateHomePageContent );

export default app;