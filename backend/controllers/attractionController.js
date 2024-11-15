import Attraction from '../models/attraction.js'; // Import the Attraction model
import mongoose from "mongoose"; // Import mongoose (though it's not used here)
import fs from "fs";
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
const addAttraction = async (req, res) => {
    try {
        const newAttraction = new Attraction(JSON.parse(req.body.attractionData));

        if (req.files) {
            if (req.files.images) {
                const images = req.files.images.map((file) => file.filename);
                newAttraction.images = images;
            }
        }

        await newAttraction.save();

        res.status(201).json({
            success: true,
            message: "Created attraction successfully",
            newAttraction: newAttraction,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error creating attraction",
        });
        console.error("Error:", error);
    }
};

const updateAttraction = async (req, res) => {
    const attractionId = req.params.id;
    const updateData = JSON.parse(req.body.attractionData);
    console.log(JSON.parse(req.body.attractionData))// Parse FormData fields from req.body
    try {
        const attraction = await Attraction.findById(attractionId);
        if (!attraction) {
            return res.status(404).json({ success: false, message: "Attraction not found" });
        }

        // Handle images if provided
        let updatedImages = updateData.images || [];

        // Check if images are provided and process the file uploads
        if (req.files.images) {
            const newImagePaths = req.files.images.map((file) => file.filename);
            updatedImages.push(...newImagePaths);
        }


        // Filter out images to remove (images not present in the new update)
        const imagesToRemove = attraction.images.filter((img) => !updatedImages.includes(img));
        updateData.images = updatedImages;


        // Assign updated fields from updateData to the attraction object
        Object.assign(attraction, updateData);

        // Delete old images asynchronously
        const deleteImage = async (imageName) => {
            try {
                return await fs.promises.unlink(`uploads/${imageName}`);
            } catch (err) {
                console.error(`Failed to delete image ${imageName}:`, err);
            }
        };

        await Promise.all(imagesToRemove.map((image) => deleteImage(image)));

        // Save updated attraction data
        await attraction.save();

        res.status(200).json({
            success: true,
            message: "Updated attraction successfully",
            updatedAttraction: attraction,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: "Error updating attraction" });
        console.error("Error updating attraction:", error);
    }
};

const deleteAttraction = async (req, res) => {
    try {
        const { id: attractionId } = req.params;
        const attraction = await Attraction.findByIdAndDelete(attractionId);
        if (!attraction) {
            return res.status(404).json({ success: false, message: "Attraction not found" });
        }
        res.status(200).json({ success: true, message: "Deleted attraction successfully" });
    } catch (error) {
        console.error("Error deleting attraction:", error);
        res.status(500).json({ success: false, message: "Error deleting attraction" });
    }
};
export { getAttractions, getAttractionById, addAttraction, updateAttraction, deleteAttraction }; // Export the getAttractions;
