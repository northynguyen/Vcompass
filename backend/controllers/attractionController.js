import Attraction from '../models/attraction.js'; // Import the Attraction model
import mongoose from "mongoose"; // Import mongoose (though it's not used here)

// Controller function to get all attractions
const getAttractions = async (req, res) => {
    try {
        const attractions = await Attraction.find(); // Retrieve all attractions
        res.status(200).json({ success: true, attractions }); // Send the attractions as JSON
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ message: 'Server error' }); // Return a server error response
    }
};

export { getAttractions }; // Export the getAttractions;
