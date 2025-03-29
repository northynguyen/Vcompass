import Attraction from '../models/attraction.js'; // Import the Attraction model
import mongoose from "mongoose"; // Import mongoose (though it's not used here)
import userModel from "../models/user.js";
import fs from "fs";
import { uploadToCloudinaryV2, deleteImage } from './videoController.js';

// Controller function to get all attractions
const getAttractions = async (req, res) => {
    try {
        const { name, minPrice, maxPrice, city } = req.query;

        // Build query object
        const query = {};

        // Add name filter if provided
        if (name) {
            query.$or = [
                { attractionName: { $regex: name, $options: 'i' } }, // Tìm kiếm trong tên địa điểm
                { city: { $regex: name, $options: 'i' } }, // Tìm kiếm trong tên thành phố
            ];
        }

        // Add price range filter if provided
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Add city filter if provided
        if (city) {
            query.city = { $regex: city, $options: 'i' };
        }

        // Execute query
        const attractions = await Attraction.find(query);

        res.status(200).json({
            success: true,
            attractions: attractions
        });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({
            message: 'Server error'
        });
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
                // Upload images to Cloudinary instead of storing filenames
                const imagePromises = req.files.images.map(async (file) => {
                    const result = await uploadToCloudinaryV2(file.buffer, 'attractions', [
                        { width: 800, crop: 'scale' },
                        { quality: 'auto' }
                    ]);
                    return result.secure_url;
                });
                
                const images = await Promise.all(imagePromises);
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
    console.log(JSON.parse(req.body.attractionData))
    try {
        const attraction = await Attraction.findById(attractionId);
        if (!attraction) {
            return res.status(404).json({ success: false, message: "Attraction not found" });
        }

        // Handle images if provided
        let updatedImages = updateData.images || [];

        // Check if images are provided and process the file uploads
        if (req.files && req.files.images) {
            const imagePromises = req.files.images.map(async (file) => {
                const result = await uploadToCloudinaryV2(file.buffer, 'attractions', [
                    { width: 800, crop: 'scale' },
                    { quality: 'auto' }
                ]);
                return result.secure_url;
            });
            
            const newImageUrls = await Promise.all(imagePromises);
            updatedImages.push(...newImageUrls);
        }

        // Filter out images to remove (images not present in the new update)
        const imagesToRemove = attraction.images.filter((img) => !updatedImages.includes(img));
        updateData.images = updatedImages;

        // Assign updated fields from updateData to the attraction object
        Object.assign(attraction, updateData);

        // Delete old images from Cloudinary
        const deletePromises = imagesToRemove.map(async (imageUrl) => {
            // Extract public_id from the Cloudinary URL
            const publicId = imageUrl.split('/').pop().split('.')[0];
            try {
                await deleteImage({ imagePath: `attractions/${publicId}` });
            } catch (err) {
                console.error(`Failed to delete image ${imageUrl}:`, err);
            }
        });

        await Promise.all(deletePromises);

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

const addReview = async (req, res) => {
    const id = req.params.id;
    try {
        const reviewData = req.body; // Data for the new review
        console.log(reviewData);
        // Validate the required fields for the rating
        if (!reviewData.idUser || !reviewData.userName || !reviewData.userImage || !reviewData.rate || !reviewData.content) {
            return res.status(400).json({ success: false, message: "Required fields are missing." });
        }

        // Find the accommodation by ID and add the review to the ratings array
        const attraction = await Attraction.findByIdAndUpdate(
            id,
            { $push: { ratings: reviewData } },
            { new: true }
        );

        if (!attraction) {
            return res.status(404).json({ success: false, message: "Accommodation not found." });
        }

        res.status(200).json({ success: true, message: "Review added successfully.", attraction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred while adding the review." });
    }
};

const getAttracWishList = async (req, res) => {
    const { userId } = req.body; 

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const wishListAttractions = await Attraction.find({ _id: { $in: user.favorites.attraction } });
        if (!wishListAttractions.length) {
            return res.json({ success: true, message: "No attractions found in wish list", attractions: [] });
        }

        res.status(200).json({ success: true, attractions: wishListAttractions });
    } catch (error) {
        console.error("Error retrieving wish list attractions:", error);
        res.status(500).json({ success: false, message: "Error retrieving wish list attractions" });
    }
}

export { getAttractions, getAttractionById, addAttraction, updateAttraction, addReview, deleteAttraction, getAttracWishList }; // Export the getAttractions;

