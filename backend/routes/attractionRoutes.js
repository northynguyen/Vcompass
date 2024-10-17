// attractionRoutes.js
import express from "express";
import { getAttractions } from "../controllers/attractionController.js";

const Attractionrouter = express.Router();

// Route to get all attractions
Attractionrouter.get('/', getAttractions);

export { Attractionrouter }; // Export the Attractionrouter;
