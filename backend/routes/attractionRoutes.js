// attractionRoutes.js
import express from "express";
import { getAttractionById, getAttractions, addAttraction, updateAttraction, deleteAttraction } from "../controllers/attractionController.js";
import { upload } from "../middleware/upload.js";
const Attractionrouter = express.Router();

// Route to get all attractions
Attractionrouter.get('/', getAttractions);
Attractionrouter.get('/:id', getAttractionById);
Attractionrouter.post('/', upload.fields([{ name: "images", maxCount: 5 }]), addAttraction);
Attractionrouter.put('/:id', upload.fields([{ name: "images", maxCount: 5 }]), updateAttraction);
Attractionrouter.delete('/:id', deleteAttraction)
export { Attractionrouter }; // Export the Attractionrouter;

