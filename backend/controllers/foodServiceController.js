import mongoose from "mongoose";
import fs from "fs";
import FoodService from "../models/foodService.js";


const getListFoodService = async (req, res) => {
    try {
        const foodService = await FoodService.find();
        res.status(200).json({success: true,message: "Get list food service successfully", foodService: foodService});
    } catch (error) {
        res.status(404).json({success: false, message: "Error getting food service" });
        console.log(error);
    }
};
export const getFoodServiceById = async (req, res) => {
    const { id } = req.params; // Lấy id từ params
    try {
        // Kiểm tra xem id có hợp lệ hay không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }

        const foodService = await FoodService.findById(id); // Tìm food service theo id

        // Nếu không tìm thấy food service, trả về thông báo lỗi
        if (!foodService) {
            return res.status(404).json({ success: false, message: 'Food service not found' });
        }

        // Trả về thông tin food service dưới dạng JSON
        res.status(200).json({ success: true, message: "Get food service successfully", foodService });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error getting food service", error });
        console.log(error);
    }
};

const getListByPartner = async (req, res) => {
    const  partnerId  = req.body.userId;
    try {
        const foodService = await FoodService.find({ idPartner: partnerId });
        if (!foodService) {
            return res.status(404).json({success: false, message: "Food service not found or partner mismatch" });
        }
        res.status(200).json({success: true,message: "Get list food service successfully", foodService: foodService});
    } catch (error) {
        res.status(404).json({success: false, message: "Error getting food service" });
        console.log(error);
    }
}


const createFoodService = async (req, res) => {
    const  idPartner  = req.body.userId;
    try {
        const newFoodService = new FoodService(req.body.foodServiceData);
        newFoodService.idPartner = idPartner;
        await newFoodService.save();

        // Check and save images if present
        if (req.files) {
            if (req.files.images) {
                const images = req.files.images.map((file) => file.filename);
                newFoodService.images = images;
            }

            // Check and save menuImages if present
            if (req.files.menuImages) {
                const menuImages = req.files.menuImages.map((file) => file.filename);
                newFoodService.menuImages = menuImages;
            }

            await newFoodService.save();
        }

        res.status(201).json({
            success: true,
            message: "Create food service successfully",
            newFoodService: newFoodService,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Error creating food service",
        });
        console.log(error);
    }
};


const updateFoodService = async (req, res) => {
    const foodServiceId = req.body.foodServiceData._id;
    const updateData = req.body.foodServiceData;

    try {
        const foodService = await FoodService.findById(foodServiceId);
        if (!foodService) {
            return res.status(404).json({ success: false, message: "Food service not found" });
        }

        // Handle images and menuImages
        let updatedImages = foodService.images || [];
        let updatedMenuImages = foodService.menuImages || [];

        if (req.files) {
            if (req.files.images) {
                const newImagePaths = req.files.images.map((file) => file.filename);
                updatedImages.push(...newImagePaths);
            }

            if (req.files.menuImages) {
                const newMenuImagePaths = req.files.menuImages.map((file) => file.filename);
                updatedMenuImages.push(...newMenuImagePaths);
            }
        }

        const imagesToRemove = foodService.images.filter((img) => !updatedImages.includes(img));
        const menuImagesToRemove = foodService.menuImages.filter((img) => !updatedMenuImages.includes(img));

        updateData.images = updatedImages;
        updateData.menuImages = updatedMenuImages;

        Object.assign(foodService, updateData);

        // Use fs.promises.unlink for async file deletion
        const deleteImage = async (imageName) => {
            try {
                return await fs.promises.unlink(`uploads/${imageName}`);
            } catch (err) {
                console.error(`Failed to delete image ${imageName}:`, err);
            }
        };

        await Promise.all(imagesToRemove.map((image) => deleteImage(image)));
        await Promise.all(menuImagesToRemove.map((image) => deleteImage(image)));

        await foodService.save();

        res.status(200).json({
            success: true,
            message: "Updated food service successfully",
            updatedFoodService: foodService,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: "Error updating food service" });
        console.error("Error updating food service:", error);
    }
};



const deleteFoodService = async (req, res) => {
    const { foodServiceId, userId } = req.body; // Corrected

    try {
        const foodService = await FoodService.find({ _id: foodServiceId, idPartner: userId });
        if (!foodService) {
            return res.status(404).json({ success: false, message: "Food service not found" });
        }

        // Function to delete images from the file system
        const deleteImage = (imageName) => {
            return new Promise((resolve, reject) => {
                fs.unlink(`uploads/${imageName}`, (err) => {
                    if (err) {
                        console.error(`Failed to delete image ${imageName}:`, err);
                        resolve(); // Continue even if one image fails to delete
                    } else {
                        resolve();
                    }
                });
            });
        };

        // Delete all associated images and menuImages from the file system
        await Promise.all(foodService.images.map((image) => deleteImage(image)));
        await Promise.all(foodService.menuImages.map((image) => deleteImage(image)));

        // Remove the food service from the database
        await foodService.remove();

        res.status(200).json({
            success: true,
            message: "Delete food service successfully",
            deletedFoodService: foodService, // You can return the deleted service if needed
        });
    } catch (error) {
        res.status(400).json({ success: false, message: "Error deleting food service" });
        console.log(error);
    }
};





export { getListFoodService, getListByPartner,createFoodService, updateFoodService, deleteFoodService };