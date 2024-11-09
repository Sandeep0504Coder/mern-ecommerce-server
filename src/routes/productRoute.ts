import express from "express";
import { adminOnly } from "../middlewares/auth.js";
import { addEditReview, allReviewsOfProduct, createProduct, deleteProduct, deleteReview, getAdminProducts, getAllProducts, getLatestProducts, getProductCategories, getProductDetails, manageProductRecommendation, updateProduct } from "../controllers/productController.js";
import { multiUpload } from "../middlewares/multer.js";

const app = express.Router();

//To Create New Product - api/v1/product/new
app.post( "/new", adminOnly, multiUpload, createProduct );

//To get all products with filters - api/v1/product/all
app.get( "/all", getAllProducts );

//To get last 10 products - api/v1/product/latest
app.get( "/latest", getLatestProducts );

//To get all unique categories - api/v1/product/categories
app.get( "/categories", getProductCategories );

//To get all products - api/v1/product/admin-products
app.get( "/admin-products", adminOnly, getAdminProducts );

app.route( "/:id" ).get( getProductDetails ).put( adminOnly, multiUpload, updateProduct ).delete( adminOnly, deleteProduct );

app.get( "/reviews/:id", allReviewsOfProduct );
app.post( "/review/new/:id", addEditReview );
app.delete( "/review/:id", deleteReview );
app.put( "/manage-recommendations/:id", adminOnly, manageProductRecommendation );

export default app;