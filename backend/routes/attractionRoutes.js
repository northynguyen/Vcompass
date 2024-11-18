// attractionRoutes.js
import express from "express";
import { addAttraction, addReview, deleteAttraction, getAttractionById, getAttractions, updateAttraction } from "../controllers/attractionController.js";
import { upload } from "../middleware/upload.js";
const Attractionrouter = express.Router();

// Route to get all attractions
Attractionrouter.get('/', getAttractions);
Attractionrouter.get('/:id', getAttractionById);
Attractionrouter.post('/', upload.fields([{ name: "images", maxCount: 5 }]), addAttraction);
Attractionrouter.put('/:id', upload.fields([{ name: "images", maxCount: 5 }]), updateAttraction);
Attractionrouter.delete('/:id', deleteAttraction)
Attractionrouter.post('/addReview/:id', addReview);
export { Attractionrouter }; // Export the Attractionrouter;

