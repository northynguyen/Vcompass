import Accommodation from "../models/accommodation.js";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";

export const getList = async (req, res) => {
  const { partnerId } = req.params;
  try {
    const accommodations = await Accommodation.find({ idPartner: partnerId });
    res.json({success: true, accommodations});
  } catch (error) {
    res.json({ success: false, message: "Error retrieving accommodations", error });
  }
};


export const addNew = async (req, res) => {
  const { partnerId } = req.params;
  const accommodationData =  req.body ;
  if (typeof accommodationData.location === 'string') {
    accommodationData.location = JSON.parse(accommodationData.location);
  }

  // Parse contact if it's a string
  if (typeof accommodationData.contact === 'string') {
    accommodationData.contact = JSON.parse(accommodationData.contact);
  }

  try {
    const newAccommodation = new Accommodation({
      ...accommodationData, 
      idPartner: partnerId,
      images: req.files ? req.files.map(file => file.filename) : [] // Store uploaded images
    });

   
    await newAccommodation.save();
    res.json({ success: true, message: "Accommodation added successfully", accommodation: newAccommodation });
  } catch (error) {
    res.json({ success: false, message: "Error adding new accommodation", error });
    console.error(error);
  }
};

// Update an accommodation by partnerId and accommodationId
export const updateAccommodation = async (req, res) => {
  const { partnerId, id } = req.params;
  const updateData = req.body;

  try {
    const accommodation = await Accommodation.findOne({ _id: id, idPartner: partnerId });
    if (!accommodation) {
      return res.json({ success: false, message: "Accommodation not found or partner mismatch" });
    }

    // Ensure updateData.images is an array
    const updatedImages = updateData.images ? updateData.images : [];
    
    // Handle new uploaded images, if any
    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map((file) => file.filename);
      updatedImages.push(...newImagePaths);
    }

    // Ensure existingImages is an array
    const existingImages = accommodation.images ? accommodation.images : [];

    // Filter out images that should be removed
    const imagesToRemove = existingImages.filter(img => updatedImages.includes(img) === false);

    // Update accommodation images
    updateData.images = updatedImages;

    // Parse location if it's a string
    if (typeof updateData.location === 'string') {
      updateData.location = JSON.parse(updateData.location);
    }

    // Parse contact if it's a string
    if (typeof updateData.contact === 'string') {
      updateData.contact = JSON.parse(updateData.contact);
    }

    // Merge updated data into the existing accommodation
    Object.assign(accommodation, updateData);

    // Function to delete an image from the server
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

    // Delete all images that are no longer associated with the accommodation
    await Promise.all(imagesToRemove.map(image => deleteImage(image)));

    // Save the updated accommodation
    await accommodation.save();

    res.json({ success: true, message: "Accommodation updated successfully", accommodation });
  } catch (error) {
    res.json({ success: false, message: "Error updating accommodation", error });
    console.error(error);
  }
};




// Add a new room type to an accommodation by partnerId and accommodationId
export const addNewRoom = async (req, res) => {
  const { accommodationId } = req.params;
  const roomTypeData = req.body;

  const requiredFields = ['nameRoomType', 'roomSize', 'pricePerNight', 'status', 'numPeople', 'amenities'];
  
  for (const field of requiredFields) {
    if (!roomTypeData[field]) {
      return res.json({ success: false, message: `Missing required field: ${field}` });
    }
  }

  try {
    const accommodation = await Accommodation.findOne({ _id: accommodationId });
    if (!accommodation) {
      return res.json({ success: false, message: "Accommodation not found or partner mismatch" });
    }

    const existingRoomType = accommodation.roomTypes.find(room => room.nameRoomType.toLowerCase() === roomTypeData.nameRoomType.toLowerCase());
    if (existingRoomType) {
      return res.json({ success: false, message: "Room type already exists" });
    }

    const newRoomType = {
      idRoomType: new mongoose.Types.ObjectId(),
      ...roomTypeData,
      images: req.files ? req.files.map(file => file.filename) : [] // Store uploaded images
    };

    accommodation.roomTypes.push(newRoomType); // Add new room type
    await accommodation.save();

    res.json({ success: true, message: "Room type added successfully", rooms: accommodation.roomTypes });
  } catch (error) {
    console.error('Error adding new room type:', error);
    res.json({ success: false, message: "Error adding new room type" });
  }
};


export const deleteRoom = async (req, res) => {
  const { accommodationId, roomTypeId } = req.params;
  
  try {
    const accommodation = await Accommodation.findOne({ _id: accommodationId });
    if (!accommodation) {
      return res.json({ success: false, message: "Accommodation not found or partner mismatch" });
    }

    const roomTypeIndex = accommodation.roomTypes.findIndex(element => element.idRoomType === roomTypeId);
    if (roomTypeIndex === -1) {
      return res.json({ success: false, message: "Room type not found" });
    }

    const roomType = accommodation.roomTypes[roomTypeIndex];

    // Remove images from server before deleting room type
    roomType.images.forEach(image => {
      fs.unlink(`uploads/${image}`, err => {
        if (err) console.error("Error deleting old image:", err);
        else console.log(`Successfully deleted old image: ${imagePath}`);
      });
    });

    accommodation.roomTypes.splice(roomTypeIndex, 1); // Delete the room type

    await accommodation.save();

    res.json({ success: true, message: "Room type deleted successfully", rooms: accommodation.roomTypes });
  } catch (error) {
    res.json({ success: false, message: "Error deleting room type", error });
    console.error(error);
  }
};


export const  listRooms = async (req, res) => {
  const {  accommodationId } = req.params;
  try {
    const accommodation = await Accommodation.findOne({ _id: accommodationId});
    if (!accommodation) {
      return res.json({success: false, message: "Accommodation not found or partner mismatch" });
    }
    res.json({success: true, rooms: accommodation.roomTypes});
  } catch (error) {
    res.json({success: false, message: "Error getting rooms", error });
  }
}


export const updateRoomType = async (req, res) => {
  const { accommodationId, roomTypeId } = req.params;

  try {
    // Fetch the accommodation by ID
    const accommodation = await Accommodation.findById(accommodationId);
    if (!accommodation) {
      return res.status(404).json({ success: false, message: "Accommodation not found." });
    }

    // Find the specific room type within the accommodation
    const roomType = accommodation.roomTypes.find((element) => element.idRoomType === roomTypeId);
    if (!roomType) {
      return res.status(404).json({ success: false, message: "Room type not found." });
    }

    const roomTypeUpdate = JSON.parse(req.body.roomTypeUpdate);
    let updatedImages = roomTypeUpdate.images || [];

    if (req.files && req.files.length > 0) {
      const newImagePaths = req.files.map((file) => file.filename);
      updatedImages = updatedImages.concat(newImagePaths);
    }

    const existingImages = roomType.images || [];
    const imagesToRemove = existingImages.filter(img => !roomTypeUpdate.images.includes(img));

    roomTypeUpdate.images = updatedImages;

    Object.assign(roomType, roomTypeUpdate);


    const deleteImage = (imageName) => {
      return new Promise((resolve, reject) => {
        fs.unlink((`uploads/${imageName}`), (err) => {
          if (err) {
            console.error(`Failed to delete image ${imageName}:`, err);
            // Decide whether to reject or resolve based on your needs
            // Here, we resolve to continue even if one image fails to delete
            resolve();
          } else {
            resolve();
          }
        });
      });
    };

    // Delete all images that are no longer associated with the room
    await Promise.all(imagesToRemove.map(image => deleteImage(image)));
    await accommodation.save();

    res.json({
      success: true,
      message: "Room type updated successfully.",
      rooms: accommodation.roomTypes,
    });
  } catch (error) {
    console.error("Error updating room type:", error);
    res.status(500).json({ success: false, message: "Error updating room type.", error: error.message });
  }
};