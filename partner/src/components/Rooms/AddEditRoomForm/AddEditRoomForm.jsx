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
      console.log(roomData);
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
  {/* Tên loại phòng */}
  <label>
    Tên loại phòng:
    <input
      type="text"
      name="nameRoomType"
      value={formData.nameRoomType}
      onChange={handleChange}
      required
    />
  </label>

  {/* Số lượng giường */}
  <label>
    Số lượng giường:
    {formData.numBed.map((bed, index) => (
      <div key={index} className="bed-entry">
        <input
          type="text"
          value={bed.nameBed}
          onChange={(e) => handleNumBedChange(index, 'nameBed', e.target.value)}
          placeholder="Loại giường"
          required
        />
        <input
          type="number"
          value={bed.number}
          onChange={(e) => handleNumBedChange(index, 'number', e.target.value)}
          placeholder="Số lượng"
          min="1"
          required
        />
        <button type="button" className="remove-roombed-btn" onClick={() => handleNumBedRemove(index)}>x</button>
      </div>
    ))}
    <button type="button" className="add-roombed-btn" onClick={handleNumBedAdd}>+</button>
  </label>

  {/* Số người */}
  <label>
    Số người (Người lớn & Trẻ em):
    <div>
      <input
        type="number"
        name="adult"
        value={formData.numPeople.adult}
        onChange={handlePeopleChange}
        placeholder="Người lớn"
        min="1"
        required
      />
      <input
        type="number"
        name="child"
        value={formData.numPeople.child}
        onChange={handlePeopleChange}
        placeholder="Trẻ em"
        min="0"
      />
    </div>
  </label>

  {/* Diện tích phòng */}
  <label>
    Diện tích phòng (m²):
    <input
      type="number"
      name="roomSize"
      value={formData.roomSize}
      onChange={handleChange}
      min="1"
      required
    />
  </label>

  {/* Giá mỗi đêm */}
  <label>
    Giá mỗi đêm:
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
      $/Đêm
    </div>
  </label>

  {/* Trạng thái */}
  <label>
    Trạng thái:
    <select name="status" value={formData.status} onChange={handleChange} required>
      <option value="Available">Còn trống</option>
      <option value="Occupied">Đã đặt</option>
    </select>
  </label>

  {/* Mô tả */}
  <label>
    Mô tả:
    <textarea
      className="des-textarea"
      name="description"
      value={formData.description}
      onChange={handleChange}
      required
    />
  </label>

  {/* Tiện nghi */}
  <label>
    Tiện nghi:
    <div className="amenities-list">
      {[
        'Wi-Fi',
        'Bao gồm bữa sáng',
        'Phòng tập gym',
        'Hồ bơi',
        'Spa',
        'Điều hòa',
        'Tủ lạnh mini',
        'Ban công',
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

  {/* Hình ảnh hiện tại */}
  {existingImages.length > 0 && (
    <div className="existing-images">
      <h4>Hình ảnh hiện tại:</h4>
      <div className="image-previews">
        {existingImages.map((img, idx) => (
          <div key={idx} className="image-preview">
            <img src={`${url}/images/${img}`} alt={`Hình phòng ${idx + 1}`} />
            <button type="button" onClick={() => handleExistingImageRemove(idx)}>x</button>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Tải hình ảnh mới */}
  <label>
    Tải hình ảnh mới:
    <input
      type="file"
      name="newImages"
      accept="image/*"
      multiple
      onChange={handleNewImageChange}
    />
  </label>

  {/* Xem trước hình ảnh mới */}
  {newImagePreviews.length > 0 && (
    <div className="new-image-previews">
      <h4>Hình ảnh mới:</h4>
      <div className="image-previews">
        {newImagePreviews.map((img, idx) => (
          <div key={idx} className="image-preview">
            <img src={img} alt={`Hình mới ${idx + 1}`} />
            <button type="button" onClick={() => handleNewImageRemove(idx)}>x</button>
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Nút lưu và hủy */}
  <div className="form-buttons">
    <button type="submit" className="save-button">Lưu</button>
    <button type="button" onClick={onCancel} className="cancel-button">Hủy</button>
  </div>
</form>

    );
  };
  

  export default AddEditRoomForm