// attractionRoutes.js
import express from "express";
import { getAttractionById, getAttractions, addAttraction, updateAttraction,addReview } from "../controllers/attractionController.js";

const Attractionrouter = express.Router();

// Route to get all attractions
Attractionrouter.get('/', getAttractions);
Attractionrouter.get('/:id', getAttractionById);
Attractionrouter.post('/add', addAttraction);
Attractionrouter.post('/update', updateAttraction);
Attractionrouter.post('/addReview/:id', addReview);
export { Attractionrouter }; // Export the Attractionrouter;

