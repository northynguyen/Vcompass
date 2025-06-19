import Attraction from '../models/attraction.js'; // Import the Attraction model
import mongoose from "mongoose"; // Import mongoose (though it's not used here)
import userModel from "../models/user.js";
import fs from "fs";
import { uploadToCloudinaryV2, deleteImage } from './videoController.js';
import { createNotification } from "./notiController.js";

// Controller function to get all attractions
const getAttractions = async (req, res) => {
    try {
        const {
            name, // keyword tìm kiếm theo tên hoặc thành phố
            minPrice,
            maxPrice,
            city,
            page = 1,
            limit = 10
        } = req.query;

        // Xây dựng query cơ bản (dùng buildBaseQuery)
        // Nếu có city hoặc name thì truyền vào keyword
        let keyword = name || city || '';
        const baseQuery = buildBaseQuery(keyword, undefined, minPrice, maxPrice);
        // Nếu có city riêng thì thêm vào query
        if (city) {
            baseQuery.city = { $regex: city, $options: 'i' };
        }

        // Lấy dữ liệu attractions (không lọc theo minRating)
        let results = await fetchAttractions(baseQuery, false, undefined);

        // Xử lý phân trang
        const { paginatedData, paginationInfo } = paginateResults(results, page, limit);

        // Trả về kết quả
        return res.status(200).json({
            success: true,
            ...paginationInfo,
            attractions: paginatedData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


const getAttractionById = async (req, res) => {
    const { id } = req.params; // Lấy id từ params
    try {
        // Kiểm tra xem id có hợp lệ hay không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid ID format' });
        }

        // Tìm attraction theo id và populate user info trong ratings
        const attraction = await Attraction.findById(id)
            .populate({
                path: 'ratings.idUser',
                model: 'user',
                select: 'name avatar email'
            });

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
        console.log("Request body:", req.body);

        let attractionData;
        try {
            attractionData = typeof req.body.attractionData === 'string' 
                ? JSON.parse(req.body.attractionData) 
                : req.body.attractionData;
            
            console.log("Parsed attraction data:", attractionData);
        } catch (parseError) {
            console.error("Error parsing attractionData:", parseError);
            return res.status(400).json({
                success: false,
                message: "Invalid attraction data format",
                error: parseError.message
            });
        }

        const newAttraction = new Attraction({
            ...attractionData,
            images: []
        });

        let validImages = [];

        // Handle image uploads to Cloudinary
        if (req.files && req.files.images && req.files.images.length > 0) {
            console.log("Uploading attraction images to Cloudinary...");
            const imagePromises = req.files.images.map(async (file) => {
                try {
                    if (!file.buffer || file.buffer.length === 0) {
                        console.error("Empty file buffer detected:", file.originalname);
                        return null;
                    }
                    
                    console.log(`Uploading file ${file.originalname} with buffer size ${file.buffer.length}`);
                    
                    const result = await uploadToCloudinaryV2(file.buffer, 'attractions', [
                        { width: 800, crop: 'scale' },
                        { quality: 'auto' }
                    ]);
                    
                    if (!result || !result.secure_url) {
                        console.error("Invalid Cloudinary result:", result);
                        return null;
                    }
                    
                    return result.secure_url;
                } catch (err) {
                    console.error(`Error uploading file ${file.originalname}:`, err);
                    return null;
                }
            });
            
            const uploadedImages = await Promise.all(imagePromises);
            console.log("Uploaded attraction images:", uploadedImages);
            
            // Filter out any null values from failed uploads
            validImages = uploadedImages.filter(img => img !== null);
            console.log("Valid images from uploads:", validImages);
        }
        
        // Handle image URLs from request body
        if (req.body.imageUrl) {
            console.log("Processing image URL from request body");
            // Handle single URL
            if (typeof req.body.imageUrl === 'string') {
                validImages.push(req.body.imageUrl);
            } 
            // Handle array of URLs
            else if (Array.isArray(req.body.imageUrl)) {
                validImages = [...validImages, ...req.body.imageUrl.filter(url => url)];
            }
            console.log("Added image URLs:", validImages);
        }
        
        if (validImages.length > 0) {
            newAttraction.images = validImages;
        }

        console.log("Final attraction data to save:", newAttraction);

        await newAttraction.save();

        res.status(201).json({
            success: true,
            message: "Created attraction successfully",
            newAttraction: newAttraction,
        });
    } catch (error) {
        console.error("Error creating attraction:", error);
        res.status(400).json({
            success: false,
            message: "Error creating attraction",
            error: error.message
        });
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
        if (!reviewData.idUser || !reviewData.rate || !reviewData.content) {
            return res.status(400).json({ success: false, message: "Required fields are missing." });
        }

        // Get user information from database
        const user = await userModel.findById(reviewData.idUser);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        // Create a complete rating object with all fields
        const newRating = {
            idUser: reviewData.idUser,
            rate: reviewData.rate,
            content: reviewData.content,
            createdAt: new Date(),
            serviceRate: reviewData.serviceRate || 0,
            attractionRate: reviewData.attractionRate || 0,
        };

        // Find the attraction by ID and add the review to the ratings array
        const attraction = await Attraction.findByIdAndUpdate(
            id,
            { $push: { ratings: newRating } },
            { new: true }
        );

        if (!attraction) {
            return res.status(404).json({ success: false, message: "Attraction not found." });
        }

        // Create notification if needed
        if (attraction.idPartner) {
            const notificationData = {
                idSender: reviewData.idUser,
                idReceiver: attraction.idPartner,
                type: "partner",
                nameSender: user.name,
                imgSender: user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                content: `${user.name} đã đánh giá địa điểm của bạn với điểm ${reviewData.rate} sao.`,
            };

            if (global.io) {
                await createNotification(global.io, notificationData);
            }
        }

        res.status(200).json({ success: true, message: "Review added successfully.", attraction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred while adding the review." });
    }
};

const getAttracWishList = async (req, res) => {
    const { city, name, minPrice, maxPrice } = req.query;

    try {
        // Get userId from token instead of request body since this is now a GET request
        const userId = req.body.userId;
        if (!userId) {
            return res.status(401).json({ success: false, message: "User not authenticated" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let wishListAttractions = await Attraction.find({ _id: { $in: user.favorites.attraction } });
        if (!wishListAttractions.length) {
            return res.json({ success: true, message: "No attractions found in wish list", attractions: [] });
        }

        // Apply filters
        if (city) {
            wishListAttractions = wishListAttractions.filter(attraction => attraction.city.toLowerCase().includes(city.toLowerCase()));
        }
        if (name) {
            wishListAttractions = wishListAttractions.filter(attraction => attraction.attractionName.toLowerCase().includes(name.toLowerCase()));
        }
        if (minPrice) {
            wishListAttractions = wishListAttractions.filter(attraction => attraction.price >= Number(minPrice));
        }
        if (maxPrice) {
            wishListAttractions = wishListAttractions.filter(attraction => attraction.price <= Number(maxPrice));
        }

        res.status(200).json({ success: true, attractions: wishListAttractions });
    } catch (error) {
        console.error("Error retrieving wish list attractions:", error);
        res.status(500).json({ success: false, message: "Error retrieving wish list attractions" });
    }
};

export const searchAttractions = async (req, res) => {
    try {
        const { 
            amenities, 
            minRating, 
            minPrice, 
            maxPrice, 
            keyword, 
            page = 1, 
            limit = 10 
        } = req.query;

        // Xây dựng query cơ bản
        const baseQuery = buildBaseQuery(keyword, amenities, minPrice, maxPrice);
        
        // Xác định phương thức lấy dữ liệu (aggregation hoặc find thông thường)
        const needRatingFilter = !!minRating;
        let results = await fetchAttractions(baseQuery, needRatingFilter, minRating);
        
        // Xử lý phân trang
        const { paginatedData, paginationInfo } = paginateResults(results, page, limit);
        
        // Trả về kết quả
        return res.status(200).json({
            success: true,
            ...paginationInfo,
            data: paginatedData,
        });
    } catch (error) {
        console.error("Error in searchAttractions:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Lỗi server khi tìm kiếm điểm tham quan!", 
            error: error.message 
        });
    }
};

// Hàm xây dựng query cơ bản
function buildBaseQuery(keyword, amenities, minPrice, maxPrice) {
    const query = {};

    // Tìm theo amenities (mảng)
    if (amenities) {
        const amenitiesArray = amenities.split(",");
        query.amenities = { $all: amenitiesArray }; // Lọc những attraction có tất cả amenities trong danh sách
    }

    // Lọc theo khoảng giá
    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Tìm kiếm theo từ khóa
    if (keyword) {
        query.$or = [
            { attractionName: { $regex: keyword, $options: "i" } }, // Tìm trong tên
            { city: { $regex: keyword, $options: "i" } }           // Tìm trong thành phố
        ];
    }

    return query;
}

// Hàm fetch dữ liệu từ database
async function fetchAttractions(query, needRatingFilter, minRating) {
    if (needRatingFilter) {
        // Sử dụng aggregation pipeline để lọc theo rating trung bình
        return await Attraction.aggregate([
            { $match: query },
            {
                $addFields: {
                    averageRating: {
                        $cond: {
                            if: { $gt: [{ $size: "$ratings" }, 0] },
                            then: { $avg: "$ratings.rate" },
                            else: 0
                        }
                    }
                }
            },
            { $match: { averageRating: { $gte: Number(minRating) } } },
            { $sort: { averageRating: -1 } }
        ]);
    } else {
        // Lấy dữ liệu thông thường, sau đó bổ sung thông tin rating trung bình
        const attractions = await Attraction.find(query);
        
        return attractions.map(attraction => {
            const ratings = attraction.ratings || [];
            const averageRating = ratings.length > 0
                ? ratings.reduce((sum, rating) => sum + rating.rate, 0) / ratings.length
                : 0;
            
            const attractionObj = attraction.toObject ? attraction.toObject() : attraction;
            return {
                ...attractionObj,
                averageRating: parseFloat(averageRating.toFixed(1))
            };
        });
    }
}

// Hàm xử lý phân trang
function paginateResults(results, page, limit) {
    const numPage = Math.max(1, Number(page));
    const numLimit = Math.min(50, Math.max(1, Number(limit))); // Giới hạn từ 1-50 bản ghi/trang
    
    const total = results.length;
    const skip = (numPage - 1) * numLimit;
    const paginatedData = results.slice(skip, skip + numLimit);

    return {
        paginatedData,
        paginationInfo: {
            total,
            page: numPage,
            totalPages: Math.ceil(total / numLimit)
        }
    };
}

export { getAttractions, getAttractionById, addAttraction, updateAttraction, addReview, deleteAttraction, getAttracWishList }; 
