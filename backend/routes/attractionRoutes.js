// attractionRoutes.js
import express from "express";
import { getAttractionById, getAttractions } from "../controllers/attractionController.js";

const Attractionrouter = express.Router();

// Route to get all attractions
Attractionrouter.get('/', getAttractions);
Attractionrouter.get('/:id', getAttractionById);
export { Attractionrouter }; // Export the Attractionrouter;

