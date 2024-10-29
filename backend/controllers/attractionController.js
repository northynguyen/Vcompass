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

const getAttractionById = async (req, res) => {
    const { id } = req.params; // Lấy id từ params
    try {
        // Kiểm tra xem id có hợp lệ hay không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }

        const attraction = await Attraction.findById(id); // Tìm attraction theo id

        // Nếu không tìm thấy attraction, trả về thông báo lỗi
        if (!attraction) {
            return res.status(404).json({ success: false, message: 'Attraction not found' });
        }

        // Trả về thông tin attraction dưới dạng JSON
        res.status(200).json({ success: true, attraction });
    } catch (error) {
        console.error(error); // Log lỗi để debug
        res.status(500).json({ message: 'Server error' }); // Trả về lỗi server
    }
};

const createAttraction = async (req, res) => {
    try {
        const attraction = await Attraction.create(req.body.attraction); // Create a new attraction
        res.status(201).json({ success: true, message: 'Attraction created successfully', attraction }); // Send the created attraction as JSON
    } catch (error) {
        console.error(error); // Log linaire debug
        res.status(500).json({ message: 'Server error' }); // Trả về lỗi server
    }
};

export { getAttractions, getAttractionById,createAttraction }; // Export the getAttractions;
