import { useState, useContext } from 'react';
import './AddEditRoomForm.css';
import { StoreContext } from '../../../Context/StoreContext';
import { toast } from 'react-toastify';


const AddEditRoomForm = ({ room = {}, onSave, onCancel }) => {
    const { url } = useContext(StoreContext);
    
    const [formData, setFormData] = useState({
      nameRoomType: room.nameRoomType || '',
      numBed: room.numBed || [{ nameBed: '', number: 1 }],
      numPeople: room.numPeople || { adult: 1, child: 0 },
      roomSize: room.roomSize || '',
      pricePerNight: room.pricePerNight || 0,
      status: room.status || 'Available',
      description: room.description || '',
      amenities: room.amenities || [],
    });
  
    // Separate states for existing and new images
    const [existingImages, setExistingImages] = useState(room.images || []);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
  
    // Handle textual form fields
    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };
  
    // Handle bed information
    const handleNumBedChange = (index, field, value) => {
      setFormData((prevData) => {
        const updatedNumBed = [...prevData.numBed];
        if (field === 'number') {
          updatedNumBed[index][field] = Number(value);
        } else {
          updatedNumBed[index][field] = value;
        }
        return { ...prevData, numBed: updatedNumBed };
      });
    };
  
    const handleNumBedAdd = () => {
      setFormData((prevData) => ({
        ...prevData,
        numBed: [...prevData.numBed, { nameBed: '', number: 1 }],
      }));
    };
  
    const handleNumBedRemove = (index) => {
      setFormData((prevData) => {
        const updatedNumBed = prevData.numBed.filter((_, idx) => idx !== index);
        return { ...prevData, numBed: updatedNumBed };
      });
    };
  
    // Handle number of people
    const handlePeopleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        numPeople: { ...formData.numPeople, [name]: value },
      });
    };
  
    // Handle amenities
    const handleAmenitiesChange = (e) => {
      const { value, checked } = e.target;
      setFormData((prevData) => {
        const amenities = checked
          ? [...prevData.amenities, value]
          : prevData.amenities.filter((amenity) => amenity !== value);
        return { ...prevData, amenities };
      });
    };
  
    // Handle existing image removal
    const handleExistingImageRemove = (index) => {
      setExistingImages((prevImages) => prevImages.filter((_, idx) => idx !== index));
    };
  
    // Handle new image uploads
    const handleNewImageChange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length + newImages.length + existingImages.length > 8) {
        alert('Bạn chỉ có thể chọn tối đa 8 hình ảnh.');
        return;
      }
  
      setNewImages((prevFiles) => [...prevFiles, ...files]);
  
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setNewImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
    };
  
    const handleNewImageRemove = (index) => {
      setNewImages((prevFiles) => prevFiles.filter((_, idx) => idx !== index));
      setNewImagePreviews((prevPreviews) => prevPreviews.filter((_, idx) => idx !== index));
    };
  
    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      // Validate numBed entries
      const isValid = formData.numBed.every((bed) => bed.number && bed.nameBed);
      if (!isValid) {
        alert('Please fill out all bed details properly.');
        return;
      }
  
      // Create FormData object
      const formDataToSend = new FormData();
  
      // Append textual data as JSON
      const roomData = {
        ...room,
        ...formData,
        images: existingImages, // Send the updated list of existing images
      };
      formDataToSend.append('roomTypeUpdate', JSON.stringify(roomData));
  
      // Append new image files
      newImages.forEach((file) => {
        formDataToSend.append('newImages', file);
      });
  
      try {
        await onSave(formDataToSend);
      } catch (error) {
        console.error('Error saving room:', error);
        toast.error('Có lỗi xảy ra khi lưu phòng.');
      }
    };
  
    return (
      <form className="add-edit-form" onSubmit={handleSubmit}>
        {/* Room Type Name */}
        <label>
          Room Type Name:
          <input
            type="text"
            name="nameRoomType"
            value={formData.nameRoomType}
            onChange={handleChange}
            required
          />
        </label>
  
        {/* Number of Beds */}
        <label>
          Number of Beds:
          {formData.numBed.map((bed, index) => (
            <div key={index} className="bed-entry">
              <input
                type="text"
                value={bed.nameBed}
                onChange={(e) => handleNumBedChange(index, 'nameBed', e.target.value)}
                placeholder="Bed Type"
                required
              />
              <input
                type="number"
                value={bed.number}
                onChange={(e) => handleNumBedChange(index, 'number', e.target.value)}
                placeholder="Quantity"
                min="1"
                required
              />
              <button type="button" onClick={() => handleNumBedRemove(index)}>x</button>
            </div>
          ))}
          <button type="button" onClick={handleNumBedAdd}>+</button>
        </label>
  
        {/* Number of People */}
        <label>
          Number of People (Adults & Children):
          <div>
            <input
              type="number"
              name="adult"
              value={formData.numPeople.adult}
              onChange={handlePeopleChange}
              placeholder="Adults"
              min="1"
              required
            />
            <input
              type="number"
              name="child"
              value={formData.numPeople.child}
              onChange={handlePeopleChange}
              placeholder="Children"
              min="0"
            />
          </div>
        </label>
  
        {/* Room Size */}
        <label>
          Room Size (sqm):
          <input
            type="number"
            name="roomSize"
            value={formData.roomSize}
            onChange={handleChange}
            min="1"
            required
          />
        </label>
  
        {/* Price Per Night */}
        <label>
          Price Per Night:
          <div className="price-control">
            <input
              type="number"
              name="pricePerNight"
              value={formData.pricePerNight}
              onChange={handleChange}
              min="0"
              step="1"
              required
            />
            $/Night
          </div>
        </label>
  
        {/* Status */}
        <label>
          Status:
          <select name="status" value={formData.status} onChange={handleChange} required>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
          </select>
        </label>
  
        {/* Description */}
        <label>
          Description:
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </label>
  
        {/* Amenities */}
        <label>
          Amenities:
          <div className="amenities-list">
            {[
              'Wi-Fi',
              'Breakfast Included',
              'Gym Access',
              'Swimming Pool',
              'Spa',
              'Air Conditioning',
              'Mini Bar',
              'Balcony',
            ].map((amenity) => (
              <label key={amenity}>
                <input
                  type="checkbox"
                  value={amenity}
                  checked={formData.amenities.includes(amenity)}
                  onChange={handleAmenitiesChange}
                />
                {amenity}
              </label>
            ))}
          </div>
        </label>
  
        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div className="existing-images">
            <h4>Existing Images:</h4>
            <div className="image-previews">
              {existingImages.map((img, idx) => (
                <div key={idx} className="image-preview">
                  <img src={`${url}/images/${img}`} alt={`Existing Room ${idx + 1}`} />
                  <button type="button" onClick={() => handleExistingImageRemove(idx)}>x</button>
                </div>
              ))}
            </div>
          </div>
        )}
  
        {/* New Image Upload */}
        <label>
          Upload New Images:
          <input
            type="file"
            name="newImages"
            accept="image/*"
            multiple
            onChange={handleNewImageChange}
          />
        </label>
  
        {/* New Image Previews */}
        {newImagePreviews.length > 0 && (
          <div className="new-image-previews">
            <h4>New Images:</h4>
            <div className="image-previews">
              {newImagePreviews.map((img, idx) => (
                <div key={idx} className="image-preview">
                  <img src={img} alt={`New Room ${idx + 1}`} />
                  <button type="button" onClick={() => handleNewImageRemove(idx)}>x</button>
                </div>
              ))}
            </div>
          </div>
        )}
  
        {/* Form Buttons */}
        <div className="form-buttons">
          <button type="submit" className="save-button">Save</button>
          <button type="button" onClick={onCancel} className="cancel-button">Cancel</button>
        </div>
      </form>
    );
  };
  

  export default AddEditRoomForm