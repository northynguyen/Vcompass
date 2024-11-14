import Attraction from '../models/attraction.js'; // Import the Attraction model
import mongoose from "mongoose"; // Import mongoose (though it's not used here)
import fs from "fs";
// Controller function to get all attractions
const getAttractions = async (req, res) => {
    try {
        const { name, minPrice, maxPrice, city } = req.query;

        // Build query object
        const query = {};

        // Add name filter if provided
        if (name) {
            query.attraction_name = { $regex: name, $options: 'i' }; // case-insensitive search
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

        const attraction = await Attraction.findById(id).sort({ createdAt: -1 }); // Tìm attraction theo id

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
        const newAttraction = new Attraction(req.body.attractionData);

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
    const updateData = req.body.attractionData;

    try {
        const attraction = await Attraction.findById(attractionId);
        if (!attraction) {
            return res.status(404).json({ success: false, message: "Attraction not found" });
        }

        // Handle images if provided
        let updatedImages = attraction.images || [];

        if (req.files && req.files.images) {
            const newImagePaths = req.files.images.map((file) => file.filename);
            updatedImages.push(...newImagePaths);
        }

        const imagesToRemove = attraction.images.filter((img) => !updatedImages.includes(img));
        updateData.images = updatedImages;

        // Assign updated fields
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
          return res.status(404).json({success: false, message: "Accommodation not found." });
        }
    
        res.status(200).json({success: true, message: "Review added successfully.", attraction });
      } catch (error) {
        console.error(error);
        res.status(500).json({success: false, message: "An error occurred while adding the review." });
      }
    };
export { getAttractions, getAttractionById, addAttraction, updateAttraction, addReview, deleteAttraction}; // Export the getAttractions;

