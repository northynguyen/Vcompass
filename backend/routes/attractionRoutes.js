// attractionRoutes.js
import express from "express";
import { getAttractionById, getAttractions,createAttraction } from "../controllers/attractionController.js";

const Attractionrouter = express.Router();

// Route to get all attractions
Attractionrouter.get('/', getAttractions);
Attractionrouter.get('/:id', getAttractionById);
Attractionrouter.post('/createNew', createAttraction);
export { Attractionrouter }; // Export the Attractionrouter;

